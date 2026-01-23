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
	Icon,
	Insert,
	Delete,
	Modify,
	Validate,
} from 'destamatic-ui';

import Stasis from '../components/Stasis.jsx';
import Paper from '../components/Paper.jsx';

/**
 * Query page (self-contained)
 * - owns query inputs + validation
 * - owns query OObject + queryRows mapping UI
 * - owns reloadDocs (but docs/paper rendering stays in Admin)
 */
const Query = ({
	listTables,
	selectedTable,
	limit,

	// docs state is owned by Admin, but Query triggers reload + writes results
	docs,
	loadingDocs,
	docsError,
}) => {
	const query = OObject({});

	const queryKey = Observer.mutable('');
	const queryValue = Observer.mutable('');

	// "submit then live" validation for query input
	const querySubmit = Observer.mutable(false);
	const queryKeyError = Observer.mutable('');

	const queryRows = OArray([]);

	// key -> row OObject({ key, value })
	const rowByKey = new Map();

	const upsertRow = (key, value) => {
		let row = rowByKey.get(key);
		if (!row) {
			row = OObject({ key, value });
			rowByKey.set(key, row);
			queryRows.push(row);
		} else {
			row.value = value;
		}
	};

	const removeRow = key => {
		const row = rowByKey.get(key);
		if (!row) return;

		const idx = queryRows.indexOf(row);
		if (idx !== -1) queryRows.splice(idx, 1);
		rowByKey.delete(key);
	};

	// listen to deltas and update rows without rebuilding the array
	query.observer.watch(e => {
		const key = e.ref; // for OObject this is the property name
		if (e instanceof Insert || e instanceof Modify) {
			upsertRow(key, e.value);
		} else if (e instanceof Delete) {
			removeRow(key);
		}
	});

	const reloadDocs = async () => {
		docsError.set('');
		const table = selectedTable.get();
		if (!table) return;

		loadingDocs.set(true);
		try {
			const res = await modReq('db/listDocs', {
				table,
				query, // OObject serializes fine
				limit: limit.get(),
			});

			docs.splice(
				0,
				docs.length,
				...(res?.docs || []).map(persistent => {
					const q = OObject({});
					if (persistent?.uuid) q.uuid = persistent.uuid;
					else {
						for (const [k, v] of Object.entries(persistent || {})) q[k] = v;
					}

					return OObject({
						persistent,
						queryObj: q,
					});
				})
			);
		} catch (e) {
			docsError.set(e?.message || 'Failed to list docs');
			docs.splice(0, docs.length);
		} finally {
			loadingDocs.set(false);
		}
	};

	// reload when table changes
	selectedTable.effect(() => {
		reloadDocs();
	});

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

		return <div theme="row_fill" style={{ gap: 10 }}>
			<TextField
				type="outlined"
				style={{ width: '100%' }}
				value={Observer.immutable(keyObs.map(v => v ?? '', v => v))}
				placeholder="key"
				onInput={e => onKeyChange(e.target.value)}
			/>

			<Typography type="h2" label=":" />

			<TextField
				type="outlined"
				style={{ width: '100%' }}
				value={Observer.immutable(valObs.map(v => v ?? '', v => v))}
				placeholder="value"
				onInput={e => onValueChange(e.target.value)}
			/>

			<Button type="outlined" icon={<Icon name="feather:trash" />} onClick={remove} />
		</div>;
	};

	return <div
		style={{
			display: 'flex',
			flexDirection: 'column',
			height: '100%',
			minHeight: 0,
			gap: 10,
			justifyContent: 'flex-start',
		}}
	>
		<div theme="column" style={{ gap: 10 }}>
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

				<Button
					title="Run Query."
					type="outlined"
					icon={<Icon name="feather:play" />}
					onClick={reloadDocs}
				/>
			</div>

			<div theme="row_fill" style={{ gap: 10 }}>
				<div theme="column" style={{ width: '100%', gap: 6 }}>
					<div theme="row" style={{ gap: 5 }}>
						<TextField
							type="outlined"
							style={{ width: '100%' }}
							value={queryKey}
							placeholder="key"
						/>
						<Typography type="h2" label=":" />
						<TextField
							type="outlined"
							style={{ width: '100%' }}
							value={queryValue}
							placeholder="value"
						/>
					</div>
				</div>

				<Button
					type="outlined"
					icon={<Icon name="feather:plus" />}
					disabled={queryKeyError}
					onClick={() => {
						querySubmit.set({ value: true });
						if (queryKeyError.get()) return;

						const k = queryKey.get().trim();
						if (!k) return;

						query[k] = queryValue.get();
						queryKey.set('');
						queryValue.set('');

						querySubmit.set(false);
						queryKeyError.set('');
					}}
				/>
			</div>

			<Validate
				value={queryKey}
				signal={querySubmit}
				error={queryKeyError}
				validate={val => {
					const k = (val.get() || '').trim();
					if (!k) return 'Key is required.';
					if (k in query) return `Key "${k}" already exists in the query.`;
					return '';
				}}
			/>
		</div>
		<div theme="divider" />
		<div
			style={{
				flex: 1,
				minHeight: 0,
				overflow: 'auto',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'flex-start',
				alignItems: 'stretch',
			}}
		>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'flex-start',
					alignItems: 'stretch',
					gap: 10,
				}}
			>
				<QueryItem each={queryRows} />
			</div>
		</div>
	</div>;
};

