import { h, Theme, Button, Shown } from 'destamatic-ui';
import Auth from '../components/Auth';


const Home = Theme.use(theme => ({ state }) => {
    const counter = state.observer.path([ 'stateSync', 'counter']).def(0);
    state.stateClient.authenticated = false;

    return <div>
        <Shown value={state.stateClient.authenticated} invert>
            <Auth state={state} />
        </Shown>

        <Shown value={state.stateClient.authenticated}>
            Hello World
            <br />
            {counter}
            <Button
                label='Click'
                onMouseDown={() => {
                    counter.set(counter.get() + 1);
                }}
            />
        </Shown>
    </div>;
});

export default Home;
