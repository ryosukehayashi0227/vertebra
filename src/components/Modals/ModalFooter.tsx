import './Modal.css';

interface ModalFooterProps {
    children: React.ReactNode;
    leftContent?: React.ReactNode;
}

export default function ModalFooter({ children, leftContent }: ModalFooterProps) {
    return (
        <footer className="desktop-modal-footer">
            {leftContent && <div className="desktop-modal-footer-left">{leftContent}</div>}
            {children}
        </footer>
    );
}
