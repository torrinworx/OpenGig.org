import { Observer, OArray } from "destam-dom";
import { modReq } from 'destam-web-core/client';
import { Theme, Button, Paper, Toggle, Typography, TextField, Icon, Detached, ModalContext } from "destamatic-ui";


import Header from "../components/Header";
import Footer from '../components/Footer';

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

const Gig = ModalContext.use(m => {
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

	return <div
		theme={[
			'row_radius_focusable',
			focused.map(f => f ? "focused" : null),
		]}
		style={{ background: '$color_main', padding: 4 }}
	>
		<TextField
			onChange={e => query.set(e.target.value)}
			value={query}
			style={{ border: 'none', outline: 'none' }}
			isFocused={focused}
			placeholder='Search Gigs'
			onKeyDown={e => {
				if (e.key === 'Enter') {
					e.preventDefault();
				} else if (e.key === 'Escape') {
					query.set('');
					focused.set(false);
					e.preventDefault();
				}
			}}
		/>
		<Button
			type='icon'
			style={{
				padding: 0,
				height: 40,
				width: 40,
				borderRadius: 50,
				flexShrink: 0,
			}}
			icon={<Icon name='search' size={30} />}
			onClick={() => { }}
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

const Home = ({ state }) => {
	const gigs = OArray([]);

	// todo have this somehow be a mapped network? or maybe just run this all through state. not sure why we would use mapped network here.
	const getGigs = async () => {
		const response = await modReq('gigs/Get');
		gigs.push(...response.gigs);
	};

	getGigs();

	return <div theme='page'>
		<Header state={state}>
			<Kebab style={{ padding: 0 }} theme='column_tight_center'>
				<Button
					type='icon'
					onClick={() => state.modal.set({ name: 'Account', header: 'Account' })}
					style={{
						padding: 0,
						height: 40,
						width: 40,
						borderRadius: 50,
						flexShrink: 0,
					}}
					icon={<Icon name='user' size={30} />}
				/>
				<Button
					type='contained'
					onMouseDown={async () => state.modal.set({ name: 'StripeTest', header: 'Stripe Test' })}
					label='Stripe setup'
				/>
				<Toggle value={window.themeMode} />
				<Button
					type='text'
					onMouseDown={() => {
						state.leave();
						state.client.openPage = { name: 'Landing' };
					}}
					label='Sign Out'
				/>
			</Kebab>
		</Header>
		<Paper theme='column' style={{ gap: 10 }}>
			<div theme='row_spread'>
				<Typography type='h1' label='Gigs' />
				<div theme='row' style={{ gap: 10 }}>
					<Button
						title='Create a Gig'
						type='icon'
						onMouseDown={() => {
							state.client.openPage = { name: 'CreateGig' };
						}}
						icon={<Icon name='plus' size={30} />}
					/>
					<SearchBar />
				</div>
			</div>
			<div style={{
				display: 'grid',
				gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
				gap: '10px'
			}}>
				<Gig each={gigs} state={state} />
			</div>
		</Paper>
		<Footer />
	</div>;
};

export default {
	authenticated: true,
	page: Home,
};
