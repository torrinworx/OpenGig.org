import { Observer, OArray } from "destam-dom";
import { modReq } from 'destam-web-core/client';
import { Theme, Button, Paper, Typography, TextField, Icon, Detached, StageContext } from "destamatic-ui";

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

const Gig = StageContext.use(m => {
	return ({ each: gig }) => {
		const hover = Observer.mutable(false);

		return <Button style={{ padding: 0 }} onClick={() => m.open({ name: 'Gig', label: gig.name, gig })}>
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
					backgroundColor: '$color_top',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					flexShrink: 0
				}}>
					<Icon name='image' size={20} style={{ color: '$color_main' }} />
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
						backgroundColor: '$color_top',
						borderRadius: '50%',
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
					}}>
						<Icon name='user' size={20} style={{ color: '$color_main' }} />
					</div>
					<Typography type='p1' label={gig.userName} style={{ color: '$color_top' }} />
				</div>
				<div theme='column' style={{ flexGrow: 1 }}>
					<Typography type='h6_bold' label={gig.name} style={{ color: '$color_top', textAlign: 'left' }} />
					<Typography type='p2' label={gig.tagline} style={{ color: '$color_top', textAlign: 'left' }} />
				</div>
			</div>
		</Button>;
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

const Kebab = ({ children, ...props }) => {
	const focused = Observer.mutable(false);

	return <Detached enabled={focused}>
		<Button
			type='icon'
			onClick={() => focused.set(!focused.get())}
			style={{
				padding: 0,
				height: 40,
				width: 40,
				borderRadius: 50,
				flexShrink: 0,
			}}
			title='Menu'
			icon={<Icon name='menu' size={30} />}
		/>
		<mark:popup>
			<Paper {...props}>
				{children}
			</Paper>
		</mark:popup>
	</Detached>
};

const Home = StageContext.use(s => ({ state }) => {
	const gigs = OArray([]);

	// todo have this somehow be a mapped network? or maybe just run this all through state. not sure why we would use mapped network here.
	const getGigs = async () => {
		const response = await modReq('gigs/Get');
		gigs.push(...response.gigs);
	};


	// TODO: Move gigs thing to a suspended component.
	getGigs();

	return <>
		<div theme='row_fill_wrap_spread_contentContainer'>
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
			<div theme='row_wrap' style={{ gap: 10 }}>
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
		<div theme='row_wrap_contentContainer' style={{ gap: 10 }}>
			<Gig each={gigs} state={state} />
		</div>
	</>;
});

export default Home;
