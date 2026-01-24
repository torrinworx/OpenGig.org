import { modReq } from 'destam-web-core/client';
import { parse } from 'destam-web-core';

import {
	StageContext,
	suspend,
	Typography,
	Button,
	TextField,
	TextArea,
	Observer,
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

/** -------- helpers -------- */

const toPlain = (value, seen = new Map()) => {
	if (value == null) return value;
	if (typeof value !== 'object') return value;
	if (seen.has(value)) return seen.get(value);

	if (Array.isArray(value)) {
		const out = [];
		seen.set(value, out);
		for (const v of value) out.push(toPlain(v, seen));
		return out;
	}

	const out = {};
	seen.set(value, out);
	for (const k of Object.keys(value)) {
		if (k === 'observer') continue;
		out[k] = toPlain(value[k], seen);
	}
	return out;
};

const isPlainObject = v => v && typeof v === 'object' && !Array.isArray(v);

// simple diff -> { set: { "a.b": v }, unset: ["x.y"] }
// arrays: replace whole array at that path
const diffToPatch = (prev, next, basePath = '', out = { set: {}, unset: [] }) => {
	const join = (p, k) => (p ? `${p}.${k}` : `${k}`);

	if (Array.isArray(prev) || Array.isArray(next)) {
		const a = JSON.stringify(prev);
		const b = JSON.stringify(next);
		if (a !== b) out.set[basePath || ''] = next;
		return out;
	}

	const prevObj = isPlainObject(prev);
	const nextObj = isPlainObject(next);

	if (!prevObj || !nextObj) {
		const a = JSON.stringify(prev);
		const b = JSON.stringify(next);
		if (a !== b) out.set[basePath || ''] = next;
		return out;
	}

	const keys = new Set([...Object.keys(prev), ...Object.keys(next)]);
	for (const k of keys) {
		const p = join(basePath, k);

		if (!(k in next)) {
			out.unset.push(p);
			continue;
		}
		if (!(k in prev)) {
			out.set[p] = next[k];
			continue;
		}

		const a = prev[k];
		const b = next[k];

		const aDeep = isPlainObject(a) || Array.isArray(a);
		const bDeep = isPlainObject(b) || Array.isArray(b);

		if (aDeep && bDeep) diffToPatch(a, b, p, out);
		else if (JSON.stringify(a) !== JSON.stringify(b)) out.set[p] = b;
	}

	return out;
};

/** -------- Query panel (unchanged logic, just calls listDocs and fills docs OArray) -------- */
const Query = ({
	listTables,
	selectedTable,
	limit,
	docs,
	loadingDocs,
	docsError,
}, cleanup) => {
	const query = OObject({});

	const queryKey = Observer.mutable('');
	const queryValue = Observer.mutable('');

	const querySubmit = Observer.mutable(false);
	const queryKeyError = Observer.mutable('');

	const queryRows = OArray([]);
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

	const removeRow = (key) => {
		const row = rowByKey.get(key);
		if (!row) return;

		const idx = queryRows.indexOf(row);
		if (idx !== -1) queryRows.splice(idx, 1);
		rowByKey.delete(key);
	};

	cleanup(query.observer.watch(e => {
		const key = e.ref;
		if (e instanceof Insert || e instanceof Modify) upsertRow(key, e.value);
		else if (e instanceof Delete) removeRow(key);
	}));

	const reloadDocs = async () => {
		docsError.set('');
		const table = selectedTable.get();
		if (!table) return;

		loadingDocs.set(true);
		try {
			const res = await modReq('db/listDocs', {
				table,
				query,
				limit: limit.get(),
			});

			const nextDocs = (res?.docs || []).map(persistent => {
				const q = OObject({});
				if (persistent?.uuid) q.uuid = persistent.uuid;
				else for (const [k, v] of Object.entries(persistent || {})) q[k] = v;

				return OObject({ persistent, queryObj: q });
			});

			docs.splice(0, docs.length);
			docs.push(...nextDocs);
		} catch (e) {
			docsError.set(e?.message || 'Failed to list docs');
			docs.splice(0, docs.length);
		} finally {
			loadingDocs.set(false);
		}
	};

	cleanup(selectedTable.effect(() => { void reloadDocs(); }));

	const QueryItem = ({ each }) => {
		const keyObs = each.observer.path('key');
		const valObs = each.observer.path('value');

		const remove = () => {
			const k = keyObs.get();
			if (k != null && k !== '') delete query[k];
		};

		const onKeyChange = (nextKey) => {
			const prevKey = keyObs.get();
			const v = valObs.get();

			keyObs.set(nextKey);

			if (prevKey && prevKey !== nextKey) delete query[prevKey];
			if (nextKey) query[nextKey] = v;
		};

		const onValueChange = (nextVal) => {
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

	return <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, gap: 10 }}>
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
					title="Run Query"
					type="outlined"
					icon={<Icon name="feather:play" />}
					onClick={() => { void reloadDocs(); }}
				/>
			</div>

			<div theme="row_fill" style={{ gap: 10 }}>
				<div theme="column" style={{ width: '100%', gap: 6 }}>
					<div theme="row" style={{ gap: 5 }}>
						<TextField type="outlined" style={{ width: '100%' }} value={queryKey} placeholder="key" />
						<Typography type="h2" label=":" />
						<TextField type="outlined" style={{ width: '100%' }} value={queryValue} placeholder="value" />
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

		<div style={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
			<div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
				<QueryItem each={queryRows} />
			</div>
		</div>
	</div>;
};

/** -------- Admin -------- */
const Admin = StageContext.use(s =>
	suspend(Stasis, async () => {
		const listTables = await modReq('db/listTables');

		const selectedTable = Observer.mutable(listTables[0] || null);
		const limit = Observer.mutable(10);

		const docs = OArray([]);
		const loadingDocs = Observer.mutable(false);
		const docsError = Observer.mutable('');

		const tab = Observer.mutable('Store'); // 'Store' | 'Query'

		const selectedDoc = Observer.mutable('');
		const selectedDocQuery = Observer.mutable(null); // query object used to fetch/save (usually {uuid})

		// backing strings for the current doc
		const storeText = Observer.mutable('');
		const queryText = Observer.mutable('');

		// last loaded strings (for diff)
		const loadedStoreText = Observer.mutable('');
		const loadedQueryText = Observer.mutable('');

		// single editor that swaps content based on tab
		const editor = Observer.mutable('');

		const saveError = Observer.mutable('');

		// swap editor when tab changes
		tab.effect(t => {
			editor.set(t === 'Query' ? queryText.get() : storeText.get());
		});

		// keep current tab backing string updated from editor
		editor.watch(e => {
			if (tab.get() === 'Query') queryText.set(e.value);
			else storeText.set(e.value);
		});

		const loadSelectedDoc = async (each) => {
			saveError.set('');

			const table = selectedTable.get();
			const q = each?.queryObj;
			if (!table || !q) return;

			const res = await modReq('db/getDoc', { table, query: q, mode: 'all' });
			if (res?.error) throw new Error(res.error);
			if (!res?.doc?.store || !res?.doc?.storeQuery) throw new Error('getDoc returned missing data');

			const storeObs = parse(res.doc.store);
			const queryObs = parse(res.doc.storeQuery);

			const storePlain = toPlain(storeObs);
			delete storePlain.query; // don't show query inside Store editor

			const queryPlain = toPlain(queryObs);

			const storeStr = JSON.stringify(storePlain ?? {}, null, 2);
			const queryStr = JSON.stringify(queryPlain ?? {}, null, 2);

			selectedDoc.set(each.queryObj.uuid || '');
			selectedDocQuery.set(q);

			loadedStoreText.set(storeStr);
			loadedQueryText.set(queryStr);

			storeText.set(storeStr);
			queryText.set(queryStr);

			editor.set(tab.get() === 'Query' ? queryStr : storeStr);
		};

		const DocItem = ({ each }) => {
			const uuid = each?.queryObj?.uuid || '(no uuid)';
			return <Button
				type={selectedDoc.map(d => (d === uuid ? 'contained' : 'outlined'))}
				label={uuid}
				onClick={() => loadSelectedDoc(each)}
				style={{ textOverflow: 'ellipsis' }}
			/>;
		};

		const save = async () => {
			saveError.set('');

			const table = selectedTable.get();
			const q = selectedDocQuery.get();
			if (!table || !q) {
				saveError.set('No document selected.');
				return;
			}

			const isQuery = tab.get() === 'Query';

			let prevObj, nextObj;
			try {
				prevObj = JSON.parse((isQuery ? loadedQueryText.get() : loadedStoreText.get()) || '{}');
				nextObj = JSON.parse((isQuery ? queryText.get() : storeText.get()) || '{}');
			} catch (e) {
				saveError.set(e?.message || 'Invalid JSON');
				return;
			}

			const patch = diffToPatch(prevObj, nextObj);

			// If editing query tab, apply patch under store.query.*
			if (isQuery) {
				const set = {};
				for (const [p, v] of Object.entries(patch.set)) {
					const key = p ? `query.${p}` : 'query';
					set[key] = v;
				}
				const unset = patch.unset.map(p => `query.${p}`);
				patch.set = set;
				patch.unset = unset;
			}

			const res = await modReq('db/writeDoc', {
				table,
				query: q,
				patch,
				flush: true,
				returnDoc: false,
			});

			if (res?.error) {
				saveError.set(res.error);
				return;
			}

			// update "loaded" snapshot after successful save
			if (isQuery) loadedQueryText.set(queryText.get());
			else loadedStoreText.set(storeText.get());
		};

		const del = async () => {
			saveError.set('');

			const table = selectedTable.get();
			const q = selectedDocQuery.get();
			if (!table || !q) {
				saveError.set('No document selected.');
				return;
			}

			const res = await modReq('db/deleteDoc', { table, query: q });
			if (res?.error) {
				saveError.set(res.error);
				return;
			}

			// remove from docs list (best-effort)
			const uuid = q?.uuid;
			if (uuid) {
				const idx = docs.findIndex(d => d?.queryObj?.uuid === uuid);
				if (idx !== -1) docs.splice(idx, 1);
			}

			selectedDoc.set('');
			selectedDocQuery.set(null);

			storeText.set('');
			queryText.set('');
			loadedStoreText.set('');
			loadedQueryText.set('');
			editor.set('');
		};

		return <div theme="column_fill_center_contentContainer" style={{ padding: 40, gap: 10 }}>
			<Typography type="h1" label="Admin" />

			<div theme="row_wrap" style={{ gap: 10, alignItems: 'flex-start' }}>
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

					<Typography type="validate" label={docsError} />
				</div>
			</div>

			<div theme="column_fill" style={{ height: '100%', gap: 10 }}>
				<div theme="row_fill_spread" style={{ gap: 10 }}>
					<Button type="outlined" icon={<Icon name="feather:save" />} onClick={save} />

					<div theme="row_center_fill" style={{ padding: 10 }}>
						<div theme="row_radius_primary_focused_tight" style={{ overflow: 'clip' }}>
							<Button
								style={{ borderRadius: '0px' }}
								label="Store"
								type={tab.map(t => (t === 'Store' ? 'contained' : 'text'))}
								onClick={() => tab.set('Store')}
							/>
							<Button
								style={{ borderRadius: '0px' }}
								label="Query"
								type={tab.map(t => (t === 'Query' ? 'contained' : 'text'))}
								onClick={() => tab.set('Query')}
							/>
						</div>
					</div>

					<Button
						type="outlined"
						style={{ color: '$color_error' }}
						icon={<Icon name="feather:trash" style={{ color: '$color_error' }} />}
						// onClick={del}
						disabled
					/>
				</div>

				<Typography type="validate" label={saveError} />

				<div theme="divider" />

				<TextArea
					value={editor}
					maxHeight={650}
					expand
					type="contained"
					placeholder="{}"
					style={{ width: '100%', minHeight: 650 }}
				/>
			</div>
		</div>;
	})
);

export default Admin;
