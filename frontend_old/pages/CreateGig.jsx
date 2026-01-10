import { Observer, OArray } from "destam-dom";
import { modReq } from 'destam-web-core/client';
import {
	Button,
	Paper,
	Toggle,
	Icon,
	Detached,
	Typography,
	Radio,
	TextField,
	TextArea,
	Shown
} from "destamatic-ui";

import Header from "../components/Header";
import Footer from '../components/Footer';

const Kebab = ({ children, ...props }) => {
	const focused = Observer.mutable(false);

	return <Detached enabled={focused}>
		<Button
			type='icon'
			onClick={() => focused.set(!focused.get())}
			style={{
				padding: 0,
				height: 40,
				width: 40,
				borderRadius: 50,
				flexShrink: 0,
			}}
			title='Menu'
			icon={<Icon name='menu' size={30} />}
		/>
		<mark:popup>
			<Paper {...props}>
				{children}
			</Paper>
		</mark:popup>
	</Detached>
};

const CreateGig = ({ state }) => {
	const loading = Observer.mutable(false);
	const type = Observer.mutable(0);
	const SelectRadio = Radio(type);
	const name = Observer.mutable(''); // 40 character limit
	const subName = Observer.mutable('') // 100 character limit
	const description = Observer.mutable(''); // 2000 character limit.
	const tags = OArray([]); // somehow preload this with some tags db that is ranked by users or something??? we should setup something like instagram hashtags
	const curTag = Observer.mutable('');
	const focusedTag = Observer.mutable(false);

	const Tag = ({ each: tag }) => {
		const index = tags.indexOf(tag);

		return <Paper
			theme="row_center"
			style={{
				display: 'flex',
				padding: 10,
			}}
		>
			<Button
				style={{ padding: 0, margin: 0, marginRight: 5 }}
				type="icon"
				icon={<Icon name="x" size={20} />}
				onClick={() => tags.pop(index)}
			/>
			<Typography
				type="p1"
				label={tag}
			/>
		</Paper>;
	};

	return <div theme='page'>
		<Header state={state}>
			<Kebab style={{ padding: 0 }} theme='column_tight_center'>
				<Button
					type='icon'
					onClick={() => state.modal.set({ name: 'Account', header: 'Account' })}
					style={{
						padding: 0,
						height: 40,
						width: 40,
						borderRadius: 50,
						flexShrink: 0,
					}}
					icon={<Icon name='user' size={30} />}
				/>
				<Button
					type='contained'
					onMouseDown={async () => state.modal.set({ name: 'StripeTest', header: 'Stripe Test' })}
					label='Stripe setup'
				/>
				<Toggle value={window.themeMode} />
				<Button
					type='text'
					onMouseDown={() => {
						state.leave();
						state.client.openPage = { name: 'Landing' };
					}}
					label='Sign Out'
				/>
			</Kebab>
		</Header>
		<Paper theme='column' style={{ gap: 10 }}>
			<Typography type='h1' label='Create a Gig!' />
			<div theme='center_column' style={{ gap: 40 }} >
				<div theme='column' style={{ width: 400, gap: 10 }} >
					<Typography type='h4' label='Type' />
					<Typography type='p1' label='Are you requesting a gig or offering services?' />
					<SelectRadio value={0} label="Offering a service." />
					<SelectRadio value={1} label="Requesting a service." />

					<div theme='row' style={{ gap: 10 }}>
						<Icon name='info' size={40} />
						<Typography type='p1' label={type.map(t => {
							if (t === 0) {
								return "Offering a service means that users can seek your service and contact you for work.";
							} else {
								return "Requesting a service means that workers can apply and provide a quote for your gig."
							}
						})} />
					</div>
				</div>
				<div theme='column' style={{ width: 400, gap: 10 }} >
					<Typography type='h4' label='Name' />
					<Typography type='p1' label='Give your gig a name!' />
					<TextField placeholder='Name' value={name} disabled={loading} />
					<Shown value={name.map(n => {

						// 
						return n.length > 0 ? true : false
					})}>
						<Typography type='h1' label='THIS IS AN ERROR' />
					</Shown>
				</div>
				<div theme='column' style={{ width: 400, gap: 10 }} >
					<Typography type='h4' label='Sub Name' />
					<Typography type='p1' label='A sub name appears below the name of your gig in search results and recommendations.' />
					<TextField placeholder='Sub Name' value={subName} disabled={loading} />
				</div>
				<div theme='column' style={{ width: 400, gap: 10 }} >
					<Typography type='h4' label='Description' />
					<Typography type='p1' label='Give your gig a nice and detailed description.' />
					<TextArea style={{ width: '100%' }} placeholder='Description' value={description} disabled={loading} />
				</div>

				<div theme='column' style={{ width: 400, gap: 10 }}>
					<Typography type='h4' label='Tags' />
					<Typography type='p1' label='Add some tags to help people find your gig!' />
					<div
						theme={[
							'row_radius_focusable',
							focusedTag.map(f => f ? "focused" : null),
						]}
						style={{ background: '$color_main', padding: 4, marginBottom: 10 }}
					>
						{/* TODO: Some kind of dropdown with suggested tags form the db */}
						{/* DB tag search system like instagram hashtags and such. */}
						<TextField
							value={curTag}
							style={{ width: '100%', border: 'none', outline: 'none' }}
							isFocused={focusedTag}
							placeholder='Add a tag'
							onKeyDown={e => {
								if (e.key === 'Enter') {
									e.preventDefault();
									if (curTag.get().length > 0) {
										tags.push(curTag.get());
										curTag.set('');
									}
								} else if (e.key === 'Escape') {
									curTag.set('');
									focusedTag.set(false);
									e.preventDefault();
								}
							}}
							disabled={loading}
						/>
						<Button
							type='icon'
							style={{
								padding: 0,
								height: 40,
								width: 40,
								borderRadius: 50,
								flexShrink: 0,
							}}
							icon={<Icon name='plus' size={30} />}
							onClick={() => {
								if (curTag.get().length > 0) {
									tags.push(curTag.get());
									curTag.set('');
								}
							}}
							disabled={Observer.all([loading, curTag]).map(([l, c]) => {
								if (l) return true
								if (!c) return true
								else return false
							})}
						/>
					</div>
					<div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: 40 }}>
						<Tag each={tags} />
					</div>
					<div theme='divider' />
				</div>
				<Button
					type='contained'
					label='Publish'
					onClick={async () => {
						loading.set(true);
						const response = await modReq('gigs/Create', {
							type: type.get() === 0 ? 'gig_service' : 'gig_request',
							name: name.get(),
							subName: subName.get(),
							description: description.get(),
							tags,
						});

						console.log(response);

						loading.set(false)

						// if (all good no errors? ) {
						//     go to gig post page
						// } else {
						//     stay on this forum
						// }
						// TODO: Check if fields are valid, show user error fields that are incorrect.
						// TODO: send request to backend

					}}
					disabled={loading}
				/>
			</div>

		</Paper>
		<Footer />
	</div>;
};

export default {
	authenticated: true,
	page: CreateGig,
};
