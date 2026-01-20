import { modReq } from 'destam-web-core/client';
import { Button, Icon, StageContext, suspend, LoadingDots } from "destamatic-ui";

import SearchBar from '../components/SearchBar.jsx';
import Gigs from '../components/Gigs.jsx';

const Home = StageContext.use(s => () => {
	const RecentGigs = suspend(LoadingDots, async () => {
		const recentIds = await modReq('gigs/GetRecent');
		return <Gigs gigUuids={recentIds} />;
	});

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

		<RecentGigs />
	</>;
});

export default Home;
