import { Theme, Paper, useRipples } from "destamatic-ui";

import LogoLightMode from '/OpenGig_Logo_Light_Mode.svg';
import LogoDarkMode from '/OpenGig_Logo_Dark_Mode.svg';
import { Observer } from "destam-dom";

Theme.define({
    headerbutton: {
        cursor: 'pointer',
        overflow: 'clip'
    },
});

const Header = ({ state, children }) => {
    const hover = Observer.mutable(false);
    const [ripples, createRipple] = useRipples();

    return <Paper >
        <div theme='center' style={{ width: '100%', justifyContent: 'space-between' }}>
            <div
                theme={[
                    'radius_center_headerbutton'
                ]}
                onClick={(e) => {
                    createRipple(e)
                    state.client.openPage = { page: 'Landing' }
                }}
                isHovered={hover}
            >
                <img
                    src={window.themeMode.map(t => t === false ? LogoLightMode : LogoDarkMode )}
                    style={{ margin: 10, height: '5vh', userSelect: 'none' }}
                />
                {ripples}
            </div>
            {children}
        </div>
    </Paper >;
};

export default Header;
