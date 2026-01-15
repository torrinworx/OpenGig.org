import { Observer, OArray } from "destam-dom";
import { modReq } from 'destam-web-core/client';
import {
	Button,
	Icon,
	Typography,
	TextField,
	TextArea,
	Validate,
	ValidateContext,
	Shown,
	StageContext,
} from "destamatic-ui";

const NewGig = StageContext.use(stage => () => {
	const disabled = Observer.mutable(false);

	const type = Observer.mutable('Request');
	const name = Observer.mutable(''); // 40 character limit
	const description = Observer.mutable(''); // 2000 character limit.
	const tags = OArray([]);
	const curTag = Observer.mutable('');

	const focused = Observer.mutable(false);
	const hovered = Observer.mutable(false);
	const buttonHovered = Observer.mutable(false);

	const submit = Observer.mutable(false);
	const allValid = Observer.mutable(true);
	const error = Observer.mutable('');

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
				onClick={() => tags.pop(index, 1)}
				disabled={disabled}
			/>
			<Typography
				type="p1"
				label={tag}
			/>
		</div>;
	};

	const tagsLength = Observer.mutable(0);
	tags.observer.watch(() => tagsLength.set(tags.length));

	return <ValidateContext value={allValid}>
		<div theme='column_fill_contentContainer' style={{ gap: 60 }} >
			<div theme='fill_center' style={{ marginBottom: 60 }}>
				<Typography type='h1' label='Create a Gig!' />
			</div>

			<div theme='column' style={{ gap: 10 }} >
				<div theme='row_center_fill_spread_wrap'>
					<Typography type='h2' label='Type' />
					<div theme='row_radius_primary_focused_tight' style={{ overflow: 'clip' }}>
						<Button
							style={{ borderRadius: '0px' }}
							label='Request'
							type={type.map(f => f === 'Request' ? 'contained' : 'text')}
							onClick={() => type.set('Request')}
							disabled={disabled}
						/>
						<Button
							style={{ borderRadius: '0px' }}
							label='Offer'
							type={type.map(f => f === 'Offer' ? 'contained' : 'text')}
							onClick={() => type.set('Offer')}
							disabled={disabled}
						/>
					</div>
				</div>
				<div theme='divider' />
				<Typography type='p1' label={type.map(t => {
					const base = 'Are you requesting a gig or offering one?';
					if (t === 'Offer') {
						return <>{base} <b>Offering a service means that users can seek your service and contact you for work.</b></>;
					} else {
						return <>{base} <b>Requesting a service means that workers can apply and provide a quote for your gig.</b></>;
					}
				})} />
			</div>

			<div theme='column' style={{ gap: 10 }} >
				<div theme='row_center_fill_spread_wrap'>
					<Typography type='h2' label='Name' />
					<div theme='column_tight' style={{ marginTop: 25 }}>
						<TextField
							type='contained'
							placeholder="Alice's Plumbing Services"
							value={name}
							disabled={disabled}
						/>
						<div theme='row_fill_spread_end'>
							<Validate
								value={name}
								signal={submit}
								validate={val => {
									const v = (val.get() || '').trim();
									if (!v) return 'Name is required.';
									if (v.length > 40) return 'Name must be 40 characters or less.';
									return '';
								}}
							/>
							<Typography
								type='p2'
								label={name.map(n => `40/${n.length}`)}
								style={{ color: name.map(n => n.length > 40 ? '$color_error' : '$color') }}
							/>
						</div>
					</div>
				</div>
				<div theme='divider' />
				<Typography type='p1' label="Give your gig a name! Everyone will see this, no pressure... 😉" />
			</div>

			<div theme='column' style={{ gap: 10 }} >
				<Typography type='h2' label='Description' />
				<div theme='divider' />
				<Typography type='p1' label='Give your gig a nice and detailed description.' />

				<div theme='column_tight'>
					<TextArea
						type='contained'
						style={{ width: '100%', minHeight: 200 }}
						placeholder='Description'
						value={description}
						maxHeight={500}
						disabled={disabled}
					/>
					<div theme='row_fill_end'>
						<Validate
							value={description}
							signal={submit}
							validate={val => {
								const v = (val.get() || '').trim();
								if (!v) return 'Description is required.';
								if (v.length > 2000) return 'Description must be 2000 characters or less.';
								return '';
							}}
						/>
						<Typography
							type='p2'
							label={description.map(n => `2000/${n.length}`)}
							style={{ color: description.map(d => d.length > 2000 ? '$color_error' : '$color') }}
						/>
					</div>
				</div>
			</div>

			<div theme='column' style={{ gap: 10 }}>
				<div theme='row_center_fill_spread_wrap'>
					<Typography type='h2' label='Tags' />
					<div theme='column_tight' style={{ marginTop: 25 }}>

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
								style={{ background: 'none', border: 'none', outline: 'none' }}
								isFocused={focused}
								isHovered={hovered}
								placeholder='Add a tag'
								onKeyDown={e => {
									if (e.key === 'Enter') {
										e.preventDefault();

										const t = (curTag.get() || '').trim();
										if (curTag.get().length < 20 && t.length > 0 && tagsLength.get() < 5) {
											tags.push(t);
											curTag.set('');
										}
									} else if (e.key === 'Escape') {
										curTag.set('');
										e.preventDefault();
									}
								}}
								disabled={disabled}
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
									const t = (curTag.get() || '').trim();
									if (t.length > 0) {
										tags.push(t);
										curTag.set('');
									}
								}}
								disabled={curTag.map(ct => ct.trim().length === 0 || ct.length > 20)}
							/>
						</div>
						<div theme='row_fill_end'>
							<Validate
								value={tags.observer}
								signal={submit}
								validate={val => {
									const list = val.get(); // this is the OArray
									const arr = [...list];

									if (arr.length === 0) return 'Add at least one tag.';
									if (arr.length > 5) return 'Max 5 tags.';

									const cleaned = arr.map(t => (t || '').trim()).filter(Boolean);
									if (cleaned.length !== arr.length) return 'Tags can’t be empty.';

									const lower = cleaned.map(t => t.toLowerCase());
									if (new Set(lower).size !== lower.length) return 'Tags must be unique.';

									const bad = cleaned.find(t => t.length > 20);
									if (bad) return 'Each tag must be 20 characters or less.';

									return '';
								}}
							/>
							<Typography
								type='p2'
								label={curTag.map(t => `20/${t.length}`)}
								style={{ color: curTag.map(t => t.length > 20 ? '$color_error' : '$color') }}
							/>
						</div>
					</div>
				</div>

				<div theme='divider' />
				<Typography type='p1' label='Add some tags to help people find your gig!' />

				<div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: 40 }}>
					<Tag each={tags} />
					<Shown value={tagsLength.map(t => t > 0)}>
						<div theme='row_fill_end'>
							<Typography
								type='p2'
								label={tagsLength.map(t => `5/${t}`)}
								style={{ color: tagsLength.map(t => t > 5 ? '$color_error' : '$color') }}
							/>
						</div>
					</Shown>
				</div>
			</div>

			<div theme='column_fill_center'>
				<Typography type="validate" label={error} />
				<Button
					type='contained'
					label='Publish'
					onClick={async () => {
						error.set('')
						disabled.set(true);

						// trigger all validators using this signal
						submit.set({ value: true });

						if (!allValid.get()) {
							disabled.set(false);
							return;
						}

						const response = await modReq('gigs/Create', {
							type: type.get() === 0 ? 'gig_service' : 'gig_request',
							name: name.get(),
							description: description.get(),
							tags,
						});

						if (response.error) {
							error.set(response.error);
							disabled.set(false);
						} else {
							stage.open({ name: 'gig' });
						}
					}}
					disabled={disabled}
				/>
			</div>
		</div>
	</ValidateContext>;
});

export default NewGig;
