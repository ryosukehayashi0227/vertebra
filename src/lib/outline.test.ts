import { describe, it, expect } from 'vitest';
import {
    parseMarkdownToOutline,
    outlineToMarkdown,
    createNode,
    findNodeById,
    removeNode,
    insertNodeAfter,
    appendChildNode,
    indentNode,
    outdentNode,
    moveNode,
    serializeNodesToText,
    filterNodes,
    type OutlineNode,
} from './outline';

describe('parseMarkdownToOutline', () => {
    it('should parse a simple markdown list', () => {
        const markdown = `- Item 1
- Item 2
- Item 3`;

        const result = parseMarkdownToOutline(markdown);

        expect(result).toHaveLength(3);
        expect(result[0].text).toBe('Item 1');
        expect(result[1].text).toBe('Item 2');
        expect(result[2].text).toBe('Item 3');
        expect(result.every(n => n.level === 0)).toBe(true);
    });

    it('should parse nested markdown lists', () => {
        const markdown = `- Parent
  - Child 1
  - Child 2
- Another Parent`;

        const result = parseMarkdownToOutline(markdown);

        expect(result).toHaveLength(2);
        expect(result[0].text).toBe('Parent');
        expect(result[0].children).toHaveLength(2);
        expect(result[0].children[0].text).toBe('Child 1');
        expect(result[0].children[0].level).toBe(1);
        expect(result[1].text).toBe('Another Parent');
    });

    it('should parse deeply nested lists', () => {
        const markdown = `- Level 0
  - Level 1
    - Level 2
      - Level 3`;

        const result = parseMarkdownToOutline(markdown);

        expect(result).toHaveLength(1);
        expect(result[0].children[0].children[0].children[0].text).toBe('Level 3');
        expect(result[0].children[0].children[0].children[0].level).toBe(3);
    });

    it('should parse content (body text) for nodes', () => {
        const markdown = `- Title
  This is body content
  More body content
- Another Title`;

        const result = parseMarkdownToOutline(markdown);

        expect(result[0].content).toBe('This is body content\nMore body content');
        expect(result[1].content).toBe('');
    });

    it('should unescape \\- to - in body content', () => {
        const markdown = `- Title
  \\- This looks like a list but is body`;

        const result = parseMarkdownToOutline(markdown);

        expect(result[0].content).toBe('- This looks like a list but is body');
    });

    it('should handle empty input', () => {
        const result = parseMarkdownToOutline('');
        expect(result).toHaveLength(0);
    });

    it('should handle nodes with no text', () => {
        const markdown = `- 
  Content only`;

        const result = parseMarkdownToOutline(markdown);
        expect(result[0].text).toBe('');
        expect(result[0].content).toBe('Content only');
    });
});

describe('outlineToMarkdown', () => {
    it('should convert a simple outline to markdown', () => {
        const outline: OutlineNode[] = [
            { id: '1', text: 'Item 1', content: '', level: 0, children: [] },
            { id: '2', text: 'Item 2', content: '', level: 0, children: [] },
        ];

        const result = outlineToMarkdown(outline);

        expect(result).toBe('- Item 1\n- Item 2\n');
    });

    it('should convert nested outlines to markdown with proper indentation', () => {
        const outline: OutlineNode[] = [
            {
                id: '1',
                text: 'Parent',
                content: '',
                level: 0,
                children: [
                    { id: '2', text: 'Child', content: '', level: 1, children: [] },
                ],
            },
        ];

        const result = outlineToMarkdown(outline);

        expect(result).toBe('- Parent\n  - Child\n');
    });

    it('should include body content with proper indentation', () => {
        const outline: OutlineNode[] = [
            { id: '1', text: 'Title', content: 'Body text', level: 0, children: [] },
        ];

        const result = outlineToMarkdown(outline);

        expect(result).toBe('- Title\n  Body text\n');
    });

    it('should escape - at start of body content lines', () => {
        const outline: OutlineNode[] = [
            { id: '1', text: 'Title', content: '- This is body, not a list', level: 0, children: [] },
        ];

        const result = outlineToMarkdown(outline);

        expect(result).toBe('- Title\n  \\- This is body, not a list\n');
    });

    it('should handle multiline content', () => {
        const outline: OutlineNode[] = [
            { id: '1', text: 'Title', content: 'Line 1\nLine 2\nLine 3', level: 0, children: [] },
        ];

        const result = outlineToMarkdown(outline);

        expect(result).toBe('- Title\n  Line 1\n  Line 2\n  Line 3\n');
    });
});

