import { describe, it, expect } from 'vitest';
import { findNodeByContent, normalizeSearchTarget } from './search';
import { OutlineNode } from './outline';

describe('Search Helpers', () => {
    describe('normalizeSearchTarget', () => {
        it('trims whitespace', () => {
            expect(normalizeSearchTarget('  hello  ')).toBe('hello');
        });

        it('lowercases content', () => {
            expect(normalizeSearchTarget('HELLO')).toBe('hello');
        });

        it('handles escaped bullets', () => {
            expect(normalizeSearchTarget('\\- item')).toBe('- item');
            expect(normalizeSearchTarget('  \\- item  ')).toBe('- item');
        });

        it('handles mixed content', () => {
            expect(normalizeSearchTarget('Normal Text')).toBe('normal text');
        });
    });

    describe('findNodeByContent', () => {
        const mockNodes: OutlineNode[] = [
            {
                id: '1',
                text: 'Root Node',
                content: 'Some content',
                level: 0,
                children: [
                    {
                        id: '2',
                        text: 'Child Node',
                        content: '- item list',
                        level: 1,
                        children: []
                    }
                ]
            }
        ];

        it('finds node by text', () => {
            expect(findNodeByContent(mockNodes, 'Root')).toBe('1');
        });

        it('finds node by content', () => {
            expect(findNodeByContent(mockNodes, 'Some content')).toBe('1');
        });

        it('finds nested node', () => {
            expect(findNodeByContent(mockNodes, 'Child')).toBe('2');
        });

        it('finds node with escaped char query', () => {
            // This simulates searching for "\- item" which should match "- item" in content
            expect(findNodeByContent(mockNodes, '\\- item')).toBe('2');
        });

        it('returns null if not found', () => {
            expect(findNodeByContent(mockNodes, 'Nonexistent')).toBeNull();
        });
    });
});
