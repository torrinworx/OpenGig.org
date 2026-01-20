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

import { modReq } from 'destam-web-core/client';
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

const User = AppContext.use(app => StageContext.use(stage =>
	suspend(Stasis, async () => {
		const disabled = Observer.mutable(false);
		const error = Observer.mutable('');

		const viewedUuid = stage.urlProps?.id || null;

		const selfProfile = app.state.sync.profile;
		const selfUuid = selfProfile?.uuid || null;

		const isSelf =
			!viewedUuid ||
			(!!selfUuid && viewedUuid === selfUuid);

			const user = isSelf
			? (selfProfile || (app.state.sync.profile = OObject({ uuid: null, name: '', image: null, gigs: [] })))
			: OObject({ uuid: null, name: '', image: null, gigs: [] });

			if (!isSelf) {
			try {
				const data = await modReq('users/get', { uuid: viewedUuid });

				if (data?.error) {
					error.set(data.error);
					return;
				}
				if (!data) {
					error.set('User not found');
					return;
				}

				user.uuid = data.uuid ?? null;
				user.name = data.name ?? '';
				user.image = data.image ?? null;
				user.gigs = Array.isArray(data.gigs) ? data.gigs : [];
			} catch (e) {
				error.set(e?.message || 'Failed to load user');
				return;
			}
		}

		const gigUuids = isSelf
			? (app.observer.path(['state', 'sync', 'profile', 'gigs']).get())
			: user?.gigs ? user.gigs : [];

		const imageUrl = user.observer.path('image').map(img => img ? `/files/${img.slice(1)}` : false);

		const profile = app.state.sync.profile || (app.state.sync.profile = OObject({
			uuid: null,
			name: '',
			image: null,
			gigs: [],
		}));

		const nameObs = profile.observer.path('name');
		const editName = Observer.mutable(false);
		const draftName = Observer.mutable(nameObs.get() ?? '');

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

					<Shown value={Observer.immutable(isSelf)}>
						<div style={{ position: 'absolute', right: 10, bottom: 10, }}>
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
										if (!file) {
											disabled.set(false);
											return null;
										};

										if (file.size > FILE_LIMIT) {
											throw new Error(`Image too big. Max ${prettyBytes(FILE_LIMIT)}.`);
										}

										const uploadResult = await uploadSingleFile(file);
										const imageId = uploadResult?.id ?? uploadResult;

										app.state.sync.profile.image = imageId;

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

					<Shown value={Observer.immutable(isSelf)}>
						<Shown value={editName.map(e => !e)}>
							<Button onClick={() => {
								draftName.set(nameObs.get() ?? '');
								editName.set(true);
							}} icon={<Icon name="feather:edit" />} />
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
					</Shown>
				</div>

				<Typography theme='row_fill_start_primary' type='h2' label='Gigs' />
				<div theme='divider' />
			</div>
			<Gigs gigUuids={gigUuids} />
		</>;
	})
));

export default User;