const Admin = StageContext.use(s =>
	suspend(Stasis, async () => {
		const listTables = await modReq('db/listTables');
		const selectedTable = Observer.mutable(listTables[0] || null);
		const limit = Observer.mutable(10);

		const tab = Observer.mutable('Query');

		const selectedDoc = Observer.mutable('');
		const selectedDocContent = Observer.mutable('');

		// docs list as OArray so UI can render reactively
		const docs = OArray([]);
		const loadingDocs = Observer.mutable(false);
		const docsError = Observer.mutable('');

		const DocItem = ({ each }) => {
			return <Button
				type={selectedDoc.map(d => (d === each.queryObj.uuid ? 'contained' : 'outlined'))}
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

		return <div theme="column_fill_center_contentContainer" style={{ padding: 40, gap: 10 }}>
			<Typography type="h1" label="Admin" />

			<div theme="row_wrap" style={{ gap: 10, alignItems: 'flex-start' }}>
				{/* Query pane */}
				<div theme="column" style={{ width: 320, maxHeight: 720, gap: 10 }}>
					<Typography type="h2" label="Query" />
					<div theme="divider" />

					<Query
						listTables={listTables}
						selectedTable={selectedTable}
						limit={limit}
						docs={docs}
						loadingDocs={loadingDocs}
						docsError={docsError}
					/>
				</div>

				<div theme="column" style={{ width: 320, height: 720, gap: 10 }}>
					<Typography type="h2" label="Documents" />
					<div theme="divider" />

					<Paper
						theme="column"
						style={{
							flex: 1,
							overflow: 'auto',
							gap: 10,
							padding: 10,
						}}
					>
						<DocItem each={docs} />
					</Paper>
				</div>
			</div>

			<div theme="column_fill" style={{ height: '100%' }}>
				<div theme="row_fill_spread" style={{ gap: 10 }}>
					<Button type="outlined" icon={<Icon name="feather:save" />} />

					<div theme="row_center_fill" style={{ padding: 10 }}>
						<div theme="row_radius_primary_focused_tight" style={{ overflow: 'clip' }}>
							<Button
								style={{ borderRadius: '0px' }}
								label="Store"
								type={tab.map(f => (f === 'Store' ? 'contained' : 'text'))}
								onClick={() => tab.set('Store')}
							/>
							<Button
								style={{ borderRadius: '0px' }}
								label="Query"
								type={tab.map(f => (f === 'Query' ? 'contained' : 'text'))}
								onClick={() => tab.set('Query')}
							/>
						</div>
					</div>

					<Button
						type="outlined"
						style={{ color: '$color_error' }}
						icon={<Icon name="feather:trash" style={{ color: '$color_error' }} />}
					/>
				</div>
				<div theme="divider" />
				<TextArea
					value={selectedDocContent}
					maxHeight={650}
					expand
					type="contained"
					placeholder="test"
					style={{ width: '100%', minHeight: 650 }}
				/>
			</div>
		</div>;
	})
);

export default Admin;