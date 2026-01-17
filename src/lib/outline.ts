export interface OutlineNode {
    id: string;
    text: string;
    content: string;
    level: number;
    children: OutlineNode[];
    collapsed?: boolean;
}

let nodeIdCounter = 0;

/**
 * Generate a unique ID for outline nodes
 */
function generateId(): string {
    return `node_${Date.now()}_${nodeIdCounter++}`;
}

/**
 * Parse markdown content into an outline tree structure
 * 
 * Format:
 * - Node Title
 *   Body content (indented by node's level + 1)
 *   More body content
 *   - Child Node (at same base indent as body, but starts with "- ")
 */
export function parseMarkdownToOutline(content: string): OutlineNode[] {
    const lines = content.split("\n");
    const rootNodes: OutlineNode[] = [];
    const stack: { level: number; node: OutlineNode }[] = [];
    let lastNode: OutlineNode | null = null;

    for (const line of lines) {
        // Match lines that start with optional whitespace, then "- "
        const bulletMatch = line.match(/^(\s*)-\s+(.*)$/);

        if (bulletMatch) {
            const indent = bulletMatch[1].length;
            const level = Math.floor(indent / 2);
            const text = bulletMatch[2];

            // Determine if this is a child node or body content
            // A child node has level = parent.level + 1
            // Body content would be at indent = (parent.level + 1) * 2, which means level = parent.level + 1
            // The key difference: body content lines that start with "- " are at deeper indent

            // If we have a lastNode and this line's indent level is greater than expected for a child,
            // treat it as body content
            if (lastNode) {
                const expectedChildIndent = (lastNode.level + 1) * 2;
                const expectedBodyIndent = expectedChildIndent;

                // If this is body content (same indent as body lines should be)
                // and the previous node would expect children at level+1,
                // we need to check: is this a sibling/child node or body content?
                // 
                // Heuristic: if indent equals expectedChildIndent and looks like a list item,
                // it's a child node. Otherwise it's body content.
                // 
                // Actually, the issue is more nuanced. Let me reconsider:
                // - Parent at level 0, indent 0
                // - Child at level 1, indent 2
                // - Body of child is at indent 4
                // 
                // So if we have "- item" at the same indent as expected body (4), it's ambiguous.
                // The safest fix: only treat "- " as a node if it's at the expected node indent.

                // If the line is indented MORE than expected for a child node, it's body content
                if (indent > expectedChildIndent) {
                    // This is body content with a "- " prefix - don't treat as new node
                    const contentLine = line.substring(expectedBodyIndent) || line.trimStart();
                    if (lastNode.content) {
                        lastNode.content += "\n" + contentLine;
                    } else {
                        lastNode.content = contentLine;
                    }
                    continue;
                }
            }

            const newNode: OutlineNode = {
                id: generateId(),
                text,
                content: "",
                level,
                children: [],
            };

            // Find parent node
            while (stack.length > 0 && stack[stack.length - 1].level >= level) {
                stack.pop();
            }

            if (stack.length === 0) {
                rootNodes.push(newNode);
            } else {
                stack[stack.length - 1].node.children.push(newNode);
            }

            stack.push({ level, node: newNode });
            lastNode = newNode;
        } else if (lastNode) {
            // Non-bullet line - append to current node's content
            const nodeIndent = "  ".repeat(lastNode.level + 1);
            let contentLine = line;
            if (line.startsWith(nodeIndent)) {
                contentLine = line.substring(nodeIndent.length);
            } else {
                contentLine = line.trimStart();
            }

            // Unescape escaped list markers
            contentLine = contentLine.replace(/^\\- /, "- ");

            if (lastNode.content) {
                lastNode.content += "\n" + contentLine;
            } else {
                lastNode.content = contentLine;
            }
        }
    }

    return rootNodes;
}

/**
 * Convert outline tree back to markdown format
 */
