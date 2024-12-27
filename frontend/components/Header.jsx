import { Theme, Paper, useRipples } from "destamatic-ui";

import Logo from '/OpenGig.svg';
import { Observer } from "destam-dom";

Theme.define({
    headerbutton: {
        cursor: 'pointer',
        overflow: 'clip'
    },
    headerbutton_hovered: {
        extends: 'secondary',
        background: '$color',
    }
});

const Header = ({ state, children }) => {
    const hover = Observer.mutable(false);
    const [ripples, createRipple] = useRipples();

    return <Paper theme='center' style={{
        minHeight: '100px',
        justifyContent: 'space-between',
        padding: '0px 25px'
    }}>
        <div theme='center' style={{ width: '100%', justifyContent: 'space-between' }}>
            <div
                theme={[
                    'radius_center_headerbutton',
                    hover.map(h => h ? 'hovered' : null)
                ]}
                onClick={(e) => {
                    createRipple(e)
                    state.client.openPage = { page: 'Landing' }
                }}
                isHovered={hover}
            >
                <img
                    src={Logo}
                    style={{ margin: 10, height: '4vh', userSelect: 'none' }}
                />
                {ripples}
            </div>
            {children}
        </div>
    </Paper >;
};

export default Header;
