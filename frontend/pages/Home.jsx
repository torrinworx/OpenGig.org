import { Observer, OArray } from "destam-dom";
import { modReq } from 'destam-web-core/client';
import { Theme, Button, Paper, Typography, TextField, Icon, Detached, StageContext, suspend, LoadingDots } from "destamatic-ui";

import AppContext from '../utils/appContext.js';

import LogoLightMode from '/branding/OpenGig_Logo_Light_Mode.svg';
import LogoDarkMode from '/branding/OpenGig_Logo_Dark_Mode.svg';

Theme.define({
	gigtile: {
		background: '$color_main',
		padding: '10px',
		boxSizing: 'border-box',
		maxWidth: '300px',
		width: '100%',
		display: 'flex',
		flexDirection: 'column',
		gap: 10
	},

	gigtile_hovered: {
		background: '$color_hover'
	}
});

const SearchBar = () => {
	const query = Observer.mutable('');
	const focused = Observer.mutable(false);
	const hovered = Observer.mutable(false);

	const buttonHovered = Observer.mutable(false);

	const search = () => {
		console.log('search');
	}

	return <div
		theme={[
			'row_radius_primary',
			focused.bool("focused", null),
		]}
		style={{ background: hovered.bool("$color_hover", '$color'), gap: 5, overflow: 'clip', paddingRight: 5 }}
	>
		<TextField
			type='contained'
			value={query}
			style={{ background: 'none', border: 'none', outline: 'none', }}
			isFocused={focused}
			isHovered={hovered}
			placeholder='Search Gigs'
			onKeyDown={e => {
				if (e.key === 'Enter') {
					e.preventDefault();
					search();
				} else if (e.key === 'Escape') {
					query.set('');
					focused.set(false);
					e.preventDefault();
				}
			}}
		/>
		<Button
			type='text'
			hover={buttonHovered}
			round
			icon={<Icon name='feather:search' style={{
				color: Observer.all([hovered, buttonHovered])
					.map(([h, bh]) => h ? "$color" : bh ? "$color" : "$color_background")
			}} />}
			onClick={search}
		/>
	</div>;
};

const Kebab = ({ children }) => {
	const focused = Observer.mutable(false);

	return <Detached enabled={focused}>
		<Button
			type='text'
			onClick={() => focused.set(!focused.get())}
			title='Menu'
			icon={<Icon name='feather:menu' size={30} />}
		/>
		<mark:popup>
			<Paper
				theme='column'
				style={{ padding: 8, gap: 8 }}
				onPointerDown={e => e.stopPropagation()}
				onTouchStart={e => e.stopPropagation()}
				onMouseDown={e => e.stopPropagation()}
			>
				{children}
			</Paper>
		</mark:popup>
	</Detached>;
};

const Gig = StageContext.use(s => ({ each: gigId, gigs }) => {
	console.log(gigId);
	console.log(gigs);

	const gig = gigs[gigId];

	const hover = Observer.mutable(false);

	return <Button style={{ padding: 0 }} onClick={() => s.open({ name: 'Gig', gigId })}>
		<div
			theme={[
				'radius',
				'gigtile',
				hover.map(h => h ? 'hovered' : null),
			]}
			isHovered={hover}
		>
			<div theme='center_radius' style={{
				height: '150px',
				backgroundColor: '$color',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				flexShrink: 0
			}}>
				<Icon name='feather:image' size={20} style={{ color: '$color_background' }} />
			</div>
			<div style={{
				display: 'flex',
				alignItems: 'center',
				gap: '10px',
				flexShrink: 0
			}}>
				<div style={{
					width: '25px',
					height: '25px',
					backgroundColor: '$color',
					borderRadius: '50%',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
				}}>
					<Icon name='user' size={20} style={{ color: '$color_background' }} />
				</div>
				<Typography type='p1' label={gig.userName} style={{ color: '$color_background' }} />
			</div>
			<div theme='column' style={{ flexGrow: 1 }}>
				<Typography type='h6_bold' label={gig.name} style={{ color: '$color_background', textAlign: 'left' }} />
				<Typography type='p2' label={gig.tagline} style={{ color: '$color_background', textAlign: 'left' }} />
			</div>
		</div>
	</Button>;
});

const Gigs = suspend(LoadingDots, async () => {
	const gigs = await modReq('gigs/Get')

	const gigKeys = OArray(Object.keys(gigs));

	return <div theme='row_wrap_contentContainer' style={{ gap: 10 }}>
		<Gig each={gigKeys} gigs={gigs} />
	</div>;
});

const Home = AppContext.use(app => StageContext.use(s => () => {

	return <>
		<div theme='column_fill_contentContainer' style={{ gap: 40 }}>
			<div theme='row_fill_spread_wrap' style={{ gap: 10 }}>
				<img
					src={window.themeMode.map(t => t === false ? LogoLightMode : LogoDarkMode)}
					style={{
						width: '20vw',
						maxWidth: 260,
						minWidth: 200,
						height: 'auto',
						objectFit: 'cover',
						display: 'block',
					}}
				/>
				<Kebab style={{}} theme='column_tight_center'>
					<Button
						title='Account'
						type='text'
						onClick={() => s.open({ name: 'Account' })}
						icon={<Icon name='feather:user' size={30} />}
					/>
					{/* <Button
						type='contained'
						onMouseDown={async () => state.modal.set({ name: 'StripeTest', header: 'Stripe Test' })}
						label='Stripe setup'
					/> */}
					<Button
						title='Log Out'
						type='text'
						onClick={() => {
							app.get().leave();
							s.open({ name: 'Landing' });
						}}
						icon={<Icon name='feather:log-out' size={30} />}
					/>
				</Kebab>
			</div>
			<div theme='row_fill_center_wrap' style={{ gap: 10 }}>
				<Button
					title='Create a Gig'
					label='Create'
					iconPosition='right'
					type='outlined'
					onClick={() => {
						s.open({ name: 'new-gig' });
					}}
					icon={<Icon name='feather:plus' />}
				/>
				<SearchBar />
			</div>
		</div>
		<Gigs />
	</>;
}));

export default Home;
