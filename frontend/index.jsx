import { Observer } from 'destam';
import { coreClient } from 'destam-web-core/client';
import { Theme, Icons, popups, Button, Typography } from 'destamatic-ui';

import theme from './theme';
import Modal from './components/Modal';
// import Notifications from './components/Notifications';

let pages = import.meta.glob('./pages/*.jsx', { eager: true }); // Use 'eager: true' to load all files at once
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

const App = ({ state, children }) => {
    state.modal = Observer.mutable(false);
    return <Theme value={theme.theme}>
        <Icons value={theme.icons}>
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
            <Modal state={state} />
            {popups}
        </Icons>
    </Theme>;
};

coreClient({ App, Fallback: NotFound, pages, defaultPage: 'Landing' });
