import { Theme, Button, Typography, Icon } from 'destamatic-ui';
import Logo from '../../OpenGig.svg';

Theme.define({
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    page: {
        padding: '40px',
        gap: '20px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        height: '100vw'
    },
    pageSection: {
        extends: ['secondary', 'radius'],

        backgroundColor: '$color',
        padding: '20px',
        color: '$color_top',
    },
    pageSection_inset: {
        extends: ['secondary', 'radius'],
        padding: '20px',
        color: '$color',
        backgroundColor: '#FFFFFF',
    },
    pageSection_centered: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
    },
    iconWrapper: {
        display: 'flex',
        justifyContent: 'center',
        gap: '15px',
    },
})

const Header = ({ state }) => <span theme='header'>
    <img src={Logo} style={{ height: '75px', userSelect: 'none' }} />
    <div style={{ display: 'flex', gap: '15px' }}>
        <Button
            label='Signup or Login'
            type='contained'
            onMouseDown={() => state.sync.observer.path('currentRoute').set('/home')}
        />
    </div>
</span>;

export default ({ state }) => <div theme='page'>
    <Header state={state} />
    <div theme='pageSection'>
        <Typography type='h1' >Join OpenGig</Typography>
        <Typography type='p1' >
            OpenGig.org is an Open Source Service platform built for gig workers and customers. We stand openness, the rights of consumers, and the empowerment of workers.
        </Typography>
        <Button
            label='Get Started'
            type='contained'
            style={{ marginTop: '20px' }}
            onMouseDown={() => state.sync.observer.path('currentRoute').set('/home')}
        />
    </div>
    <div theme='pageSection_inset'>
        <Typography type='h2' >Why OpenGig?</Typography>
        <Typography type='p1' >
            Our platform offers gig workers the tools they need without the greedy middleman. With OpenGig, you work on your own terms.
            <ul>
                <li><Typography type='p1'>Set your own rates and pricing</Typography></li>
                <li><Typography type='p1'>Open source algorithmic suggested pricing</Typography></li>
                <li><Typography type='p1'>At cost fees (your not paying for vanity projects)</Typography></li>
                <li><Typography type='p1'>Transparent statistics and operations</Typography></li>
                <li><Typography type='p1'>Community-driven development</Typography></li>
            </ul>
        </Typography>
    </div>
    <div theme='pageSection' >
        <Typography type='h2' >What can I do?</Typography>
        <Typography type='p1' >
            Anything. OpenGig is deseigned to support any type of gig, from taxi services, food delivery, to task completion.
        </Typography>
    </div>
    <div theme='pageSection_inset_centered'>
        <div theme='iconWrapper'>
            <Button
                Icon={<Icon size='40' libraryName='feather' iconName='github' />}
                type='icon'
                onMouseDown={() => window.open('https://github.com/torrinworx/OpenGig.org', '_blank')}
                title={'Github'}
            />
            <Button
                Icon={<Icon size='40' libraryName='feather' iconName='globe' />}
                type='icon'
                onMouseDown={() => window.open('', '_blank')}
                title={'Twitter'}
            />
            <Button
                Icon={<Icon size='40' libraryName='feather' iconName='feather' />}
                type='icon'
                onMouseDown={() => window.open('', '_blank')}
                title={'Twitter'}
            />
        </div>
    </div>
</div>;
