import { Button, Icon, StageContext, Shown, Observer } from 'destamatic-ui';
import { wsAuthed } from 'destam-web-core/client';

import Hamburger from './Hamburger.jsx';
import AppContext from '../utils/appContext.js';

import LogoLightMode from '/branding/OpenGig_Logo_Light_Mode.svg';
import LogoDarkMode from '/branding/OpenGig_Logo_Dark_Mode.svg';

const Header = StageContext.use(stage => AppContext.use(app => () => {
	const current = stage.observer.path('current');
	return <div theme='row_fill_spread_wrap_contentContainer' style={{ gap: 10 }}>
		<img
			src={app.observer.path(['themeMode']).map(t => t === false ? LogoLightMode : LogoDarkMode)}
			style={{
				width: '20vw',
				maxWidth: 200,
				minWidth: 150,
				height: 'auto',
				objectFit: 'cover',
				display: 'block',
			}}
			aira-label='OpenGig logo.'
		/>
		<Shown value={Observer.all([current, wsAuthed]).map(([c, a]) => c != 'landing' && !!a)}>
			<Hamburger>
				<Shown value={current.map(c => c != 'home')}>
					<Button
						title='Home'
						type='text'
						onClick={() => stage.open({ name: 'home' })}
						icon={<Icon name='feather:home' size={30} />}
					/>
				</Shown>
				<Button
					title='Profile'
					type='text'
					onClick={() => stage.open({ name: 'user', urlProps: { id: '' } })} // TODO
					icon={<Icon name='feather:user' size={30} />}
				/>
				<Button
					title='Log Out'
					type='text'
					onClick={() => {
						app.state.leave();
						stage.open({ name: 'landing' });
					}}
					icon={<Icon name='feather:log-out' size={30} />}
				/>
			</Hamburger>
		</Shown>
	</div>;
}));

export default Header;