describe('parseMarkdownToOutline and outlineToMarkdown roundtrip', () => {
    it('should preserve simple lists through roundtrip', () => {
        const original = `- Item 1\n- Item 2\n- Item 3\n`;
        const parsed = parseMarkdownToOutline(original);
        const result = outlineToMarkdown(parsed);

        // Parse again to compare structure (IDs will differ)
        const reparsed = parseMarkdownToOutline(result);

        expect(reparsed.length).toBe(parsed.length);
        expect(reparsed[0].text).toBe(parsed[0].text);
    });

    it('should preserve nested lists through roundtrip', () => {
        const original = `- Parent\n  - Child 1\n  - Child 2\n`;
        const parsed = parseMarkdownToOutline(original);
        const result = outlineToMarkdown(parsed);
        const reparsed = parseMarkdownToOutline(result);

        expect(reparsed[0].children.length).toBe(2);
        expect(reparsed[0].children[0].text).toBe('Child 1');
    });

    it('should preserve body content with - through roundtrip', () => {
        const original = `- Title\n  \\- This is body content\n`;
        const parsed = parseMarkdownToOutline(original);

        // Content may have trailing newline from parsing
        expect(parsed[0].content.trim()).toBe('- This is body content');

        const result = outlineToMarkdown(parsed);
        const reparsed = parseMarkdownToOutline(result);

        expect(reparsed[0].content.trim()).toBe('- This is body content');
    });
});

describe('createNode', () => {
    it('should create a node with the given text and level', () => {
        const node = createNode('Test Title', 2);

        expect(node.text).toBe('Test Title');
        expect(node.level).toBe(2);
        expect(node.content).toBe('');
        expect(node.children).toHaveLength(0);
        expect(node.id).toBeTruthy();
    });

    it('should create nodes with unique IDs', () => {
        const node1 = createNode('Node 1', 0);
        const node2 = createNode('Node 2', 0);

        expect(node1.id).not.toBe(node2.id);
    });
});

describe('findNodeById', () => {
    const tree: OutlineNode[] = [
        {
            id: 'root1',
            text: 'Root 1',
            content: '',
            level: 0,
            children: [
                { id: 'child1', text: 'Child 1', content: '', level: 1, children: [] },
                {
                    id: 'child2',
                    text: 'Child 2',
                    content: '',
                    level: 1,
                    children: [
                        { id: 'grandchild1', text: 'Grandchild 1', content: '', level: 2, children: [] },
                    ],
                },
            ],
        },
        { id: 'root2', text: 'Root 2', content: '', level: 0, children: [] },
    ];

    it('should find root level nodes', () => {
        const found = findNodeById(tree, 'root1');
        expect(found?.text).toBe('Root 1');
    });

    it('should find child nodes', () => {
        const found = findNodeById(tree, 'child1');
        expect(found?.text).toBe('Child 1');
    });

    it('should find deeply nested nodes', () => {
        const found = findNodeById(tree, 'grandchild1');
        expect(found?.text).toBe('Grandchild 1');
    });

    it('should return null for non-existent IDs', () => {
        const found = findNodeById(tree, 'nonexistent');
        expect(found).toBeNull();
    });
});

describe('removeNode', () => {
    it('should remove a root level node', () => {
        const tree: OutlineNode[] = [
            { id: '1', text: 'Node 1', content: '', level: 0, children: [] },
            { id: '2', text: 'Node 2', content: '', level: 0, children: [] },
        ];

        const result = removeNode(tree, '1');

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('2');
    });

    it('should remove a nested node', () => {
        const tree: OutlineNode[] = [
            {
                id: '1',
                text: 'Parent',
                content: '',
                level: 0,
                children: [
                    { id: '2', text: 'Child 1', content: '', level: 1, children: [] },
                    { id: '3', text: 'Child 2', content: '', level: 1, children: [] },
                ],
            },
        ];

        const result = removeNode(tree, '2');

        expect(result[0].children).toHaveLength(1);
        expect(result[0].children[0].id).toBe('3');
    });

    it('should return original tree if node not found', () => {
        const tree: OutlineNode[] = [
            { id: '1', text: 'Node 1', content: '', level: 0, children: [] },
        ];

        const result = removeNode(tree, 'nonexistent');

        expect(result).toHaveLength(1);
    });
});

describe('insertNodeAfter', () => {
    it('should insert a node after a specified node at root level', () => {
        const tree: OutlineNode[] = [
            { id: '1', text: 'Node 1', content: '', level: 0, children: [] },
            { id: '3', text: 'Node 3', content: '', level: 0, children: [] },
        ];
        const newNode: OutlineNode = { id: '2', text: 'Node 2', content: '', level: 0, children: [] };

        const result = insertNodeAfter(tree, '1', newNode);

        expect(result).toHaveLength(3);
        expect(result[1].id).toBe('2');
    });
});



