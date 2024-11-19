import { Paper } from "destamatic-ui";

import Logo from '/OpenGig.svg';

const Header = ({ children }) => <Paper theme='center' style={{
    minHeight: '100px',
    justifyContent: 'space-between',
    padding: '0px 25px'
}}>
    <div theme='center' style={{ width: '100%', justifyContent: 'space-between' }}>
        <img src={Logo} style={{ margin: 10, height: '4vh', userSelect: 'none' }} />
        {children}
    </div>
</Paper>;

export default Header;
