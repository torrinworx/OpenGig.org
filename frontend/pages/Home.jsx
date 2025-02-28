import { Observer } from "destam-dom";
import { Theme, Button, Paper, Toggle, Typography, TextField, Icon } from "destamatic-ui";

import Header from "../components/Header";

Theme.define({
	gigtile: {
		background: '$color_main',
		padding: '10px',
		boxSizing: 'border-box',
		maxWidth: '300px',
		width: '100%',
		display: 'flex',
		flexDirection: 'column',
		gap: 10
	},

	gigtile_hovered: {
		background: '$color_hover'
	}
})

const Gig = ({ each: gig }) => {
	const hover = Observer.mutable(false);

	return <Button style={{ padding: 0 }} onClick={() => { }}>
		<div
			theme={[
				'radius',
				'gigtile',
				hover.map(h => h ? 'hovered' : null),
			]}
			isHovered={hover}
		>
			<div theme='center_radius' style={{
				height: '150px',
				backgroundColor: '$color_top',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				flexShrink: 0
			}}>
				<Icon libraryName='feather' iconName='image' size={20} />
			</div>
			<div style={{
				display: 'flex',
				alignItems: 'center',
				gap: '10px',
				flexShrink: 0
			}}>
				<div style={{
					width: '25px',
					height: '25px',
					backgroundColor: '$color_top',
					borderRadius: '50%',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center'
				}}>
					<Icon libraryName='feather' iconName='user' size={20} />
				</div>
				<Typography type='p1' label={gig.userName} style={{ color: '$color_top' }} />
			</div>
			<div theme='column' style={{ flexGrow: 1 }}>
				<Typography type='h6_bold' label={gig.name} style={{ color: '$color_top', textAlign: 'left' }} />
				<Typography type='p2' label={gig.tagline} style={{ color: '$color_top', textAlign: 'left' }} />
			</div>
		</div>
	</Button>;
};

export default ({ state }) => {
	const exampleGigs = [
		{
			userName: 'Bob',
			name: 'Plumbing',
			type: 'Home Improvement',
			description: 'Fixing leaks and installing new fixtures.',
			comments: [
				{
					userName: 'John',
					description: 'Great service, fixed my sink quickly!',
					created: '2023-10-01',
				},
			],
			tags: ['Plumbing', 'Handyman'],
			tagline: "Leaky sink? No problem - reliable fixes made easy."
		},
		{
			userName: 'Alice',
			name: 'Graphic Design',
			type: 'Creative & Design',
			description: 'Designing logos and branding assets.',
			comments: [
				{
					userName: 'Eve',
					description: 'Loved the logo you designed for my brand!',
					created: '2023-09-25',
				},
			],
			tags: ['Design', 'Graphic Design'],
			tagline: "Crafting your brand's identity with creativity and style."
		},
		{
			userName: 'Charlie',
			name: 'Web Development',
			type: 'Tech & Software',
			description: 'Developing responsive websites and web apps.',
			comments: [
				{
					userName: 'Dave',
					description: 'The new website works flawlessly and looks great!',
					created: '2023-09-20',
				},
			],
			tags: ['Web Development', 'Technology'],
			tagline: "Building sleek, responsive websites that captivate."
		},
		{
			userName: 'Diana',
			name: 'Gardening Service',
			type: 'Outdoor & Garden',
			description: 'Lawn care, planting, and garden design.',
			comments: [
				{
					userName: 'Bob',
					description: 'Thank you for making my garden look beautiful!',
					created: '2023-09-15',
				},
			],
			tags: ['Gardening', 'Landscaping'],
			tagline: "Transforming your outdoors with a touch of nature's charm."
		},
		{
			userName: 'Ethan',
			name: 'Tutoring - Math',
			type: 'Education & Coaching',
			description: 'Providing math tutoring for high school students.',
			comments: [
				{
					userName: 'Fiona',
					description: 'Really helped my daughter improve her grades!',
					created: '2023-10-03',
				},
			],
			tags: ['Tutoring', 'Education', 'Math'],
			tagline: "Making math easy and fun, one lesson at a time."
		},
	];

	const focused = Observer.mutable(false);
	const query = Observer.mutable('');

	return <div theme='page'>
		<Header state={state}>
			<div theme='row'>
				<Toggle
					value={Observer.mutable(true)}
					onChange={isChecked => {
						window.themeMode.set(isChecked ? 'dark' : 'light');
					}}
				/>
				<Button
					type='text'
					style={{ color: '$color_main' }}
					onMouseDown={() => {
						document.cookie = 'webCore=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
						window.location.reload();
					}}
					label='Sign Out'
				/>
			</div>
		</Header>
		<Paper>
			<Typography type='h1' label='Header 1' />
			<Typography type='h2' label='Header 2' />
			<Typography type='h3' label='Header 3' />
			<Typography type='h4' label='Header 4' />
			<Typography type='h5' label='Header 5' />
			<Typography type='h6' label='Header 6' />
			<Typography type='p1' label='Paragraph 1' />
			<Typography type='p2' label='Paragraph 2' />
			<Typography type='p1_regular' label='Paragraph 1 Regular' />
			<Typography type='p1_bold' label='Paragraph 1 Bold' />
			<Typography type='p1_italic' label='Paragraph 1 Italic' />
			<div theme='row' style={{ gap: 10 }}>
				<Button type='contained' label='Button' onClick={() => { }} />
				<Button type='outlined' label='Button' onClick={() => { }} />
				<Button type='text' label='Button' onClick={() => { }} />
			</div>
			<div theme='column' style={{ gap: 10 }} >
				<TextField placeholder='Email' value={Observer.mutable('')} />
				<TextField />
				<TextField />
			</div>

			<div theme='row_spread'>
				<Typography type='h1' label='Gigs' />
				<div
					theme={[
						'row_radius_focusable',
						focused.map(f => f ? "focused" : null),
					]}
					style={{ background: '$color_main' }}
				>
					<TextField
						onChange={e => query.set(e.target.value)}
						value={query}
						style={{ border: 'none', outline: 'none' }}
						isFocused={focused}
						placeholder='Search Gigs'
						onKeyDown={e => {
							if (e.key === 'Enter') {
								e.preventDefault();
							} else if (e.key === 'Escape') {
								query.set('');
								focused.set(false);
								e.preventDefault();
							}
						}}
					/>
					<Button
						type='icon'
						Icon={<Icon
							libraryName='feather'
							iconName='search'
							size={20}
							style={{ color: '$color_top' }}
						/>}
						onClick={() => { }}
					/>
				</div>
			</div>
			<div style={{
				display: 'grid',
				gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
				gap: '10px'
			}}>
				<Gig each={exampleGigs} />
			</div>
		</Paper>
	</div>;
};
