import { useLanguage } from '../../contexts/LanguageContext';

interface ContextMenuProps {
    x: number;
    y: number;
    targetId: string;
    type: 'file' | 'outline';
    onClose: () => void;
    onDeleteFile: (path: string) => void;
    onCopyAsText: (nodeId: string) => void;
    onIndent: (nodeId: string) => void;
    onOutdent: (nodeId: string) => void;
    onDeleteNode: (nodeId: string) => void;
    onOpenInSecondaryPane?: (nodeId: string) => void;
}

function ContextMenu({
    x,
    y,
    targetId,
    type,
    onClose,
    onDeleteFile,
    onCopyAsText,
    onIndent,
    onOutdent,
    onDeleteNode,
    onOpenInSecondaryPane,
}: ContextMenuProps) {
    const { t } = useLanguage();

    const menuStyle: React.CSSProperties = {
        left: x,
        top: y,
        position: 'fixed',
        zIndex: 1000,
        backgroundColor: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)',
        borderRadius: '6px',
        padding: '4px',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        minWidth: '160px',
    };

    const buttonStyle: React.CSSProperties = {
        textAlign: 'left',
        padding: '6px 12px',
        border: 'none',
        background: 'none',
        color: 'var(--color-text-primary)',
        cursor: 'pointer',
    };

    const deleteButtonStyle: React.CSSProperties = {
        ...buttonStyle,
        color: '#ff4d4f',
    };

    const dividerStyle: React.CSSProperties = {
        height: '1px',
        background: 'var(--color-border)',
        margin: '4px 0',
    };

    if (type === 'file') {
        return (
            <div className="context-menu" style={menuStyle}>
                <button
                    style={deleteButtonStyle}
                    onClick={() => {
                        onDeleteFile(targetId);
                        onClose();
                    }}
                >
                    削除
                </button>
            </div>
        );
    }

    return (
        <div className="context-menu" style={menuStyle}>
            <button style={buttonStyle} onClick={() => onCopyAsText(targetId)}>
                {t('sidebar.copyAsText')}
            </button>

            <div style={dividerStyle} />

            <button
                style={buttonStyle}
                onClick={() => {
                    onIndent(targetId);
                    onClose();
                }}
            >
                インデント (Tab)
            </button>
            <button
                style={buttonStyle}
                onClick={() => {
                    onOutdent(targetId);
                    onClose();
                }}
            >
                アウトデント (Shift+Tab)
            </button>

            <div style={dividerStyle} />

            <button style={deleteButtonStyle} onClick={() => onDeleteNode(targetId)}>
                {t('sidebar.deleteNode')}
            </button>

            {onOpenInSecondaryPane && (
                <>
                    <div style={dividerStyle} />
                    <button
                        style={buttonStyle}
                        onClick={() => {
                            onOpenInSecondaryPane(targetId);
                            onClose();
                        }}
                    >
                        右側で開く
                    </button>
                </>
            )}
        </div>
    );
}

export default ContextMenu;
