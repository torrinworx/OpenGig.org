import { Button, Icon, StageContext, Shown, Observer, suspend, Typography } from 'destamatic-ui';
import { wsAuthed } from 'destam-web-core/client';

import Hamburger from './Hamburger.jsx';
import AppContext from '../utils/appContext.js';
import Paper from './Paper.jsx';

import LogoLightMode from '/branding/OpenGig_Logo_Light_Mode.svg';
import LogoDarkMode from '/branding/OpenGig_Logo_Dark_Mode.svg';

const User = StageContext.use(stage => AppContext.use(app => suspend(() => null, async () =>
	<Shown value={stage.observer.path('current').map(() => stage.urlProps?.id != app.state.sync.profile.uuid)}>
		<Button
			title='Profile'
			type='text'
			onClick={() => stage.open({ name: 'user', urlProps: { id: app.state.sync.profile.uuid } })}
			icon={<Icon name='feather:user' size={30} />}
		/>
	</Shown>
)));

const Header = StageContext.use(stage => AppContext.use(app => () => {
	const current = stage.observer.path('current');

	return <>
		<Shown value={current.map(c => c !== 'landing' && c !== 'auth')}>
			<Paper
				theme="row_fill"
				style={{
					padding: 2,
					borderRadius: 0,
					gap: 5,
					position: 'sticky',
					top: 0,
					zIndex: 9999, // sigh, temp, remove when more stable. I'm sorry.
				}}
			>
				<Icon name="feather:alert-triangle" style={{ color: 'red' }} />
				<Typography type="p1" label="OpenGig is currently in alpha. Functionality is incomplete, and stored data is not guaranteed." />
			</Paper>
		</Shown>

		<div theme='row_fill_spread_wrap_contentContainer' style={{ gap: 10 }}>
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
					<User />
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
		</div>
	</>;
}));

export default Header;
