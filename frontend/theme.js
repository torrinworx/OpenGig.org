import { OObject } from "destam-dom";

export default OObject({
    '*': {
        fontFamily: 'IBM Plex Sans',
        fontWeight: 600,
    },
    primary: {
        $color: '#3AFF8C', // Vomit green
        $color_hover: 'rgba(58, 255, 140, 0.2)',
        $color_error: 'red',
        $color_top: 'white',
        transition: 'opacity 250ms ease-out, box-shadow 250ms ease-out, color 250ms ease-out, background-color 250ms ease-in-out'
    },
    secondary: {
        $color: '#00c1ff',  // Vomit blue
        $color_hover: 'rgba(94, 188, 255, .2)',
        $color_top: 'white',
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
        color: 'black',
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
    },
    button_text_hovered: {
        extends: 'secondary',
        width: "auto",
        color: '$color',
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

    // Custom:
    page: {
        padding: '40px',
        gap: '20px',
        display: 'flex',
        flexDirection: 'column',
    },
    pageSection: {
        extends: ['secondary', 'radius'],

        backgroundColor: '$color',
        padding: '20px',
        color: '$color_top',
    },
    pageSection_inset: {
        extends: ['secondary', 'radius'],
        padding: '20px',
        color: '$color',
        backgroundColor: 'white',
    },
    header: {
        // height: '75px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    notifications: {
        position: 'fixed',
        top: '20px',
        left: 0,
        right: 0,
        zIndex: 2,
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column-reverse',
        pointerEvents: 'none',
        gap: '10px'
    },
    notification: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px',
        color: 'white',
        borderRadius: '5px',
        pointerEvents: 'auto',
        width: '500px'
    },
    notification_error: {
        color: 'black',
        backgroundColor: '#F95959'
    },
    notification_warning: {
        color: 'black',
        backgroundColor: '#FFFC56'
    },
    notification_ok: {
        extends: 'secondary',
        backgroundColor: '$color'
    },
    notification_default: {
        backgroundColor: 'gray'
    },
});
