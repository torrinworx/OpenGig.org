import { Button, Icon, StageContext } from 'destamatic-ui';

import Hamburger from './Hamburger.jsx';
import AppContext from '../utils/appContext.js';

import LogoLightMode from '/branding/OpenGig_Logo_Light_Mode.svg';
import LogoDarkMode from '/branding/OpenGig_Logo_Dark_Mode.svg';

const Header = StageContext.use(stage => AppContext.use(app => () => {
	return <div theme='row_fill_spread_wrap_contentContainer' style={{ gap: 10 }}>
		<img
			src={window.themeMode.map(t => t === false ? LogoLightMode : LogoDarkMode)}
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
		<Hamburger>
			<Button
				title='Home'
				type='text'
				onClick={() => stage.open({ name: 'home' })}
				icon={<Icon name='feather:home' size={30} />}
			/>
			<Button
				title='Account'
				type='text'
				onClick={() => stage.open({ name: 'account' })}
				icon={<Icon name='feather:user' size={30} />}
			/>
			<Button
				title='Log Out'
				type='text'
				onClick={() => {
					app.get().leave();
					stage.open({ name: 'landing' });
				}}
				icon={<Icon name='feather:log-out' size={30} />}
			/>
		</Hamburger>
	</div>;
}));

export default Header;