describe('appendChildNode', () => {
    it('should add a child to a parent node', () => {
        const tree: OutlineNode[] = [
            { id: '1', text: 'Parent', content: '', level: 0, children: [] },
        ];
        const newChild: OutlineNode = { id: '2', text: 'Child', content: '', level: 1, children: [] };

        const result = appendChildNode(tree, '1', newChild);

        expect(result[0].children).toHaveLength(1);
        expect(result[0].children[0].id).toBe('2');
    });
});

describe('indentNode', () => {
    it('should indent a node to become child of previous sibling', () => {
        const tree: OutlineNode[] = [
            { id: '1', text: 'Node 1', content: '', level: 0, children: [] },
            { id: '2', text: 'Node 2', content: '', level: 0, children: [] },
        ];

        const result = indentNode(tree, '2');

        expect(result).toHaveLength(1);
        expect(result[0].children).toHaveLength(1);
        expect(result[0].children[0].text).toBe('Node 2');
        expect(result[0].children[0].level).toBe(1);
    });

    it('should not indent the first node (no previous sibling)', () => {
        const tree: OutlineNode[] = [
            { id: '1', text: 'Node 1', content: '', level: 0, children: [] },
            { id: '2', text: 'Node 2', content: '', level: 0, children: [] },
        ];

        const result = indentNode(tree, '1');

        // Should return unchanged tree
        expect(result).toHaveLength(2);
    });
});

describe('outdentNode', () => {
    it('should outdent a node to become sibling of parent', () => {
        const tree: OutlineNode[] = [
            {
                id: '1',
                text: 'Parent',
                content: '',
                level: 0,
                children: [
                    { id: '2', text: 'Child', content: '', level: 1, children: [] },
                ],
            },
        ];

        const result = outdentNode(tree, '2');

        expect(result).toHaveLength(2);
        expect(result[1].text).toBe('Child');
        expect(result[1].level).toBe(0);
        expect(result[0].children).toHaveLength(0);
    });

    it('should not outdent root level nodes', () => {
        const tree: OutlineNode[] = [
            { id: '1', text: 'Root', content: '', level: 0, children: [] },
        ];

        const result = outdentNode(tree, '1');

        expect(result).toHaveLength(1);
        expect(result[0].level).toBe(0);
    });
});

describe('moveNode', () => {
    const createTree = (): OutlineNode[] => [
        { id: '1', text: 'Node 1', content: '', level: 0, children: [] },
        { id: '2', text: 'Node 2', content: '', level: 0, children: [] },
        { id: '3', text: 'Node 3', content: '', level: 0, children: [] },
    ];

    describe('position: before', () => {
        it('should move node before target at root level', () => {
            const tree = createTree();
            const result = moveNode(tree, '3', '1', 'before');

            expect(result[0].id).toBe('3');
            expect(result[1].id).toBe('1');
            expect(result[2].id).toBe('2');
        });
    });

    describe('position: after', () => {
        it('should move node after target at root level', () => {
            const tree = createTree();
            const result = moveNode(tree, '1', '3', 'after');

            expect(result[0].id).toBe('2');
            expect(result[1].id).toBe('3');
            expect(result[2].id).toBe('1');
        });
    });

    describe('position: inside', () => {
        it('should move node inside target as child', () => {
            const tree = createTree();
            const result = moveNode(tree, '2', '1', 'inside');

            expect(result).toHaveLength(2);
            expect(result[0].children).toHaveLength(1);
            expect(result[0].children[0].id).toBe('2');
            expect(result[0].children[0].level).toBe(1);
        });
    });

    describe('invalid moves', () => {
        it('should not move node onto itself', () => {
            const tree = createTree();
            const result = moveNode(tree, '1', '1', 'inside');

            expect(result).toEqual(tree);
        });

        it('should not move parent into its own descendant', () => {
            const tree: OutlineNode[] = [
                {
                    id: '1',
                    text: 'Parent',
                    content: '',
                    level: 0,
                    children: [
                        { id: '2', text: 'Child', content: '', level: 1, children: [] },
                    ],
                },
            ];

            const result = moveNode(tree, '1', '2', 'inside');

            // Should return unchanged tree
            expect(result[0].id).toBe('1');
            expect(result[0].children[0].id).toBe('2');
        });
    });

    describe('nested moves', () => {
        it('should move nested node to root level', () => {
            const tree: OutlineNode[] = [
                {
                    id: '1',
                    text: 'Parent',
                    content: '',
                    level: 0,
                    children: [
                        { id: '2', text: 'Child', content: '', level: 1, children: [] },
                    ],
                },
                { id: '3', text: 'Node 3', content: '', level: 0, children: [] },
            ];

            const result = moveNode(tree, '2', '3', 'after');

            expect(result).toHaveLength(3);
            expect(result[0].children).toHaveLength(0);
            expect(result[2].id).toBe('2');
            expect(result[2].level).toBe(0);
        });

        it('should move node into nested target', () => {
            const tree: OutlineNode[] = [
                {
                    id: '1',
                    text: 'Parent',
                    content: '',
                    level: 0,
                    children: [
                        { id: '2', text: 'Child', content: '', level: 1, children: [] },
                    ],
                },
                { id: '3', text: 'Node 3', content: '', level: 0, children: [] },
            ];

            const result = moveNode(tree, '3', '2', 'inside');

            expect(result).toHaveLength(1);
            expect(result[0].children[0].children).toHaveLength(1);
            expect(result[0].children[0].children[0].id).toBe('3');
            expect(result[0].children[0].children[0].level).toBe(2);
        });
    });
});

