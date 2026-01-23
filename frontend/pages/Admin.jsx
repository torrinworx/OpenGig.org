import { modReq } from 'destam-web-core/client';
import {
	StageContext,
	suspend,
	Typography,
	Button,
	TextField,
	TextArea,
	Observer,
	Shown,
	Select,
	OArray,
	OObject,
	Icon
} from 'destamatic-ui';

import Stasis from '../components/Stasis.jsx';
import Paper from '../components/Paper.jsx';

const Admin = StageContext.use(s => suspend(Stasis, async () => {
	const listTables = await modReq('db/listTables');
	const selectedTable = Observer.mutable(listTables[0] || null);
	const query = OObject({});
	const limit = Observer.mutable(10);

	const tab = Observer.mutable('Query');

	const selectedDoc = Observer.mutable('');
	const selectedDocContent = Observer.mutable('');

	// docs list as OArray so UI can render reactively
	const docs = OArray([]);
	const loadingDocs = Observer.mutable(false);
	const docsError = Observer.mutable('');

	const queryKey = Observer.mutable('');
	const queryValue = Observer.mutable('')

	const queryRows = OArray([]);
	const queryRowsLength = Observer.mutable(0);

	const syncQueryRows = () => {
		const next = Object.entries(query).map(([key, value]) => OObject({ key, value }));
		queryRows.splice(0, queryRows.length, ...next);
		queryRowsLength.set(queryRows.length)
	};

	// initial populate
	syncQueryRows();

	// update on any mutation to query
	query.observer.watch(() => {
		syncQueryRows();
	});

	const reloadDocs = async () => {
		docsError.set('');
		const table = selectedTable.get();
		if (!table) return;

		loadingDocs.set(true);
		try {
			const res = await modReq('db/listDocs', {
				table,
				query,           // NOTE: query is an OObject; modReq should serialize it fine
				limit: limit.get(),
			});

			// refill docs OArray
			docs.splice(0, docs.length, ...(res?.docs || []).map(persistent => {
				// wrap each result with a stable query object for later getDoc
				// usually you’ll want uuid, but if it doesn’t exist, you can store the full persistent as query
				const q = OObject({});
				if (persistent?.uuid) q.uuid = persistent.uuid;
				else {
					// fallback: use the whole persistent object as the query (can be too broad if lots of keys)
					for (const [k, v] of Object.entries(persistent || {})) q[k] = v;
				}

				return OObject({
					persistent, // plain object
					queryObj: q // OObject you can pass to getDoc
				});
			}));
		} catch (e) {
			docsError.set(e?.message || 'Failed to list docs');
			docs.splice(0, docs.length);
		} finally {
			loadingDocs.set(false);
		}
	};

	selectedTable.effect(() => { reloadDocs(); });

	const DocItem = ({ each }) => {
		return <Button
			type={selectedDoc.map(d => d === each.queryObj.uuid ? 'contained' : 'outlined')}
			label={each.queryObj.uuid}
			onClick={async () => {
				const table = selectedTable.get();
				const q = each?.queryObj;

				const getDoc = await modReq('db/getDoc', {
					table,
					query: q,
					mode: 'all',
				});

				console.log('getDoc', getDoc);
				selectedDocContent.set(getDoc.doc.store);
				selectedDoc.set(each.queryObj.uuid);
			}}
			style={{
				textOverflow: 'ellipsis',
			}}
		/>;
	};

	const QueryItem = ({ each }) => {
		const keyObs = each.observer.path('key');
		const valObs = each.observer.path('value');

		const remove = () => {
			const k = keyObs.get();
			if (k != null && k !== '') delete query[k];
		};

		const onKeyChange = nextKey => {
			const prevKey = keyObs.get();
			const v = valObs.get();
			keyObs.set(nextKey);
			if (prevKey && prevKey !== nextKey) delete query[prevKey];
			if (nextKey) query[nextKey] = v;
		};

		const onValueChange = nextVal => {
			valObs.set(nextVal);

			const k = keyObs.get();
			if (k) query[k] = nextVal;
		};

		return <div theme='row_fill' style={{ gap: 10 }} >
			<TextField
				type="outlined"
				style={{ width: '100%' }}
				value={keyObs.map(v => v ?? '', v => v)}
				placeholder="key"
				onInput={e => onKeyChange(e.target.value)}
			/>

			<Typography type="h2" label=":" />

			<TextField
				type="outlined"
				style={{ width: '100%' }}
				value={valObs.map(v => v ?? '', v => v)}
				placeholder="value"
				onInput={e => onValueChange(e.target.value)}
			/>

			<Button
				type="outlined"
				icon={<Icon name="feather:trash" />}
				onClick={remove}
			/>
		</div>;
	};

	return <>
		<Typography label="Database admin ui." type="h1" />

		<div theme="row_fill" style={{ padding: 40, gap: 10, }}>
			<div theme="column_fill" style={{ maxWidth: 320, minWidth: 320 }}>
				<div theme='row_center_fill' style={{ padding: 10 }}>
					<div theme='row_radius_primary_focused_tight' style={{ overflow: 'clip' }}>
						<Button
							style={{ borderRadius: '0px' }}
							label='Query'
							type={tab.map(f => f === 'Query' ? 'contained' : 'text')}
							onClick={() => tab.set('Query')}
						/>
						<Button
							style={{ borderRadius: '0px' }}
							label='Documents'
							type={tab.map(f => f === 'Documents' ? 'contained' : 'text')}
							onClick={() => tab.set('Documents')}
						/>
					</div>
				</div>
				<div theme='divider' />

				<Shown value={tab.map(t => t === 'Query')}>
					<mark:then>
						<div theme='column_fill' style={{ gap: 10 }}>
							<div theme="row_fill" style={{ gap: 10 }}>
								<Select
									options={listTables}
									style={{ width: '100%' }}
									type="outlined"
									value={selectedTable}
								/>

								<TextField
									type="outlined"
									style={{ width: '100%' }}
									value={limit.map(v => String(v), v => +v)}
									placeholder="limit"
								/>

								<Button title='Run Query.' type="outlined" icon={<Icon name='feather:play' />} onClick={reloadDocs} />
							</div>
							<div theme='row_fill' style={{ gap: 10 }} >
								<div theme='row' style={{ gap: 5 }}>
									<TextField
										type="outlined"
										style={{ width: '100%' }}
										value={queryKey}
										placeholder="key"
									/>
									<Typography type="h2" label=':' />
									<TextField
										type="outlined"
										style={{ width: '100%' }}
										value={queryValue}
										placeholder="value"
									/>
								</div>
								<Button
									type="outlined"
									icon={<Icon name='feather:plus' />}
									onClick={() => {
										const k = queryKey.get().trim();
										if (!k) return;

										query[k] = queryValue.get();
										queryKey.set('');
										queryValue.set('');
									}}
								/>
							</div>
							<Shown value={queryRowsLength}>
								<div theme='divider' />
							</Shown>
							<QueryItem each={queryRows} />
						</div>
					</mark:then>
					<mark:else>
						<Paper theme='column' style={{ gap: 10, padding: 10, height: 650, maxHeight: 650, overflow: 'scroll' }}>
							<Shown value={loadingDocs}>
								<mark:then>
									<Typography type="p1" label="Loading..." />
								</mark:then>

								<mark:else>
									<DocItem each={docs} />
								</mark:else>
							</Shown>
						</Paper>
					</mark:else>
				</Shown>
			</div>

			<div theme="column_fill" style={{ height: '100%' }}>
				<div theme="row_fill_spread" style={{ gap: 10 }}>
					<Button type="outlined" icon={<Icon name='feather:save' />} />

					<Button type="outlined" style={{ color: '$color_error' }} icon={<Icon name='feather:trash' style={{ color: '$color_error' }} />} />
				</div>
				<div theme='divider' />
				<TextArea
					value={selectedDocContent}
					maxHeight={650}
					expand
					type='contained'
					placeholder='test'
					style={{ width: '100%', minHeight: 650 }}
				/>
			</div>
		</div>
	</>;
}));

export default Admin;