export function outlineToMarkdown(nodes: OutlineNode[], baseIndent = 0): string {
    let result = "";

    for (const node of nodes) {
        const indent = "  ".repeat(baseIndent);
        result += `${indent}- ${node.text}\n`;

        if (node.content) {
            const contentIndent = "  ".repeat(baseIndent + 1);
            const contentLines = node.content.split("\n");
            for (const cLine of contentLines) {
                // Escape lines that start with "- " to prevent them from being parsed as nodes
                const escapedLine = cLine.replace(/^- /, "\\- ");
                result += `${contentIndent}${escapedLine}\n`;
            }
        }

        if (node.children.length > 0) {
            result += outlineToMarkdown(node.children, baseIndent + 1);
        }
    }

    return result;
}

/**
 * Find a node by ID in the tree
 */
export function findNodeById(
    nodes: OutlineNode[],
    id: string
): OutlineNode | null {
    for (const node of nodes) {
        if (node.id === id) return node;
        const found = findNodeById(node.children, id);
        if (found) return found;
    }
    return null;
}

/**
 * Find parent of a node by ID
 */
export function findParentOfNode(
    nodes: OutlineNode[],
    id: string,
    parent: OutlineNode | null = null
): { parent: OutlineNode | null; index: number } | null {
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === id) {
            return { parent, index: i };
        }
        const found = findParentOfNode(nodes[i].children, id, nodes[i]);
        if (found) return found;
    }
    return null;
}

/**
 * Remove a node from the tree
 */
export function removeNode(nodes: OutlineNode[], id: string): OutlineNode[] {
    return nodes
        .filter((node) => node.id !== id)
        .map((node) => ({
            ...node,
            children: removeNode(node.children, id),
        }));
}

/**
 * Insert a node after another node
 */
export function insertNodeAfter(
    nodes: OutlineNode[],
    afterId: string,
    newNode: OutlineNode
): OutlineNode[] {
    const result: OutlineNode[] = [];

    for (const node of nodes) {
        result.push({
            ...node,
            children: insertNodeAfter(node.children, afterId, newNode),
        });

        if (node.id === afterId) {
            result.push(newNode);
        }
    }

    return result;
}

/**
 * Append a node as a child of another node
 */
export function appendChildNode(
    nodes: OutlineNode[],
    parentId: string,
    newNode: OutlineNode
): OutlineNode[] {
    return nodes.map((node) => {
        if (node.id === parentId) {
            return {
                ...node,
                children: [...node.children, newNode],
            };
        }
        return {
            ...node,
            children: appendChildNode(node.children, parentId, newNode),
        };
    });
}

/**
 * Create a new empty node
 */
export function createNode(text = "", level = 0): OutlineNode {
    return {
        id: generateId(),
        text,
        content: "",
        level,
        children: [],
    };
}

/**
 * Helper to recursively shift levels of a node and its children
 */
function shiftLevels(node: OutlineNode, delta: number): OutlineNode {
    return {
        ...node,
        level: Math.max(0, node.level + delta),
        children: node.children.map(child => shiftLevels(child, delta))
    };
}

/**
 * Move a node into the children of its previous sibling
 */
export function indentNode(nodes: OutlineNode[], id: string): OutlineNode[] {
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === id) {
            if (i === 0) return nodes; // Cannot indent first node

            const targetNode = nodes[i];
            const prevSibling = nodes[i - 1];

            const newNodes = [...nodes];
            newNodes.splice(i, 1);
            newNodes[i - 1] = {
                ...prevSibling,
                children: [...prevSibling.children, shiftLevels(targetNode, 1)],
            };
            return newNodes;
        }

        const newChildren = indentNode(nodes[i].children, id);
        if (newChildren !== nodes[i].children) {
            const newNodes = [...nodes];
            newNodes[i] = { ...nodes[i], children: newChildren };
            return newNodes;
        }
    }
    return nodes;
}

/**
 * Move a node to be a sibling of its parent
 */
