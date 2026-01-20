import {
	Button,
	Icon,
	Typography,
	Observer,
	OObject,
	StageContext,
	suspend,
	Shown
} from 'destamatic-ui';

import { modReq } from 'destam-web-core/client';
import Stasis from '../components/Stasis.jsx';
import AppContext from '../utils/appContext.js';

const FILE_LIMIT = 10 * 1024 * 1024;

const prettyBytes = (bytes = 0) => {
	const units = ['B', 'KB', 'MB', 'GB'];
	let i = 0;
	let n = bytes;
	while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
	return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
};

const pickImageFile = () => new Promise(ok => {
	const input = document.createElement('input');
	input.type = 'file';
	input.accept = 'image/png,image/jpeg,image/jpg,image/webp';
	input.multiple = false;
	input.onchange = () => ok(input.files?.[0] || null);
	input.click();
});

const uploadSingleFile = async (file) => {
	const fd = new FormData();
	fd.append('file', file, file.name);

	const res = await fetch('/api/upload', {
		method: 'POST',
		credentials: 'include',
		body: fd,
	});

	if (!res.ok) throw new Error(await res.text());
	return await res.json(); // {id} or id/string
};

const toFileUrl = (img) => {
	if (!img || typeof img !== 'string') return null;
	const id = img.startsWith('#') ? img.slice(1) : img;
	return `/files/${id}`;
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

		// Use the synced profile object directly when self (reactive, editable)
		const user = isSelf
			? (selfProfile || (app.state.sync.profile = OObject({ uuid: null, name: '', image: null })))
			: OObject({ uuid: null, name: '', image: null });

		// If not self, load public user
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
			} catch (e) {
				error.set(e?.message || 'Failed to load user');
				return;
			}
		}

		const onUploadClick = async () => {
			error.set('');
			if (disabled.get()) return;

			if (!isSelf) {
				error.set("You can't change another user's picture.");
				return;
			}

			const file = await pickImageFile();
			if (!file) return;

			if (file.size > FILE_LIMIT) {
				error.set(`Image too big. Max ${prettyBytes(FILE_LIMIT)}.`);
				return;
			}

			disabled.set(true);
			try {
				const uploadResult = await uploadSingleFile(file);
				const imageId = uploadResult?.id ?? uploadResult;
				app.state.sync.profile.image = imageId;
			} catch (e) {
				error.set(e?.message || 'Upload failed');
			} finally {
				disabled.set(false);
			}
		};

		const imageUrl = user.observer.path('image').map(toFileUrl);

		return <div theme="column_center" style={{ gap: 10 }}>
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
			>				{imageUrl.map(url => {
				if (!url) {
					return <div theme="row_center" style={{
						width: 96,
						height: 96,
						borderRadius: 999,
					}}>
						<Icon name="feather:user" size={40} />
					</div>;
				}

				return <div
					style={{
						width: '20vw',
						maxWidth: 200,
						minWidth: 150,
						aspectRatio: '1 / 1',
						borderRadius: '50%',
						overflow: 'hidden',
						margin: '0 auto',
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
				<Shown value={app.observer.path(['state', 'sync', 'profile', 'uuid']).map(id => id === viewedUuid)}>
					<div
						style={{
							position: 'absolute',
							right: 8,
							bottom: 8,
							zIndex: 2,
						}}
					>
						<Button
							title="Upload new profile image."
							type="contained"
							onClick={onUploadClick}
							disabled={disabled}
							icon={<Icon name="feather:edit" />}
							round
							loading={false}
						/>
					</div>
				</Shown>
			</div>

			<Typography type="h2" label={user.observer.path('name')} />


			<Typography type="validate" label={error} />
		</div>;
	})
));

export default User;
