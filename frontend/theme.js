import { OObject } from "destam-dom";
import { Observer } from "destam-dom";
import { atomic } from "destam/Network";
import FeatherIcons from "destamatic-ui/components/icons/FeatherIcons";

const mainColors = {
	$color_purple: '#500089',
	$color_aqua: '#00FFFF',
	$color_pink: '#FF00FF',
	$color_white: '#FFFFFF',
	$color_black: '#1A1035',
	$color_slate: '#7F6BFE'
};

const themeModes = {
	light: {
		$color_main: mainColors.$color_white,
		$color_text: mainColors.$color_purple,
		$color_top: mainColors.$color_purple,
		$color_hover: mainColors.$color_slate,
		$color_hover_top: mainColors.$color_white,
	},

	dark: {
		$color_main: mainColors.$color_purple,
		$color_text: mainColors.$color_white,
		$color_top: mainColors.$color_white,
		$color_hover: mainColors.$color_slate,
		$color_hover_top: mainColors.$color_white,
	}
};

const transition = '250ms ease-in-out';

const theme = OObject({
	// destamatic-ui
	'*': OObject({
		fontFamily: 'IBM Plex Sans',
		fontWeight: 600,
		boxSizing: 'border-box',
		transition: `opacity ${transition}, box-shadow ${transition}, background-color ${transition}, color ${transition}, border-color ${transition}`,
	}),

	// Override destamatic-ui primary theme
	primary: {
		$color: '$color_main',
		$color_hover: '$color_hover',
		$color_top: '$color_top',
	},

	shadow: {
		boxShadow: '4px 4px 10px $alpha($color_top, 0.2)',
	},

	paper: {
		extends: ['*', 'radius'],
		padding: 30,
		background: '$color_main',
		color: '$color_text',
		maxWidth: 'inherit',
		maxHeight: 'inherit',
		border: 'solid $color_top 2px'
	},

	radius: {
		borderRadius: 16
	},

	toggle: {
		display: 'flex',
		alignItems: 'center',
		cursor: 'pointer',
		overflow: 'clip',
		position: 'relative',
		width: '60px',
		height: '30px',
		background: '$color_top',
		borderRadius: '37.5px',
	},

	toggle_hovered: {
		background: '$color_hover'
	},

	toggleknob: {
		position: 'absolute',
		top: '50%',
		transform: 'translateX(4px) translateY(-50%) scale(1)',
		width: '23px',
		height: '23px',
		background: '$color_main',
		borderRadius: '50%',
		transition: 'transform 150ms cubic-bezier(0.4, 0.0, 0.2, 1), background-color 150ms ease-in-out',
	},

	typography: {
		color: '$color_text',
		display: 'block'
	},
	typography_h1: {
		color: '$color_text',
		fontSize: 62
	},
	typography_h2: {
		color: '$color_text',
		fontSize: 56
	},
	typography_h3: {
		color: '$color_text',
		fontSize: 36
	},
	typography_h4: {
		color: '$color_text',
		fontSize: 30
	},
	typography_h5: {
		color: '$color_text',
		fontSize: 24
	},
	typography_h6: {
		color: '$color_text',
		fontSize: 20
	},
	typography_p1: {
		color: '$color_text',
		fontSize: 16
	},
	typography_p2: {
		color: '$color_text',
		fontSize: 14
	},
	typography_regular: { fontStyle: 'normal' },
	typography_bold: { fontWeight: 'bold' },
	typography_italic: { fontStyle: 'italic' },
	typography_center: { textAlign: 'center' },
	typography_inline: { display: 'inline' },

	button: {
		extends: 'center_radius',
		padding: '10px 15px',
		userSelect: 'none',
		border: 'none',
		cursor: 'pointer',
		textDecoration: 'none',
		position: 'relative',
		overflow: 'clip',
		color: '$color_top',
		boxShadow: 'none',
		background: 'none',
		_cssProp_focus: { outline: 'none' },
	},

	button_text_hovered: {
		background: 'none',
		color: '$color_hover'
	},

	button_contained: {
		extends: 'typography_p1_bold',
		background: '$color_top',
		color: '$color_main',
	},

	button_contained_hovered: {
		background: '$color_hover',
		color: '$color_hover_top'
	},

	button_outlined: {
		extends: 'typography_p1_bold',
		borderWidth: 2,
		borderStyle: 'solid',
		borderColor: '$color_top',
		color: '$color_top',
	},

	button_outlined_hovered: {
		color: '$color_hover',
		borderColor: '$color_hover',
	},

	button_outlined_disabled: {
		borderColor: '$saturate($color, -1)',
		color: '$saturate($color, -1)',
	},

	button_contained_disabled: {
		$bg: '$saturate($color, -1)',
		background: '$bg',
		color: '$contrast_text($bg)',
	},

	button_icon: {
		color: '$color_top',
	},

	button_icon_hovered: {
		color: '$color_hover',
	},

	text: {
		extends: 'typography_p1_regular',
		color: '$color_top'
	},

	text_hovered: {
		color: '$color_hover'
	},

	focusable: {
		borderStyle: 'solid',
		borderWidth: 2,
		borderColor: '$color_top',
		transitionDuration: '0.3s',
		transitionProperty: 'border-color, background-color, box-shadow',
	},

	focused: {
		boxShadow: '$color_hover 0 0 0 0.2rem',
	},

	field: {
		extends: 'radius_typography_p1_regular_focusable',
		outline: 0,
		padding: 10,
		background: '$color_main',
		color: '$color_top',
	},

	loadingDots_dot: {
		_keyframes_animationName: `
			0%, 100% { opacity: 0; }
			50% { opacity: 1; }
		`,

		background: '$color_top',
		display: 'inline-block',
		width: '8px',
		height: '8px',
		borderRadius: '50%',
		animationName: '$animationName',
		animationDuration: '1s',
		animationIterationCount: 'infinite',
		animationTimingFunction: 'ease-in-out',
		margin: '20px 4px',
	},

	radio_ring_1: {
		overflow: 'clip',
		border: '3px solid $color_text',
		width: '$size$px',
		height: '$size$px',
	},

	radio_ring_3: {
		// Use a scale transform instead of explicit width/height expansions.
		// This helps avoid jitter and feels more fluid.
		transition: 'transform 150ms cubic-bezier(0.4, 0.0, 0.2, 1), background-color 150ms ease-in-out',
		background: '$color_text',
		borderRadius: '50%',
		width: '100%',
		height: '100%',
		transform: 'scale(0)',
	},

	// custom
	page: {
		background: '$color_main',
		padding: '40px',
		gap: '40px',
		display: 'flex',
		flexDirection: 'column',
		height: '100%',
		minHeight: '100vh'
	},

	divider: {
		width: '100%',
		height: '1px',
		background: '$color_text',
		margin: '20px 0'
	}
});

