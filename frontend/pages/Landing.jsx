import { Button, Typography, Icon } from 'destamatic-ui';
import Logo from '../../OpenGig.svg';

const Header = ({ state }) => <span theme='header'>
    <img src={Logo} style={{ height: '75px' }} />
    <div style={{ display: 'flex', gap: '15px' }}>
        <Button
            label='Signup or Login'
            type='contained'
            onMouseDown={() => state.sync.observer.path('currentRoute').set('/home')}
        />
    </div>
</span>;

const Landing = ({ state }) => <div theme='page'>
    <Header state={state} />
    <div theme='pageSection'>
        <Typography type='h1' >What?</Typography>
        <Typography type='p1' >
            We are an organization that provides an open source service for gig workers around the world.
            As an Open Source Service, OpenGig is open source, open statistics, open structure, and open cost.
            No part of our operations are hidden or obfuscated.
        </Typography>
    </div>
    <div theme='pageSection_inset' >
        <Typography type='h1' >What?</Typography>
        <Typography type='p1' >
            We are an organization that provides an open source service for gig workers around the world.
            As an Open Source Service, OpenGig is open source, open statistics, open structure, and open cost.
            No part of our operations are hidden or obfuscated.
        </Typography>
    </div>
    <div theme='pageSection'>
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
    </div>
    <div theme='pageSection_inset' >
        <Button
            Icon={<Icon
                size='40'
                libraryName='feather'
                iconName='github'
            />}
            type='icon'
            onMouseDown={() => window.open('https://github.com/torrinworx/OpenGig.org', '_blank')}
            title={'Github'}
        />
    </div>
</div>;
export default Landing;
