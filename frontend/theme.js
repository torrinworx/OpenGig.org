import { atomic } from "destam/Network";
import { OObject } from "destam-dom";


// https://coolors.co/f83a3a-fffc47-3aff8c-00c1ff-a683ec
const theme = OObject({
    '*': {
        fontFamily: 'IBM Plex Sans',
        fontWeight: 600,
    },
    primary: {
        $color: '#00FA53', // Vomit green
        $color_hover: 'rgba(58, 255, 140, 0.2)',
        $color_error: 'red',
        $color_top: 'white',
        transition: 'opacity 250ms ease-out, box-shadow 250ms ease-out, color 250ms ease-out, background-color 250ms ease-in-out'
    },
    secondary: {
        $color: '#1E8EFF',  // Vomit blue
        $color_hover: 'rgba(94, 188, 255, .2)',
        $color_top: 'white',
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
        width: 'auto',
        backgroundColor: 'transparent',
    },
    button_icon_hovered: {
        extends: 'secondary',
        background: 'transparent',
        width: 'auto',
        color: '$color',
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
    },
    button_contained: {
        color: '$color_top',
        background: '$color',
    },
    button_contained_hovered: {
        extends: 'secondary',
        background: '$color',
    },
    button_outlined: {
        extends: 'secondary',
        color: '$color',
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: '$color',
        backgroundColor: '$color_top'
    },
    button_outlined_hovered: {
        extends: 'secondary',
        color: '$color',
        backgroundColor: '$color_hover',
    },
    hover: {
        backgroundColor: 'rgba(2, 202, 159, 0.1)',
        color: '#02CA9F',
    },
    typography_h1: { fontSize: 62 },
    typography_h2: { fontSize: 56 },
    typography_h3: { fontSize: 36 },
    typography_h4: { fontSize: 30 },
    typography_h5: { fontSize: 24 },
    typography_h6: { fontSize: 20 },
    typography_p1: { fontSize: 16 },
    typography_p2: { fontSize: 14 },
    typography_regular: { fontStyle: 'normal' },
    typography_bold: { fontWeight: 'bold' },
    typography_italic: { fontStyle: 'italic' },

    focusable: {
        border: 0,
        extends: ['primary', 'radius'],
		padding: 10,
		alignItems: 'center',
		background: 'white',
        boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px'
	},
});

export const define = obj => atomic(() => {
	for (const o in obj) {
		if (o in theme) throw new Error("Theme.define: theme definition already exists: " + o);
		theme[o] = obj[o];
	}
});

export default theme;
