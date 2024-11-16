import { OObject, Observer } from 'destam-dom';
import { coreClient, jobRequest, getCookie } from 'web-core/client';
import { Theme, Typography } from 'destamatic-ui';

import theme from './theme';
import Auth from './components/Auth';
import Landing from './pages/Landing';
// import Notifications from './components/Notifications';

const Pages = ({ state }) => {
    const pages = import.meta.glob('./pages/*.jsx');

    return state.client.observer.path('openPage').map(p => {
        const matchedPath = Object.keys(pages).find(filePath => {
            const parts = filePath.split('/');
            const fileName = parts[parts.length - 1].replace('.jsx', '');
            return fileName === p.page;
        });
        console.log(matchedPath)
        console.log(pages)
        if (matchedPath) {
            const Page = pages[matchedPath];
            console.log(Page);
            return <Page {...{state, ...p.props}}/> 
        } else return null // Might want to throw error that this component wasn't found
    });
};

const App = ({ state }) => {

    state.client = OObject({
        authenticated: false,
        openPage: { page: "Landing" }
    })

    const token = getCookie('webCore') || '';
    if (token) {
        (async () => await jobRequest('sync'))();
        state.client.observer.path('openPage').set({ page: "Auth" })
        state.client.observer.path('authenticated').set(true)

    };

    // Observer.timer(500).watch(() => {
    //     const openPage = state.client.observer.path('openPage')
    //     console.log(openPage.get().page)
    //     if (openPage.get().page === 'Landing') {
    //         openPage.set({ page: "test" })
    //     } else {
    //         openPage.set({ page: "Landing" })
    //     }
    // });


    state.client.observer.path('openPage').watch(d => console.log(d.value));

    return <Theme value={theme}>
        {/* <Notifications state={state} /> */}
        {/* {state.client.observer.path('openPage').map(p => {
                const Page = p.page;
                if (Page) return <Page {...{ state, ...p.props }} />;
            })} */}

        <Pages state={state} />
    </Theme>;
};

const NotFound = () => <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <Typography type='h4'>Not Found 404</Typography>
</div>;

coreClient(App, NotFound);
