import { Paper } from "destamatic-ui";

import Logo from '/OpenGig.svg';

const Header = ({ children }) => <Paper style={{
    minHeight: '100px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0px 25px'
}}>
    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <img src={Logo} style={{ margin: 10, height: '50px', userSelect: 'none' }} />
        {children}
    </div>
</Paper>;

export default Header;
