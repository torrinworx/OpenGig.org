import { TextField, Button, Icon, Observer } from 'destamatic-ui';

const SearchBar = () => {
	const query = Observer.mutable('');
	const focused = Observer.mutable(false);
	const hovered = Observer.mutable(false);

	const buttonHovered = Observer.mutable(false);

	const search = () => {
		console.log('search');
	}

	return <div
		theme={[
			'row_radius_primary',
			focused.bool("focused", null),
		]}
		style={{ background: hovered.bool("$color_hover", '$color'), gap: 5, overflow: 'clip', paddingRight: 5 }}
	>
		<TextField
			type='contained'
			value={query}
			style={{ background: 'none', border: 'none', outline: 'none', }}
			isFocused={focused}
			isHovered={hovered}
			placeholder='Search Gigs'
			onKeyDown={e => {
				if (e.key === 'Enter') {
					e.preventDefault();
					search();
				} else if (e.key === 'Escape') {
					query.set('');
					focused.set(false);
					e.preventDefault();
				}
			}}
		/>
		<Button
			type='text'
			hover={buttonHovered}
			round
			icon={<Icon name='feather:search' style={{
				color: Observer.all([hovered, buttonHovered])
					.map(([h, bh]) => h ? "$color" : bh ? "$color" : "$color_background")
			}} />}
			onClick={search}
		/>
	</div>;
};

export default SearchBar;
