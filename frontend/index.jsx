import { coreClient } from 'destam-web-core/client';
import { Button, Theme, Typography } from 'destamatic-ui';

import theme from './theme';
import Notifications from './components/Notifications';

const pages = import.meta.glob('./pages/*.jsx', { eager: true }); // Use 'eager: true' to load all files at once

const NotFound = () => <Theme value={theme}>
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
            const fileName = parts[parts.length - 1].replace('.jsx', '');
            return fileName === p.page;
        });

        if (matchedPath) {
            const PageFunc = pages[matchedPath];
            const Page = PageFunc.default;
            return <Page {...{ state, ...p.props }} />;
        }

        return <NotFound />;
    })
};

const App = ({ state }) => <Theme value={theme}>
    <Notifications state={state} />
    <div theme='wide_center' style={{ background: 'red' }}> Warning: This is a beta, any accounts you make will potentially be deleted and are not guaranteed to be permanent.</div>

    <Pages state={state} />
</Theme>;

coreClient(App, NotFound);
