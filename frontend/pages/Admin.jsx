import { modReq } from 'destam-web-core/client';
import { parse, stringify } from 'destam-web-core';
import {
	StageContext,
	suspend,
	Typography,
	Button,
	TextField,
	TextArea,
	Observer,
	Shown,
} from 'destamatic-ui';

import Stasis from '../components/Stasis.jsx';

const Admin = StageContext.use(s => suspend(Stasis, async () => {
	const listTables = await modReq('db/listTables');

	const selectValue = Observer.mutable(listTables[0]);
	console.log(listTables);

	const listDocs = await modReq('db/listDocs', { table: listTables[0], query: { 'userId': '#5906C6FD9CB9532B8DA0A617D9DF75A1' } });
	console.log(listDocs)

	const getDoc = await modReq('db/getDoc', {
		table: listTables[0],
		query: { uuid: listDocs.docs[0].uuid },
		mode: 'all',
	});

	const store = parse(getDoc.doc.store);
	const storeQuery = parse(getDoc.doc.storeQuery);
	// raw is already a normal mongo object
	const raw = getDoc.doc.raw;

	console.log('store', store);
	console.log('store.query', store.query);
	console.log('storeQuery', storeQuery);
	console.log('raw', raw);


	return <>
		<div theme='row_fill_center_wrap' style={{ gap: 10 }}>
			<Typography label='Database admin ui.' type='h1' />
		</div>
		<div theme='row_fill' style={{ padding: 40, gap: 10 }}>
			<Select
				options={listTables}
				style={{ width: 100 }}
				type="outlined"
				value={selectValue}
			/>
		</div>

	</>;
}));

export default Admin;
