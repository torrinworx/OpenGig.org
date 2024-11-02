import { Theme, Button, Typography } from 'destamatic-ui';

const Header = ({state}) => {

    return <div theme='header'>
        <div style={{ position: 'relative', display: 'inline-block' }}>
            <Typography type="h1">
                OpenGig
            </Typography>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
            <Button
                label='Sign up'
                type='contained'
                onMouseDown={() => { }}
            />
            <Button
                label='Login'
                type='outlined'
                onMouseDown={() => { }}
            />
        </div>
    </div>;
};


const Landing = ({ state }) => {
    return <div>
        <Header state={state}/>
        <Button
            label='msg'
            type='outlined'
            onMouseDown={() => {
                state.sync.notifications.push({
                    content: 'this is from the landing page',
                    type: 'error'
                });
            }}
        />
    </div>;
};

export default Landing;
