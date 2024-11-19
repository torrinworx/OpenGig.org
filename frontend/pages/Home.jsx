import { Observer } from "destam-dom";
import { Tabs, Button, Icon, Detached, popups, Paper, useRipples, Typography } from "destamatic-ui";

import Header from "../components/Header";

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

	return <span style={{ zIndex: 100 }}>
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
				marginRight: 20,
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
		<Header>
			<Ham options={options} />
		</Header>
		<Paper theme={['secondary']} style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					flexDirection: 'column',
					background: '$color',
					color: '$color_top',
		}}>
			<Tabs style={{ width: '100%' }}>
				<mark:tab name='Freelance'>
					<Typography>Freelance UI goes here lol</Typography>
				</mark:tab>
				<mark:tab name='Rides'>
					<Typography>TODO</Typography>
				</mark:tab>
				<mark:tab name='Delivery'>
					<Typography>TODO</Typography>
				</mark:tab>
			</Tabs>
		</Paper>
	</div>;
};
