import { Observer } from "destam-dom";
import { modReq } from 'destam-web-core/client';
import { Theme, Button, Typography, Icon, StageContext, suspend, LoadingDots, Shown } from "destamatic-ui";

import Paper from '../components/Paper.jsx';

Theme.define({
	grid: {
		display: "grid",
		gap: 10,
		gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
		alignItems: "stretch",
		width: "100%",
		padding: 20,
	},

	gridTile: {
		extends: 'radius_primary',
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
		display: 'flex',
		flexDirection: 'column',
		gap: 8,
	},

	gig_overlay: {
		extends: 'primary',
		position: 'absolute',
		inset: 0,
		pointerEvents: 'none',
		background: '$alpha($color_hover, 0.45)',
		opacity: 0,
		transition: 'opacity 120ms ease-in-out',
	},

	gig_overlay_hovered: {
		opacity: 1,
	},
});

const Gig = StageContext.use(s => ({ each: gigId, gigsById }) => {
	const gig = gigsById.map(obj => obj?.[gigId] ?? null);

	const hovered = Observer.mutable(false);

	return <Button
		theme='gridTile'
		style={{ position: 'relative' }}
		hover={hovered}
		onClick={() => s.open({ name: 'gig', urlProps: { id: gigId } })}
	>
		<div style={{
			position: 'absolute',
			inset: 0,
			overflow: 'hidden',
			borderRadius: 'inherit',
		}}>
			<Shown value={gig.map(g => g?.image)}>
				<mark:then>
					<img
						src={gig.map(g => `/files/${(g?.image ?? '').slice(1)}`)}
						alt={gig.map(g => `Cover image for gig "${g?.name || ''}"`)}
						style={{
							width: '100%',
							height: '100%',
							objectFit: 'cover',
							objectPosition: 'center',
							display: 'block',
						}}
					/>
					<div theme={['gig_overlay', hovered.bool('hovered', null)]} />
				</mark:then>
				<mark:else>
					<div theme='column_fill_center' style={{ width: '100%', height: '100%' }}>
						<Icon name='feather:image' size={20} />
					</div>
				</mark:else>
			</Shown>
		</div>
		<div style={{
			position: 'absolute',
			left: 0,
			right: 0,
			bottom: 0,
			padding: 10,
			boxSizing: 'border-box',
		}}>
			<Paper style={{ padding: 4 }}>
				<Typography
					type='p1_bold'
					label={gig.map(g => g?.name || '')}
					style={{ textAlign: 'left' }}
				/>
			</Paper>
		</div>
	</Button>;
});

const Gigs = suspend(LoadingDots, async ({ gigUuids }) => {
	const gigsById = Observer.mutable({});

	const update = async () => {
		const gigList = await modReq('gigs/Get', { uuids: gigUuids });
		const gigsObj = {};
		for (const g of gigList) {
			gigsObj[g.id] = g;
		}

		gigsById.set(gigsObj);
	};

	gigUuids?.observer?.watch(update);

	await update();

	return <div theme='grid'>
		<Gig each={gigUuids} gigsById={gigsById} />
	</div>;
});

export default Gigs;