describe('serializeNodesToText', () => {
    it('should serialize nodes with correct indentation', () => {
        const nodes: OutlineNode[] = [
            {
                id: '1', text: 'Root', content: '', level: 0, children: [
                    { id: '2', text: 'Child 1', content: '', level: 1, children: [] },
                    {
                        id: '3', text: 'Child 2', content: 'Body line 1\nBody line 2', level: 1, children: [
                            { id: '4', text: 'Grandchild', content: '', level: 2, children: [] }
                        ]
                    }
                ]
            }
        ];

        // Should use relative indentation if baseLevel is correct (0)
        const result = serializeNodesToText(nodes, "\t", 0);
        // Root (0 indent) -> Child (1 indent) -> Child Body (2 indent) -> Grandchild (2 indent)
        const expected = "Root\n\tChild 1\n\tChild 2\n\t\tBody line 1\n\t\tBody line 2\n\t\tGrandchild\n";
        expect(result).toBe(expected);
    });

    it('should respect baseLevel for partial tree copy', () => {
        const nodes: OutlineNode[] = [
            { id: '3', text: 'Child 2', content: '', level: 1, children: [] }
        ];

        // baseLevel 1 means Child 2 (level 1) should start at indent 0
        const result = serializeNodesToText(nodes, "\t", 1);
        expect(result).toBe("Child 2\n");
    });
});

describe('filterNodes', () => {
    const tree: OutlineNode[] = [
        {
            id: '1', text: 'Section A', content: '', level: 0, children: [
                { id: '2', text: 'Item', content: 'Secret detail', level: 1, children: [] },
                { id: '3', text: 'Hidden', content: '', level: 1, children: [] }
            ]
        },
        {
            id: '4', text: 'Section B', content: '', level: 0, children: [
                {
                    id: '5', text: 'Sub B', content: '', level: 1, children: [
                        { id: '6', text: 'Target', content: '', level: 2, children: [] }
                    ]
                }
            ]
        }
    ];

    it('should match node by text', () => {
        const { visibleIds, matchedIds } = filterNodes(tree, 'Section A');
        expect(visibleIds.has('1')).toBe(true);
        expect(visibleIds.has('4')).toBe(false);
        expect(matchedIds.has('1')).toBe(true);
    });

    it('should match node by content', () => {
        const { visibleIds, matchedIds } = filterNodes(tree, 'Secret');
        // '2' matches content. '1' is ancestor.
        expect(visibleIds.has('2')).toBe(true);
        expect(visibleIds.has('1')).toBe(true);
        expect(matchedIds.has('2')).toBe(true);
        expect(matchedIds.has('1')).toBe(false);
        expect(visibleIds.has('3')).toBe(false);
    });

    it('should include ancestors of matching node', () => {
        const { visibleIds } = filterNodes(tree, 'Target');
        // '6' matches. '5' is parent, '4' is grandparent.
        expect(visibleIds.has('6')).toBe(true);
        expect(visibleIds.has('5')).toBe(true);
        expect(visibleIds.has('4')).toBe(true);
        expect(visibleIds.has('1')).toBe(false);
    });

    it('should return all visible nodes if query matches root and child', () => {
        const { visibleIds } = filterNodes(tree, 'Section');
        // '1' and '4' match.
        expect(visibleIds.has('1')).toBe(true);
        expect(visibleIds.has('4')).toBe(true);
    });

    it('should be case insensitive', () => {
        const { visibleIds } = filterNodes(tree, 'target');
        expect(visibleIds.has('6')).toBe(true);
    });
});
