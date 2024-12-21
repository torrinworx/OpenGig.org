import { atomic } from "destam/Network";
import { OObject } from "destam-dom";


const theme = OObject({
    /* ==== destamatic-ui ==== */
    '*': {
        extends: 'eerieBlack',
        fontFamily: 'IBM Plex Sans',
        fontWeight: 600,
        // color: '$color'
    },

    // https://coolors.co/f83a3a-fffc47-00fa53-1e8eff-a683ec
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

    // https://coolors.co/ffffff-f8f9fa-e9ecef-dee2e6-ced4da-adb5bd-6c757d-495057-343a40-212529
    // Generic shades to use throughout the app if needed.
    white: {
        "$color": "#FFFFFF"
    },
    seasalt: {
        "$color": "#F8F9FA"
    },
    antiFlashWhite: {
        "$color": "#E9ECEF"
    },
    platinum: {
        "$color": "#DEE2E6"
    },
    frenchGrayLight: {
        "$color": "#CED4DA"
    },
    frenchGrayDark: {
        "$color": "#ADB5BD"
    },
    slateGray: {
        "$color": "#6C757D"
    },
    outerSpace: {
        "$color": "#495057"
    },
    onyx: {
        "$color": "#343A40"
    },
    eerieBlack: {
        "$color": "#212529"
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
        // color: '$color_top',
    },

    focusable: {
        extends: 'shadow',
        borderStyle: 'solid',
        borderWidth: 0,
        borderColor: '$color',
        // transitionDuration: '0.3s',
        transitionProperty: 'border-color, background-color, box-shadow',
    },

    typography: {
        display: 'flex',
    },

    typography_h1: { color: '$color', fontSize: 62, textWrap: 'nowrap' },
    typography_h2: { color: '$color', fontSize: 56, textWrap: 'nowrap' },
    typography_h3: { color: '$color', fontSize: 36, textWrap: 'nowrap' },
    typography_h4: { color: '$color', fontSize: 30, textWrap: 'nowrap' },
    typography_h5: { color: '$color', fontSize: 24, textWrap: 'nowrap' },
    typography_h6: { color: '$color', fontSize: 20, textWrap: 'nowrap' },
    typography_p1: { fontSize: 16 },
    typography_p2: { fontSize: 14 },
    typography_regular: { fontStyle: 'normal' },
    typography_bold: { fontWeight: 'bold' },
    typography_italic: { fontStyle: 'italic' },
    typography_center: { textAlign: 'center' },

    typography_inline: {
        display: 'inline-flex',
    },

    /* ==== Custom ==== */

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
