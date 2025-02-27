import { OObject } from "destam-dom";
import { Observer } from "destam-dom";
import { atomic } from "destam/Network";

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
        '*': {
            $color_main: mainColors.$color_white,
            $color_text: mainColors.$color_white,
        },
        paperColors: {
			$color: '$color_text',
			$color_background: mainColors.$color_purple,
		},
    },
    dark: {
        '*': {
            $color_main: mainColors.$color_purple,
            $color_text: mainColors.$color_black,
        },
        paperColors: {
			$color: '$color_text',
			$color_background: mainColors.$color_white,
		},
    }
};

const theme = OObject({
    // destamatic-ui
    '*': {
        fontFamily: 'IBM Plex Sans',
        fontWeight: 600,
        boxSizing: 'border-box',
        transition: 'opacity 250ms ease-out, box-shadow 250ms ease-out, background-color 250ms ease-in-out',
    },

	paper: {
		extends: ['*', 'paperColors', 'radius', 'shadow'],
		padding: 15,
		background: '$color_background',
		color: '$color',
		maxWidth: 'inherit',
		maxHeight: 'inherit',
	},

    radius: {
        borderRadius: 16
    },

    // custom
    page: {
        background: '$color_main',
        padding: '40px',
        gap: '20px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '100vh'
    },
});

window.themeMode = Observer.mutable(window.matchMedia("(prefers-color-scheme:dark)").matches ? 'dark' : 'light');
window.theme = theme;

window.themeMode.effect(mode => atomic(() => {
    for (const [key, val] of Object.entries(themeModes[mode])) {
        theme[key] = OObject(val);
    }
}));

export default {
    theme,
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
