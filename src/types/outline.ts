export interface OutlineNode {
    id: string;
    text: string;
    content: string;
    level: number;
    children: OutlineNode[];
    collapsed?: boolean;
}
