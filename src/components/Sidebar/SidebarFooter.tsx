interface SidebarFooterProps {
    isCollapsed: boolean;
    isSplitView?: boolean;
    onToggleSplitView?: () => void;
    onOpenSettings?: () => void;
    onToggleCollapse: () => void;
}

function SidebarFooter({
    isCollapsed,
    isSplitView,
    onToggleSplitView,
    onOpenSettings,
    onToggleCollapse,
}: SidebarFooterProps) {
    return (
        <div className={`sidebar-footer ${isCollapsed ? 'collapsed' : ''}`}>
            {onToggleSplitView && (
                <button
                    className={`action-btn ${isSplitView ? 'active' : ''}`}
                    onClick={onToggleSplitView}
                    title="Split View"
                >
                    ⏐
                </button>
            )}
            {onOpenSettings && (
                <button
                    className="action-btn"
                    onClick={onOpenSettings}
                    title="Settings"
                >
                    ⚙
                </button>
            )}
            <div style={{ flex: 1 }} />
            <button className="toggle-btn" onClick={onToggleCollapse}>
                {isCollapsed ? '▶' : '◀'}
            </button>
        </div>
    );
}

export default SidebarFooter;
