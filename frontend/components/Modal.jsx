import { Popup } from 'destamatic-ui';


const modals = import.meta.glob('../modals/*.jsx', { eager: true }); // Use 'eager: true' to load all files at once

const Modal = ({ modal }, cleanup) => {
    const escape = (e) => {
        if (e.which === 27) {
            e.preventDefault();
            modal.set(false);
        }
    };

    cleanup(modal.effect(d => {
        if (d && !d.noEsc) {
            window.addEventListener('keydown', escape);
            return () => window.removeEventListener('keydown', escape);
        }
    }));

    return modal.map(m => {
        if (!m) return null;
        if (!modals) return null;

        const matchedPath = Object.keys(modals).find(filePath => {
            const parts = filePath.split('/');
            return parts[parts.length - 1].replace('.jsx', '') === m.name;
        });

        const ModalFunc = modals[matchedPath];
        const Modal = ModalFunc.default;

        return <Popup style={{ inset: 0 }}>
            <div
                style={{
                    background: 'rgba(0, 0, 0, 0.7)',
                    height: '100vh',
                    width: '100vw'
                }}
                onClick={() => modal.set(false)}
            />
            <div style={{
                transform: 'translate(-50%, -50%)',
                position: 'absolute',
                top: '50%',
                left: '50%',
            }}>
                <Modal {...{ state, ...m.props }} />
            </div>
        </Popup>;
    });
};

export default Modal;
