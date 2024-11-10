import { Button } from 'destamatic-ui';

export default ({ state }) => {
    const counter = state?.sync.observer.path('counter').def(0);

    const handleSignOut = () => {
		document.cookie = 'webCore=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
		window.location.reload();
	};

    return <div>
        Hello World
        <br/>
        <Button label="Sign Out" type="contained" onMouseDown={handleSignOut} />
        <br/>
        {counter}
        <Button
            label='Click'
            onMouseDown={() => {
                counter.set(counter.get() + 1);
            }}
        />
    </div>;
};
