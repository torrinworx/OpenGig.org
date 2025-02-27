import { Observer } from "destam-dom";
import { Button, Paper, Toggle } from "destamatic-ui";

import Header from "../components/Header";

export default ({ state }) => {
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
					onMouseDown={() => {
						document.cookie = 'webCore=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
						window.location.reload();
					}}
					label='Sign Out'
				/>
			</div>
		</Header>
		<Paper>
			ui goes here
		</Paper>
	</div>;
};
