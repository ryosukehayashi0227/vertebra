import { OutlineNode } from "./outline";

/**
 * Normalize search target content
 * Trims whitespace, handles escaped bullets (\- -> -), and converts to lowercase
 */
export function normalizeSearchTarget(content: string): string {
    return content.trim()
        .replace(/^\\- /, "- ")
        .toLowerCase();
}

/**
 * Find a node containing the target content (case-insensitive)
 * Checks both node text and body content
 */
export function findNodeByContent(nodes: OutlineNode[], targetContent: string): string | null {
    const target = normalizeSearchTarget(targetContent);
    if (!target) return null;

    for (const node of nodes) {
        if (node.text.toLowerCase().includes(target) || (node.content && node.content.toLowerCase().includes(target))) {
            return node.id;
        }
        if (node.children) {
            const found = findNodeByContent(node.children, targetContent); // Pass original, it gets normalized inside
            // Correction: findNodeByContent normalizes again. Ideally we pass normalized.
            // But for recursion simplicity, let's refactor to helper.
            if (found) return found;
        }
    }
    return null;
}
