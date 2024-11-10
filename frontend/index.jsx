import { OObject } from 'destam-dom';
import { coreClient } from 'web-core/client';
import { Shown, Theme, Typography } from 'destamatic-ui';

import theme from './theme';
import Landing from './pages/Landing';
// import Notifications from './components/Notifications';

const App = ({ state }) => {
    console.log(state);
    state.client = OObject({
        openPage: { page: Landing }
    })
    return <Theme value={theme}>
        {/* <Notifications state={state} /> */}
        <Shown value={state.client.observer.path('openPage')}>
            {state.client.observer.path('openPage').map(p => {
                const Page = p.page;
                if (Page) return <Page {...{ state, ...p.props }} />;
            })}
        </Shown>
    </Theme >
};

const NotFound = () => <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <Typography type='h4'>Not Found 404</Typography>
</div>;

coreClient(App, NotFound);
