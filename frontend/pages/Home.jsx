import { h, Button } from 'destamatic-ui';

const Home = ({OClient}) => {
    const counter = OClient.observer.path('counter').def(0);

    return <div>
        Hello World
        <br />
        {counter}
        <Button
            label='Click'
            onMouseDown={() => {
                counter.set(counter.get() + 1);
            }}
        />
    </div>;
};

export default Home;
