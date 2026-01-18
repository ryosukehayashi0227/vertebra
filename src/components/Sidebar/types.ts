export interface DragOverInfo {
    id: string;
    position: 'before' | 'after' | 'inside';
}

export interface ContextMenuInfo {
    x: number;
    y: number;
    targetId: string;
    type: 'file' | 'outline';
}

export type ViewMode = 'files' | 'outline';
