import { Observer, OArray } from "destam-dom";
import { modReq } from 'destam-web-core/client';
import { Theme, Button, Typography, Icon, StageContext, suspend, LoadingDots, Shown } from "destamatic-ui";

import SearchBar from '../components/SearchBar.jsx';

Theme.define({
	grid: {
		display: "grid",
		gap: "12px",
		gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
		alignItems: "stretch",
		width: "100%",
	},
	gridTile: {
		extends: 'radius',
		aspectRatio: "1 / 1",
		width: "100%",
		minWidth: "180px",
		maxWidth: "300px",
		justifySelf: "center",
		overflow: "hidden",
	},
	gridMeta: {
		extends: 'radius_primary',
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
		margin: 10,
		padding: 10,
		boxSizing: 'border-box',
		color: '$color',
		background: '$color_background',
		display: 'flex',
		flexDirection: 'column',
		gap: 8,
	}
});

const Gig = StageContext.use(s => ({ each: gigId, gigs }) => {
	const gig = gigs[gigId];
	const hover = Observer.mutable(false);

	return <Button style={{ padding: 0 }} onClick={() => s.open({ name: 'gig', urlProps: { id: gigId }, props: { id: gigId } })}>
		<div
			theme={['radius', 'gridTile', hover.map(h => h ? 'hovered' : null)]}
			isHovered={hover}
		>
			<Shown value={gig.coverImg}>
				<mark:then>
					<img src={gig.coverImg} alt={`Cover image for gig "${gig.name}`} />

				</mark:then>
				<mark:else>
					<div theme='column_fill_center'>
						<Icon name='feather:image' size={20} style={{ color: '$color_background' }} />
					</div>
				</mark:else>
			</Shown>

			<div theme='gridMeta'>
				<Typography type='h6' label={gig.name} style={{ textAlign: 'left' }} />
			</div>
		</div>
	</Button>;
});

const Gigs = suspend(LoadingDots, async () => {
	const gigs = await modReq('gigs/GetRecent')

	const gigKeys = OArray(Object.keys(gigs));

	return <div theme='grid'>
		<Gig each={gigKeys} gigs={gigs} />
	</div>;
});

const Home = StageContext.use(s => () => {

	return <>
		<div theme='row_fill_center_wrap_contentContainer' style={{ gap: 10 }}>
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
		<Gigs />
	</>;
});

export default Home;
