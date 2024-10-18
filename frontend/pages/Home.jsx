import { h, Theme, Button, Shown } from 'destamatic-ui';
import Auth from '../components/Auth';


const Home = Theme.use(theme => ({OClient}) => {
    const counter = OClient.observer.path('counter').def(0);
    OClient.authenticated = false;

    return <div>
        <Shown value={OClient.authenticated} invert>
            <Auth Oclient={OClient} />
        </Shown>

        <Shown value={OClient.authenticated}>
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
