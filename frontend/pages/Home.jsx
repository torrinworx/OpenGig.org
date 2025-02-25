import { jobRequest } from "destam-web-core/client";
import { Button, suspend, LoadingDots, Paper } from "destamatic-ui";

import Header from "../components/Header";

const GigsList = suspend(LoadingDots, async () => {
	const gigs = await jobRequest('Gigs/Get').then(r => r.result.list);
	console.log(gigs);

	const Gig = ({ each: gig }) => {
		return <>
			another gig {gig.name}
		</>
	};

	return <div theme='column'>
		<Button
			type='contained'
			onClick={async () => {
				await jobRequest('Gigs/Create', { name: 'test', description: 'this is the gig description' })
			}}
			label='Create Test Gig'
		/>
		<Gig each={gigs} />
	</div>
});

export default ({ state }) => {


	return <div theme='page'>
		<Header state={state}>
			<Button
				type='text'
				onMouseDown={() => {
					document.cookie = 'webCore=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
					window.location.reload();
				}}
				label='Sign Out'
			/>
		</Header>
		<Paper theme={['secondary']} style={{
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
			flexDirection: 'column',
			background: '$color',
			color: '$color_top',
		}}>
			<GigsList />
		</Paper>
	</div>;
};
