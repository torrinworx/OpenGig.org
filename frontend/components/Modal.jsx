import { Popup } from 'destamatic-ui';


const modals = import.meta.glob('../modals/*.jsx', { eager: true }); // Use 'eager: true' to load all files at once

const Modal = ({ modal }, cleanup) => {
    const escape = (e) => {
        if (e.which === 27) {
            e.preventDefault();
            modal.set(false);
        }
    };

    cleanup(modal.effect(current => {
        // If the modal is open, wire up the escape handler + disable scroll;
        // undo it when modal closes.
        if (current) {
            // Disable body scroll:
            const oldOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';

            // Optional: listen for escape-press, unless explicitly prevented
            if (!current.noEsc) {
                window.addEventListener('keydown', escape);
            }

            // Return a cleanup function that reverts everything
            return () => {
                document.body.style.overflow = oldOverflow;
                if (!current.noEsc) {
                    window.removeEventListener('keydown', escape);
                }
            };
        }
    }));

    return modal.map(m => {
        // No modal is open
        if (!m || !modals) return null;

        // Figure out which file to load (from import.meta.glob)
        const matchedPath = Object.keys(modals).find(filePath => {
            const parts = filePath.split('/');
            return parts[parts.length - 1].replace('.jsx', '') === m.name;
        });
        if (!matchedPath) return null;

        const ModalFunc = modals[matchedPath];
        const ModalInner = ModalFunc.default;

        return <Popup style={{ inset: 0 }}>
            <div
                style={{
                    background: 'rgba(0, 0, 0, 0.7)',
                    height: '100vh',
                    width: '100vw',
                }}
                onClick={() => modal.set(false)}
            />
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
            }}>
                <ModalInner {...m.props} />
            </div>
        </Popup>;
    });
};

export default Modal;
