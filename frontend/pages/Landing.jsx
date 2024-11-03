import { Button, Typography } from 'destamatic-ui';
import Logo from '../../OpenGig.svg';

const Header = ({ state }) => <div theme='header'>
    <img src={Logo} style={{ height: '50px' }} />
    <div style={{ display: 'flex', gap: '15px' }}>
        <Button
            label='Signup or Login'
            type='contained'
            onMouseDown={() => state.sync.observer.path('currentRoute').set('/home')}
        />
    </div>
</div>;

const Landing = ({ state }) => <>
    <Header state={state} />
    <Button
        label={<Typography type='h5' >Error</Typography>}
        type='contained'
        onMouseDown={() => {
            state.sync.notifications.push({
                content: 'this is from the landing page',
                type: 'error'
            });
        }}
    />
    <Button
        label='warning'
        type='contained'
        onMouseDown={() => {
            state.sync.notifications.push({
                content: 'this is from the landing page',
                type: 'warning'
            });
        }}
    />
    <Button
        label='ok'
        type='contained'
        onMouseDown={() => {
            state.sync.notifications.push({
                content: 'this is from the landing page',
                type: 'ok'
            });
        }}
    />
    <Button
        label='msg'
        type='outlined'
        onMouseDown={() => {
            state.state.sync.notifications.push({
                content: 'this is from the landing page',
                type: 'error'
            });
        }}
    />
    <div style={{ backgroundColor: 'red', height: '2000px' }} />
</>;
export default Landing;
