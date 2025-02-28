import { Observer } from "destam-dom";
import { Button, Paper, Toggle, Typography, TextField } from "destamatic-ui";

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
		</Paper>
	</div>;
};
