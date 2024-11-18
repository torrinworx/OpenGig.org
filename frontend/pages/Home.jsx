import { Button, Icon, Detached, popups, Paper, useRipples, Checkbox, Typography } from "destamatic-ui";

import Logo from '/OpenGig.svg';
import { Observer } from "destam-dom";

export const Ham = ({ options }) => {
	const value = Observer.mutable('');
	const focused = Observer.mutable(false);

	const Selectable = ({ each: option }) => {
		const [ripples, createRipple] = useRipples('rgba(0, 0, 0, 0.3)');

		return <div
			theme={[
				"select_selectable",
			]}
			onMouseDown={e => {
				createRipple(e);
				value.set(option);
				focused.set(false);
			}}
		>
			{option}
			{ripples}
		</div>;
	};

	return <span>
		<Detached
			focusable={false}
			enabled={focused}
			menu={null}
			type='icon'
			icon={<Icon size="40" libraryName="feather" iconName="menu" />}
		>
			<Paper style={{
				minWidth: 100,
				padding: 0,
				overflow: 'auto',
				marginRight: 5,
			}}>
				<Selectable each={options} />
			</Paper>
		</Detached>
		{popups}
	</span>;
};

export default ({ state }) => {
	const options = [
		<Button
			type="icon"
			Icon={<Icon size="40" libraryName="feather" iconName="settings" />}
			onMouseDown={() => { }}
		/>,
		<Button
			type="icon"
			Icon={<Icon size="40" libraryName="feather" iconName="user" />}
			onMouseDown={() => { }}
		/>,
		<Button
			type="icon"
			Icon={<Icon size="40" libraryName="feather" iconName="twitter" />}
			onMouseDown={() => { }}
		/>,
		<Button
			type='text'
			onMouseDown={() => {
				document.cookie = 'webCore=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
				window.location.reload();
			}}
			label='Sign Out'
		/>
	]

	return <div theme='page'>
		<div theme='header'	>
			<img src={Logo} style={{ height: '75px', userSelect: 'none' }} />
			<Ham options={options} />
		</div>
		<Typography type='h4' >5000 checkboxes:</Typography>
		<div style={{ display: 'flex', flexWrap: 'wrap' }}>
			{Array(5000).fill(null).map((_, i) =>
				i ? <Checkbox value={Observer.mutable(true)} /> : null
			)}
		</div>
	</div>;
};
