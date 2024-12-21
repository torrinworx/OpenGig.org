import { atomic } from "destam/Network";
import { OObject } from "destam-dom";


// https://coolors.co/f83a3a-fffc47-00fa53-1e8eff-a683ec
const theme = OObject({
    '*': {
        fontFamily: 'IBM Plex Sans',
        fontWeight: 600,
    },
    primary: {
        $color: '#00FA53', // Vomit green
        $color_hover: '$alpha($color, 0.2)',
        $color_error: 'red',
        $color_top: '$contrast_text($color)',
        transition: 'opacity 250ms ease-out, box-shadow 250ms ease-out, color 250ms ease-out, background-color 250ms ease-in-out'
    },
    secondary: {
        $color: '#1E8EFF',  // Vomit blue
        $color_hover: '$alpha($color, .2)',
        $color_top: '$contrast_text($color)',
    },
    error: {
        $color: '#F83A3A'
    },
    warning: {
        $color: '#FFFC47'
    },
    default: {
        $color: '#A683EC'
    },
    radius: {
        borderRadius: 8,
    },
    ripple: {
        background: 'rgba(256, 256, 256, .8)'
    },
    boxShadow: {
        boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px',
    },
    button: {
        extends: ['primary', 'center', 'radius'],

        height: '45px',
        padding: '5px 12px',
        userSelect: 'none',
        border: 'none',
        cursor: 'pointer',
        textDecoration: 'none',
        position: 'relative',
        overflow: 'clip',
    },
	button_icon: {
        color: '$color',
		backgroundColor: 'transparent',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		aspectRatio: '1 / 1',
		width: 'auto',
		height: '100%',
	},
	button_icon_hovered: {
		extends: 'secondary',
		background: 'transparent',
		color: '$color',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		aspectRatio: '1 / 1',
		width: 'auto',
		height: '100%',
	},
    button_text: {
        width: "auto",
        boxShadow: 'none',
    },
    button_text_hovered: {
        extends: 'secondary',
        width: "auto",
        color: '$color',
        boxShadow: 'none',
        background: 'transparent'
    },
    button_contained_hovered: {
        extends: 'secondary',
        background: '$color',
    },

    button_tab: {
		width: '100%',
		borderRadius: '20px 20px 0px 0px',
        color: '$color_top',
	},

	focusable: {
        extends: 'shadow',
		borderStyle: 'solid',
		borderWidth: 0,
		borderColor: '$color',
		// transitionDuration: '0.3s',
		transitionProperty: 'border-color, background-color, box-shadow',
	},

    // ==== Custom ====

    // Standard entire page.
    page: {
        extends: 'primary',
		padding: '40px',
		gap: '20px',
		display: 'flex',
		flexDirection: 'column',
        background: '$color',
		height: '100%',
        minHeight: '100vh'
	},

});

export const define = obj => atomic(() => {
	for (const o in obj) {
		if (o in theme) throw new Error("Theme.define: theme definition already exists: " + o);
		theme[o] = obj[o];
	}
});

export default theme;
