import {
	Icon,
	Typography,
	Observer,
	OObject,
	OArray,
	StageContext,
	suspend,
	Shown,
	FileDrop,
	Button,
	TextField,
} from 'destamatic-ui';
import { wsAuthed, modReq } from 'destam-web-core/client';
import { asyncSwitch } from 'destam-web-core';

import NotFound from './NotFound.jsx';
import Stasis from '../components/Stasis.jsx';
import AppContext from '../utils/appContext.js';
import Gigs from '../components/Gigs.jsx';

const FILE_LIMIT = 10 * 1024 * 1024;

const prettyBytes = (bytes = 0) => {
	const units = ['B', 'KB', 'MB', 'GB'];
	let i = 0;
	let n = bytes;
	while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
	return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
};

const uploadSingleFile = async (file) => {
	const fd = new FormData();
	fd.append('file', file, file.name);

	const res = await fetch('/api/upload', {
		method: 'POST',
		credentials: 'include',
		body: fd,
	});

	if (!res.ok) throw new Error(await res.text());
	return await res.json();
};

const normalizeOtherProfile = (data) => OObject({
	uuid: data?.uuid ?? null,
	name: data?.name ?? '',
	image: data?.image ?? null,
	gigs: OArray(Array.isArray(data?.gigs) ? data.gigs : []),
});

