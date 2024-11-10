import { Button } from 'destamatic-ui';

export default ({ state }) => {
    const counter = state?.sync.observer.path('counter').def(0);

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