export function outdentNode(nodes: OutlineNode[], id: string): OutlineNode[] {
    for (let i = 0; i < nodes.length; i++) {
        const children = nodes[i].children;
        for (let j = 0; j < children.length; j++) {
            if (children[j].id === id) {
                const targetNode = children[j];
                const newChildren = [...children];
                newChildren.splice(j, 1);

                const newNodes = [...nodes];
                newNodes[i] = { ...nodes[i], children: newChildren };
                newNodes.splice(i + 1, 0, shiftLevels(targetNode, -1));
                return newNodes;
            }

            const result = outdentNode(children, id);
            if (result !== children) {
                const newNodes = [...nodes];
                newNodes[i] = { ...nodes[i], children: result };
                return newNodes;
            }
        }
    }
    return nodes;
}
/**
 * Move a node to a new location in the tree
 */
export function moveNode(
    nodes: OutlineNode[],
    sourceId: string,
    targetId: string | null,
    position: 'before' | 'after' | 'inside'
): OutlineNode[] {
    // 1. Find the source node
    const sourceData = findNodeByIdWithParent(nodes, sourceId);
    if (!sourceData) {
        console.warn("[moveNode] Source node not found:", sourceId);
        return nodes;
    }
    const { node: sourceNode } = sourceData;

    // 2. Prevent moving to self or own descendant
    if (targetId && (sourceId === targetId || isDescendantOf(sourceNode, targetId))) {
        console.warn("[moveNode] Invalid move: Cannot drop onto self or descendant");
        return nodes;
    }

    // 3. Remove source node from its current position
    let treeWithoutSource = removeNode(nodes, sourceId);

    // 4. If no target, add to end of top level
    if (targetId === null) {
        return [...treeWithoutSource, shiftLevelsTo(sourceNode, 0)];
    }

    // 5. Handle top-level target
    const topTargetIndex = treeWithoutSource.findIndex(n => n.id === targetId);
    if (topTargetIndex !== -1) {
        const targetNode = treeWithoutSource[topTargetIndex];

        if (position === 'before') {
            const newTree = [...treeWithoutSource];
            newTree.splice(topTargetIndex, 0, shiftLevelsTo(sourceNode, 0));
            return newTree;
        } else if (position === 'after') {
            const newTree = [...treeWithoutSource];
            newTree.splice(topTargetIndex + 1, 0, shiftLevelsTo(sourceNode, 0));
            return newTree;
        } else { // 'inside'
            const newTree = [...treeWithoutSource];
            newTree[topTargetIndex] = {
                ...targetNode,
                children: [...targetNode.children, shiftLevelsTo(sourceNode, targetNode.level + 1)]
            };
            return newTree;
        }
    }

    // 6. Target is nested - use recursive insertion
    const insertIntoNested = (currentNodes: OutlineNode[]): OutlineNode[] => {
        return currentNodes.map(node => {
            // Check if target is a direct child of this node
            const childIndex = node.children.findIndex(c => c.id === targetId);
            if (childIndex !== -1) {
                const targetChild = node.children[childIndex];
                const newChildren = [...node.children];

                if (position === 'before') {
                    newChildren.splice(childIndex, 0, shiftLevelsTo(sourceNode, node.level + 1));
                } else if (position === 'after') {
                    newChildren.splice(childIndex + 1, 0, shiftLevelsTo(sourceNode, node.level + 1));
                } else { // 'inside'
                    newChildren[childIndex] = {
                        ...targetChild,
                        children: [...targetChild.children, shiftLevelsTo(sourceNode, targetChild.level + 1)]
                    };
                }
                return { ...node, children: newChildren };
            }

            // Recurse into children
            return { ...node, children: insertIntoNested(node.children) };
        });
    };

    return insertIntoNested(treeWithoutSource);
}

/**
 * Helper to find node and its parent
 */
function findNodeByIdWithParent(
    nodes: OutlineNode[],
    id: string
): { node: OutlineNode; parentId: string | null } | null {
    for (const node of nodes) {
        if (node.id === id) return { node, parentId: null };
        const found = findInChildren(node.children, id, node.id);
        if (found) return found;
    }
    return null;
}