const User = AppContext.use(app => StageContext.use(stage =>
	suspend(Stasis, async () => {
		const disabled = Observer.mutable(false);
		const error = Observer.mutable('');

		const selfRoleObs = app.observer
			.path(['sync', 'state', 'profile', 'role'])
			.def(null);

		const selfUuidObs = app.observer
			.path(['sync', 'state', 'profile', 'uuid'])
			.def(null);

		const viewedUuidObs =
			stage.observer?.path(['urlProps', 'id'])?.def(null)
			?? Observer.mutable(stage.urlProps?.id ?? null);

		// This is the real observer for the self profile (when it exists)
		const selfProfilePathObs = app.observer
			.path(['sync', 'state', 'profile'])
			.def(null);

		// Build a query tuple
		const queryObs = Observer.all([wsAuthed, viewedUuidObs, selfUuidObs, selfProfilePathObs]);

		// Returns an Observer whose VALUE is another Observer (ref to profile source)
		const activeProfileRefObs = asyncSwitch(queryObs, async ([authed, viewedUuid, selfUuid, selfProfile]) => {
			error.set('');

			// not authed and no viewed user => 404
			if (!authed && !viewedUuid) return Observer.immutable(null);

			const isSelf =
				authed && (
					!viewedUuid ||
					(!!selfUuid && viewedUuid === selfUuid)
				);

			if (isSelf) {
				// If sync not ready yet, just return null until it is
				if (!selfProfile) return Observer.immutable(null);

				// IMPORTANT: return the actual chain observer (keeps it fully reactive)
				return app.observer.path(['sync', 'state', 'profile']);
			}

			if (!viewedUuid) return Observer.immutable(null);

			// Fetch other profile
			const data = await modReq('users/get', { uuid: viewedUuid });
			if (!data || data?.error) return Observer.immutable(null);

			return Observer.immutable(normalizeOtherProfile(data));
		});

		// Unwrap => Observer resolving to OObject|null
		const profileObs = activeProfileRefObs.unwrap();

		const canEditObs = Observer.all([wsAuthed, viewedUuidObs, selfUuidObs]).map(([authed, viewedUuid, selfUuid]) => {
			if (!authed) return false;
			if (!viewedUuid) return true;
			if (!selfUuid) return false;
			return viewedUuid === selfUuid;
		});

		const uuidCheck = Observer.mutable(false);
		uuidCheck.watch(() => {
			if (uuidCheck.get()) setTimeout(() => uuidCheck.set(false), 5000);
		});

		return <>
			{profileObs.map(p => {
				if (!p) return <NotFound />;

				// These are now ALWAYS derived from the active profile object
				const nameObs = p.observer.path('name');
				const editName = Observer.mutable(false);
				const draftName = Observer.mutable(nameObs.get() ?? '');

				const imageUrl = p.observer
					.path('image')
					.map(img => img ? `/files/${img.slice(1)}` : false);

				return <>
					<div theme="column_center_fill_contentContainer">
						<div
							style={{
								position: 'relative',
								width: '20vw',
								maxWidth: 200,
								minWidth: 150,
								aspectRatio: '1 / 1',
								borderRadius: '50%',
								margin: '0 auto',
							}}
						>
							{imageUrl.map(url => {
								if (!url) {
									return (
										<div
											theme='primary'
											style={{
												width: '20vw',
												maxWidth: 200,
												minWidth: 150,
												aspectRatio: '1 / 1',
												borderRadius: '50%',
												overflow: 'hidden',
												margin: '0 auto',
												border: '6px solid $color',
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
											}}
										>
											<Icon
												style={{ color: '$color' }}
												name="feather:user"
												size="50%"
											/>
										</div>
									);
								}

								return <div
									theme='primary'
									style={{
										width: '20vw',
										maxWidth: 200,
										minWidth: 150,
										aspectRatio: '1 / 1',
										borderRadius: '50%',
										overflow: 'hidden',
										margin: '0 auto',
										border: '6px solid $color',
									}}
								>
									<img
										src={url}
										alt="Profile"
										style={{
											width: '100%',
											height: '100%',
											objectFit: 'cover',
											display: 'block',
										}}
									/>
								</div>;
							}).unwrap()}

							<Shown value={canEditObs}>
								<div style={{ position: 'absolute', right: 10, bottom: 10 }}>
									<FileDrop
										files={OArray()}
										clickable={false}
										multiple={false}
										extensions={['image/png', 'image/jpeg', 'image/jpg', 'image/webp']}
										style={{ display: 'contents' }}
										loader={async (file) => {
											disabled.set(true);
											error.set('');

											try {
												if (!file) return null;

												if (file.size > FILE_LIMIT) {
													throw new Error(`Image too big. Max ${prettyBytes(FILE_LIMIT)}.`);
												}

												const uploadResult = await uploadSingleFile(file);
												const imageId = uploadResult?.id ?? uploadResult;

												// write directly to active profile object
												p.image = imageId;

												return imageId;
											} catch (e) {
												error.set(e?.message || 'Upload failed');
												throw e;
											} finally {
												disabled.set(false);
											}
										}}
									>
										<FileDrop.Button
											title="Upload new profile image."
											type="contained"
											icon={<Icon name="feather:edit" />}
											round
											disabled={disabled}
											loading={false}
											onClick={() => { error.set(''); }}
										/>
									</FileDrop>
								</div>
							</Shown>
						</div>

						<Typography type="validate" label={error} />

						<Shown value={canEditObs}>
							<div theme="row" style={{ gap: 20 }}>
								<Shown value={editName.map(e => !e)}>
									<Typography type="h2" label={Observer.immutable(nameObs)} />
								</Shown>

								<Shown value={editName}>
									<TextField
										type='outlined'
										value={draftName}
										onInput={e => draftName.set(e.target.value)}
									/>
								</Shown>

								<Shown value={editName.map(e => !e)}>
									<Button
										onClick={() => {
											draftName.set(nameObs.get() ?? '');
											editName.set(true);
										}}
										icon={<Icon name="feather:edit" />}
									/>
								</Shown>

								<Shown value={editName}>
									<Button
										onClick={() => {
											nameObs.set(draftName.get());
											editName.set(false);
										}}
										icon={<Icon name="feather:save" />}
									/>
									<Button
										onClick={() => {
											draftName.set(nameObs.get() ?? '');
											editName.set(false);
										}}
										icon={<Icon name="feather:x" />}
									/>
								</Shown>
							</div>
						</Shown>

						<Shown value={canEditObs.map(v => !v)}>
							<Typography type="h2" label={Observer.immutable(nameObs)} />
						</Shown>

						<Shown value={selfRoleObs.map(r => r === 'admin')}>
							<Button
								title='Copy users uuid to clipboard.'
								type='link'
								iconPosition='right'
								label={p.observer.path('uuid')}
								icon={uuidCheck.map(c => c
									? <Icon name='feather:check' />
									: <Icon name='feather:copy' />)}
								onClick={async () => {
									uuidCheck.set(true);
									await navigator.clipboard.writeText(p.uuid);
								}}
								loading={false}
							/>
						</Shown>

						<Typography theme='row_fill_start_primary' type='h2' label='Gigs' />
						<div theme='divider' />
					</div>

					<Gigs gigUuids={p.gigs} />
				</>;
			}).unwrap()}
		</>;
	})
));

export default User;
