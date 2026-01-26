import { Button, Icon, StageContext, Shown, suspend, Typography, Observer, Toggle } from 'destamatic-ui';
import { wsAuthed } from 'destam-web-core/client';

import Hamburger from './Hamburger.jsx';
import AppContext from '../utils/appContext.js';
import Paper from './Paper.jsx';

import LogoLightMode from '/branding/OpenGig_Logo_Light_Mode.svg';
import LogoDarkMode from '/branding/OpenGig_Logo_Dark_Mode.svg';

const User = StageContext.use(stage => AppContext.use(app =>
	suspend(() => null, async () => {
		const current = stage.observer.path('current');

		// stays undefined until sync/profile is populated, which is fine
		const selfUuid = app.observer.path(['sync', 'state', 'profile', 'uuid']);

		const showProfile = Observer
			.all([current, wsAuthed, selfUuid])
			.map(([_, authed, uuid]) =>
				!!authed &&
				!!uuid &&
				stage.urlProps?.id != uuid
			);

		return <Shown value={showProfile}>
			<Button
				title='Profile'
				label='Profile'
				iconPosition='right'
				type='outlined'
				onClick={() => stage.open({ name: 'user', urlProps: { id: selfUuid.get() } })}
				icon={<Icon name='feather:user' size={30} />}
				style={{ width: '100%' }}
			/>
		</Shown>;
	})
));

const Header = StageContext.use(stage => AppContext.use(app => () => {
	const current = stage.observer.path('current');

	return <>
		<Shown value={current.map(c => c !== 'landing' && c !== 'auth' && wsAuthed.get())}>
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
				aria-label='OpenGig logo.'
			/>

			<div theme='row' style={{ gap: 10 }}>
				<Shown value={wsAuthed} invert>
					<Button
						title='Sign Up'
						label='Sign Up'
						iconPosition='right'
						type='contained'
						onClick={() => stage.open({ name: 'auth' })}
						icon={<Icon name='feather:user' size={30} />}
						style={{ width: '100%', borderRadius: 50 }}
					/>
				</Shown>

				<Hamburger>
					<Shown value={wsAuthed}>
						<Button
							title='Create a New Gig'
							type='contained'
							label='Create'
							iconPosition='right'
							onClick={() => stage.open({ name: 'new-gig' })}
							icon={<Icon name='feather:plus' size={30} />}
							style={{ width: '100%' }}
						/>
					</Shown>
					<Shown value={current.map(c => c != 'admin' && app?.sync?.state?.profile?.role === 'admin')} >
						<Button
							title='Admin'
							label='Admin'
							iconPosition='right'
							type='outlined'
							onClick={() => stage.open({ name: 'admin' })}
							icon={<Icon name='feather:shield' size={30} />}
							style={{ width: '100%' }}
						/>
					</Shown>
					<Shown value={current.map(c => c !== 'home')}>
						<Button
							title='Home'
							type='outlined'
							label='Home'
							iconPosition='right'
							onClick={() => stage.open({ name: 'home' })}
							icon={<Icon name='feather:home' size={30} />}
							style={{ width: '100%' }}
						/>
					</Shown>
					{/* <Shown value={current.map(c => c !== 'chat' && wsAuthed.get())}>
						<Button
							title='Chat'
							type='outlined'
							label='Chat'
							iconPosition='right'
							onClick={() => stage.open({ name: 'chat' })}
							icon={<Icon name='feather:message-circle' size={30} />}
							style={{ width: '100%' }}
						/>
					</Shown> */}
					<User />
					<Shown value={wsAuthed}>
						<mark:then>
							<Button
								title='Log Out'
								label='Log Out'
								iconPosition='right'
								type='outlined'
								onClick={() => {
									app.leave();
									stage.open({ name: 'landing' });
								}}
								icon={<Icon name='feather:log-out' size={30} />}
								style={{ width: '100%' }}
							/>
						</mark:then>
						<mark:else>
							<Button
								title='Log In'
								label='Log In'
								iconPosition='right'
								type='outlined'
								onClick={() => stage.open({ name: 'auth' })}
								icon={<Icon name='feather:log-in' size={30} />}
								style={{ width: '100%' }}
							/>
						</mark:else>
					</Shown>
					<Toggle theme='antiPrimary' type='outlined' value={app.observer.path('themeMode')} style={{ padding: 10 }} />
				</Hamburger>
			</div>
		</div >
	</>;
}));

export default Header;
