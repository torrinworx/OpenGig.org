import { Observer } from 'destam';
import { coreClient } from 'destam-web-core/client';
import { popups, Button, Theme, Typography } from 'destamatic-ui';

import theme from './theme';
import Modal from './components/Modal';
import Notifications from './components/Notifications';

const pages = import.meta.glob('./pages/*.jsx', { eager: true }); // Use 'eager: true' to load all files at once

const NotFound = () => <Theme value={theme.theme}>
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography type='h4' style={{ marginBottom: '20px' }}>404 Page Not Found</Typography>
        <Typography type='p1' style={{ marginBottom: '20px' }}>The page you are trying to access is either unavailable or restricted.</Typography>
        <Button
            type='contained'
            label='Return to Site'
            onMouseDown={() => {
                state.client.observer.path('openPage').set({ page: "Landing" });
                if (window.location.pathname !== '/') {
                    window.location.href = '/';
                }
            }}
        />
    </div>
</Theme>;

// Pages, openPage helps avoid circular import issues when trying to just simply set the page on a button click.
const Pages = ({ state }) => {
    const openPage = state.client.observer.path('openPage');

    return openPage.map(p => {
        const matchedPath = Object.keys(pages).find(filePath => {
            const parts = filePath.split('/');
            return parts[parts.length - 1].replace('.jsx', '') === p.page;
        });

        if (matchedPath) {
            const PageFunc = pages[matchedPath];
            const Page = PageFunc.default;
            return <Page {...{ state, ...p.props }} />;
        }

        return <NotFound />;
    })
};

const App = ({ state }) => {
    state.modal = Observer.mutable(false);

    return <Theme value={theme.theme}>

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
        <Notifications state={state} />
        <Pages theme='page' state={state} />
        <Modal {...state} />
        {popups}
    </Theme>;
};

coreClient(App, NotFound);