window.themeMode = Observer.mutable(window.matchMedia("(prefers-color-scheme:dark)").matches ? true : false);
window.theme = theme;

window.themeMode.effect(mode => atomic(() => {
	mode = mode ? 'dark' : 'light'; // if mode is true => dark mode, else false => light mode
	for (const [key, val] of Object.entries(themeModes[mode])) {
		theme['*'][key] = val;
	}
}));

export default {
	theme,
	icons: [{
		search: FeatherIcons('search'),
		x: FeatherIcons('x'),
		user: FeatherIcons('user'),
		image: FeatherIcons('image'),
		feather: FeatherIcons('feather'),
		globe: FeatherIcons('globe'),
		github: FeatherIcons('github'),
	},
		FeatherIcons
	],
	define: (...args) => atomic(() => {
		let prefix = '';
		let i = 0;

		for (; i < args.length; i++) {
			if (typeof args[i] === 'string') {
				prefix += args[i] + '_';
			} else {
				break;
			}
		}

		const obj = args[i];
		for (const o in obj) {
			let name;
			if (o === '*') {
				name = prefix.substring(0, prefix.length - 1);
			} else {
				name = prefix + o;
			}

			if (name in theme) throw new Error("Theme.define: theme definition already exists: " + o);
			theme[name] = obj[o];
		}
	}),
};
