
import { OObject } from "destam-dom";
import { Observer } from "destam-dom";
import { atomic } from "destam/Network";

const mainColors = {
	$color_purple: '#500089',
	$color_white: '#FFFFFF',
	$color_slate: '#7F6BFE',
};

const themeModes = {
	light: {
		$color: mainColors.$color_purple,
		$color_top: mainColors.$color_purple,
		$color_background: mainColors.$color_white
	},

	dark: {
		$color: mainColors.$color_white,
		$color_top: mainColors.$color_white,
		$color_background: mainColors.$color_purple
	},
};

const theme = OObject({
	'*': {
		fontFamily: '"IBM Plex Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif',
	},

	primary: OObject({
		$color_hover: mainColors.$color_slate,
		$color_disabled: 'gray'
	}),

	paper: {
		extends: ['radius'],
		boxShadow: 'none',
		padding: 20,
		background: '$color_background',
		color: '$color_text',
		maxWidth: 'inherit',
		maxHeight: 'inherit',
		border: 'solid $color_top 2px'
	},

	typography: {
		color: '$color',
	},

	button_contained: {
		color: '$color_background',
	},

	button_contained_hovered: {
		color: '$color',
	},

	button_outlined_hovered: {
		background: '$color_hover',
	},

	button_text_hovered: {
		background: '$color_hover',
	},

	button_link_clicked: {
		color: '$color_hover',
	},

	togglethumb: {
		background: '$color',
	},

	togglethumb_contained: {
		extends: 'primary',
		background: '$color_background',
	},

	loadingDots_dot_contained: {
		background: '$color_background',
	},

	contentContainer: {
		padding: 20,
		maxWidth: 800,
	},

	divider: {
		marginTop: 10,
		marginBottom: 10,
		background: '$color_top',
	},

	divider_secondary: {
		extends: 'secondary',
		background: '$color_top',
	},
});

window.themeMode = Observer.mutable(window.matchMedia("(prefers-color-scheme:dark)").matches ? true : false);
window.theme = theme;
document.documentElement.style.backgroundColor = theme.observer.path(['primary', '$color_background']);
window.themeMode.effect(mode => atomic(() => {
	mode = mode ? 'dark' : 'light';
	for (const [key, val] of Object.entries(themeModes[mode])) {
		theme['primary'][key] = val;
	}
}));

export default theme;
