import { Observer } from "destam-dom";
import { Icon, Detached, popups, Paper, useRipples } from "destamatic-ui";

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

export default Ham;
