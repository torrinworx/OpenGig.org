import { Observer } from 'destam';
import { core } from 'destam-web-core/client';
import {
    ThemeContext,
    Theme,
    Icons,
    Icon,
    popups,
    Button,
    Typography,
    ModalContext,
    Modal,
    Popup,
    Paper
} from 'destamatic-ui';

import theme from './theme';
// import Notifications from './components/Notifications';

let modals = import.meta.glob('./modals/**/*.jsx', { eager: true });

modals = Object.fromEntries(
    Object.entries(modals).map(([filePath, component]) => {
        const pathWithoutExtension = filePath
            .replace('./modals/', '')
            .replace('.jsx', '');
        return [pathWithoutExtension, component.default];
    })
);

let pages = import.meta.glob('./pages/*.jsx', { eager: true });
pages = Object.fromEntries(
    Object.entries(pages)
        .map(([filePath, value]) => [
            filePath.split('/').pop().replace('.jsx', ''),
            value
        ])
);

const NotFound = ({ state }) => <div theme='page_column_center' style={{ height: '100vh' }}>
    <Typography type='h4' label='404 Page Not Found' />
    <Typography type='p1' label='The page you are trying to access is either unavailable or restricted.' />
    <Button
        type='contained'
        label='Return to Site'
        onMouseDown={() => state.client.openPage = { name: "Landing" }}
    />
</div>;

const Template = ThemeContext.use(h => ({ m, children }, cleanup, mounted) => {
    const shown = Observer.mutable(false);

    const handleEscape = (e) => {
        if (e.which === 27) {
            e.preventDefault();
            m.current = false;
        }
    };

    mounted(() => {
        queueMicrotask(() => {
            setTimeout(() => shown.set(true), 10);
        });

        if (!m.noEsc) {
            window.addEventListener('keydown', handleEscape);
            cleanup(() => {
                window.removeEventListener('keydown', handleEscape);
            });
        }
    });

    cleanup(m.closeSignal.watch(() => {
        shown.set(!m.closeSignal.get());
    }));

    return <Popup style={{
        inset: 0,
        transition: `opacity ${m.currentDelay}ms ease-in-out`,
        opacity: shown.map(shown => shown ? 1 : 0),
        pointerEvents: shown.map(shown => shown ? null : 'none'),
    }}>
        <div theme='modalOverlay'
            onClick={() => !m.props.noClickEsc ? m.close() : null} />
        <div theme='modalWrapper'>
            <Paper>
                <div theme='row_spread'>
                    <Typography
                        type='h2'
                        label={m.observer.path(['props', 'label'])
                            .map(l => l ? l : '')}
                    />
                    <Button
                        type='icon'
                        icon={<Icon name='x' size={30} />}
                        onClick={() => m.close()}
                    />
                </div>
                {children}
            </Paper>
        </div>
    </Popup>;
});

const App = ({ state, children }) => {
    state.modal = Observer.mutable(false);
    return <Theme value={theme.theme}>
        <Icons value={theme.icons}>
            <ModalContext value={{ modals, state, template: Template }}>
                <link
                    rel="icon"
                    href={window.themeMode.map(t =>
                        t === 'light'
                            ? "./OpenGig_Icon_Round_Light_Mode.svg"
                            : "./OpenGig_Icon_Round_Dark_Mode.svg"
                    )}
                    sizes="any"
                    type="image/svg+xml"
                />
                {/* <Notifications state={state} /> */}
                {children}
                <Modal />
                {popups}
            </ModalContext>
        </Icons>
    </Theme>;
};

core({ App, Fallback: NotFound, pages, defaultPage: 'Landing' });
