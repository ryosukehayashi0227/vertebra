import './Modal.css';

interface ModalWindowProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    width?: string;
}

export default function ModalWindow({ isOpen, onClose, children, width = '480px' }: ModalWindowProps) {
    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="desktop-modal-overlay" onClick={handleOverlayClick}>
            <div className="desktop-modal-window" style={{ width }} onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
}
