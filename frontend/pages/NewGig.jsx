
import { Observer, OArray } from "destam-dom";
import { modReq } from 'destam-web-core/client';
import {
	Button,
	Icon,
	Typography,
	TextField,
	TextArea
} from "destamatic-ui";

const NewGig = () => {
	const loading = Observer.mutable(false);

	const name = Observer.mutable(''); // 40 character limit
	const description = Observer.mutable(''); // 2000 character limit.
	const tags = OArray([]); // somehow preload this with some tags db that is ranked by users or something??? we should setup something like instagram hashtags
	const curTag = Observer.mutable('');

	const Tag = ({ each: tag }) => {
		const index = tags.indexOf(tag);

		return <div
			theme="row_center_primary_radius"
			style={{
				border: '2px $color solid',
				display: 'flex',
				padding: 8,
				gap: 4
			}}
		>
			<Button
				type="text"
				style={{ margin: 0 }}
				round
				icon={<Icon name="feather:x" size={20} />}
				onClick={() => tags.pop(index)}
			/>
			<Typography
				type="p1"
				label={tag}
			/>
		</div>;
	};

	const type = Observer.mutable('Request')
	const focused = Observer.mutable(false);
	const hovered = Observer.mutable(false);
	const buttonHovered = Observer.mutable(false);


	return <div theme='column_fill_contentContainer' style={{ gap: 60 }} >
		<div theme='fill_center' style={{ marginBottom: 60 }}>
			<Typography type='h1' label='Create a Gig!' />
		</div>

		<div theme='column' style={{ gap: 10 }} >
			<div theme='row_center_fill_spread_wrap'>
				<Typography type='h2' label='Type' />
				<div theme='row_radius_primary_focused_tight' style={{ overflow: 'clip' }}>
					<Button style={{ borderRadius: '0px' }} label='Request' type={type.map(f => f === 'Request' ? 'contained' : 'text')} onClick={() => type.set('Request')} />
					<Button style={{ borderRadius: '0px' }} label='Offer' type={type.map(f => f === 'Offer' ? 'contained' : 'text')} onClick={() => type.set('Offer')} />
				</div>
			</div>
			<div theme='divider' />
			<Typography type='p1' label={type.map(t => {
				const base = 'Are you requesting a gig or offering services?'
				if (t === 'Offer') {
					return <>{base} <b>Offering a service means that users can seek your service and contact you for work.</b></>;
				} else {
					return <>{base} <b>Requesting a service means that workers can apply and provide a quote for your gig.</b></>
				}
			})} />
		</div>
		<div theme='column' style={{ gap: 10 }} >
			<div theme='row_center_fill_spread_wrap'>
				<Typography type='h2' label='Name' />
				<TextField type='contained' placeholder="Alice's Plumbing Services" value={name} />
			</div>
			<div theme='divider' />
			<Typography type='p1' label='Give your gig a name! Everyone will see this, no pressure... 😉' />
		</div>
		<div theme='column' style={{ gap: 10 }} >
			<Typography type='h2' label='Description' />
			<div theme='divider' />
			<Typography type='p1' label='Give your gig a nice and detailed description.' />
			<TextArea type='contained' style={{ width: '100%', minHeight: 200 }} placeholder='Description' value={description} />
		</div>

		<div theme='column' style={{ gap: 10 }}>
			<div theme='row_center_fill_spread_wrap'>
				<Typography type='h2' label='Tags' />
				<div
					theme={[
						'row_radius_primary',
						focused.bool("focused", null),
					]}
					style={{ background: hovered.bool("$color_hover", '$color'), gap: 5, overflow: 'clip', paddingRight: 5 }}
				>
					<TextField
						type='contained'
						value={curTag}
						style={{ background: 'none', border: 'none', outline: 'none', }}
						isFocused={focused}
						isHovered={hovered}
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
								e.preventDefault();
							}
						}}
					/>
					<Button
						type='text'
						hover={buttonHovered}
						round
						icon={<Icon name='feather:plus' style={{
							color: Observer.all([hovered, buttonHovered])
								.map(([h, bh]) => h ? "$color" : bh ? "$color" : "$color_background")
						}} />}
						onClick={() => {
							if (curTag.get().length > 0) {
								tags.push(curTag.get());
								curTag.set('');
							}
						}}
					/>
				</div>
			</div>
			<div theme='divider' />
			<Typography type='p1' label='Add some tags to help people find your gig!' />

			<div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: 40 }}>
				<Tag each={tags} />
			</div>
		</div>
		<div theme='column_fill_center'>
			<Button
				type='contained'
				label='Publish'
				onClick={async () => {
					loading.set(true);
					// const response = await modReq('gigs/Create', {
					// 	type: type.get() === 0 ? 'gig_service' : 'gig_request',
					// 	name: name.get(),
					// 	subName: subName.get(),
					// 	description: description.get(),
					// 	tags,
					// });

					// loading.set(false)

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
	</div>
};

export default NewGig;
