import './Modal.css';

interface ModalHeaderProps {
    title: string;
    icon?: React.ReactNode;
    onClose: () => void;
}

export default function ModalHeader({ title, icon, onClose }: ModalHeaderProps) {
    return (
        <header className="desktop-modal-header">
            {icon && <div className="desktop-modal-header-icon">{icon}</div>}
            <h2 className="desktop-modal-title">{title}</h2>
            <button
                className="desktop-modal-close"
                onClick={onClose}
                aria-label="Close"
            >
                ×
            </button>
        </header>
    );
}
