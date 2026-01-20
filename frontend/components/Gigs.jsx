import { Observer, OArray } from "destam-dom";
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
	}
});

const Gig = StageContext.use(s => ({ each: gigId, gigsById }) => {
	const gig = gigsById?.[gigId];
	const hovered = Observer.mutable(false);

	return <Button
		theme='gridTile'
		style={{ position: 'relative' }}
		isHovered={hovered}
		onClick={() => s.open({ name: 'gig', urlProps: { id: gigId }, props: { id: gigId } })}
	>
		<div style={{
			position: 'absolute',
			inset: 0,
			overflow: 'hidden',
			borderRadius: 'inherit',
		}}>
			<Shown value={gig?.image}>
				<mark:then>
					<img
						src={`/files/${gig?.image?.slice(1)}`}
						alt={`Cover image for gig "${gig?.name || ''}"`}
						style={{
							width: '100%',
							height: '100%',
							objectFit: 'cover',
							objectPosition: 'center',
							display: 'block',
						}}
					/>
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
				<Typography type='p1_bold' label={gig?.name || ''} style={{ textAlign: 'left' }} />
			</Paper>
		</div>
	</Button>;
});

const Gigs = suspend(LoadingDots, async ({ gigUuids }) => {
	const ids = Array.isArray(gigUuids) ? gigUuids.filter(Boolean) : [];
	const gigKeys = OArray(ids);
	const gigList = await modReq('gigs/Get', { uuids: ids });

	const gigsById = {};
	for (const g of (Array.isArray(gigList) ? gigList : [])) {
		if (g?.uuid) gigsById[g.uuid] = g;
	}

	return <div theme='grid'>
		<Gig each={gigKeys} gigsById={gigsById} />
	</div>;
});


export default Gigs;
