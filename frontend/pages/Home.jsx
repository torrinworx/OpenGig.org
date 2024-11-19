import { Tabs, Button, Icon, Paper, Typography } from "destamatic-ui";

import Ham from "../components/Ham";
import Header from "../components/Header";

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