function findInChildren(nodes: OutlineNode[], id: string, parentId: string): { node: OutlineNode; parentId: string } | null {
    for (const node of nodes) {
        if (node.id === id) return { node, parentId };
        const found = findInChildren(node.children, id, node.id);
        if (found) return found;
    }
    return null;
}

/**
 * Helper to recursively set level of a node and its children
 */
function shiftLevelsTo(node: OutlineNode, targetLevel: number): OutlineNode {
    const delta = targetLevel - node.level;
    return shiftLevels(node, delta);
}

/**
 * Helper to check if a targetId is a descendant of a given node
 */
function isDescendantOf(root: OutlineNode, targetId: string): boolean {
    for (const child of root.children) {
        if (child.id === targetId) return true;
        if (isDescendantOf(child, targetId)) return true;
    }
    return false;
}

/**
 * Convert outline nodes to plain text with indentation
 * Used for "Copy as Text" functionality
 */
export function serializeNodesToText(nodes: OutlineNode[], indentChar: string = "\t", baseLevel: number = 0): string {
    let result = "";
    for (const node of nodes) {
        // Calculate indent relative to the base level
        const relativeLevel = Math.max(0, node.level - baseLevel);
        const indent = indentChar.repeat(relativeLevel);

        result += `${indent}${node.text}\n`;

        // Include body content, indented one level deeper
        if (node.content) {
            const contentIndent = indentChar.repeat(relativeLevel + 1);
            const lines = node.content.split('\n');
            for (const line of lines) {
                result += `${contentIndent}${line}\n`;
            }
        }

        if (node.children.length > 0) {
            result += serializeNodesToText(node.children, indentChar, baseLevel);
        }
    }
    return result;
}

/**
 * Filter nodes based on a search query
 * Returns a set of visible IDs and matched IDs
 */
export function filterNodes(nodes: OutlineNode[], query: string): { visibleIds: Set<string>, matchedIds: Set<string> } {
    const visibleIds = new Set<string>();
    const matchedIds = new Set<string>();
    const lowerQuery = query.toLowerCase();

    function recurse(node: OutlineNode): boolean {
        let isMatch = node.text.toLowerCase().includes(lowerQuery);
        if (!isMatch && node.content) {
            isMatch = node.content.toLowerCase().includes(lowerQuery);
        }

        if (isMatch) {
            matchedIds.add(node.id);
        }

        let hasVisibleChild = false;
        for (const child of node.children) {
            if (recurse(child)) {
                hasVisibleChild = true;
            }
        }

        // If this node matches or has a visible child, mark it as visible
        if (isMatch || hasVisibleChild) {
            visibleIds.add(node.id);
            return true;
        }

        return false;
    }

    nodes.forEach(node => recurse(node));
    return { visibleIds, matchedIds };
}

/**
 * Count statistics (characters and words) for a given text and content
 */
export function countStats(text: string, content: string): { chars: number, words: number } {
    const combined = (text + " " + content).trim();
    if (!combined) return { chars: 0, words: 0 };

    // For Japanese/Chinese, character count is often more important.
    // For English, word count is standard.
    // We provide both.
    const chars = combined.length;

    // Basic word count logic: split by whitespace and filter out empty strings
    // This isn't perfect for all languages but works well for English.
    const words = combined.split(/\s+/).filter(w => w.length > 0).length;

    return { chars, words };
}

/**
 * Calculate total statistics for an entire outline tree
 */
export function calculateTotalStats(nodes: OutlineNode[]): { chars: number, words: number } {
    let totalChars = 0;
    let totalWords = 0;

    function recurse(node: OutlineNode) {
        const stats = countStats(node.text, node.content);
        totalChars += stats.chars;
        totalWords += stats.words;
        node.children.forEach(recurse);
    }

    nodes.forEach(recurse);
    return { chars: totalChars, words: totalWords };
}
