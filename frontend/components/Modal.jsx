import { Popup, Button, Icon, Typography } from 'destamatic-ui';

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

        // const header = m.props?.header;
        const header = null // TODO: Find a way to add a header within each modal file.

        return <Popup style={{ position: 'fixed', inset: 0 }}>
            <div
                style={{
                    background: 'rgba(0, 0, 0, 0.7)',
                    height: '100vh',
                    width: '100vw',
                }}
                onClick={() => modal.set(false)}
            />
            <div
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                }}
            >
                <div theme='radius' style={{ background: '$color_main', width: 500, height: 500, padding: 20 }}>
                    <div theme='row_end_spread'>
                        <div>
                            {header && typeof (header) === 'string'
                                ? <Typography type='h4' label={header} />
                                : (header ? header : null)}
                        </div>
                        <Button
                            type='icon'
                            onClick={() => modal.set(false)}
                            style={{
                                padding: 0,
                                height: 40,
                                width: 40,
                                borderRadius: 50,
                                flexShrink: 0,
                            }}
                            icon={<Icon size={30} libraryName='feather' iconName='x' />}
                        />
                    </div>
                    <ModalInner {...m.props} />
                </div>
            </div>
        </Popup>;
    });
};

export default Modal;