import { Button, Paper, Icon } from "destamatic-ui";

const Footer = () => <Paper theme='column_center' style={{ gap: '16px', border: 'none' }}>
    <div theme='row' style={{ gap: '16px' }}>
        <Button
            icon={<Icon name="github" size={40} />}
            type="icon"
            onMouseDown={() => window.open('https://github.com/torrinworx/OpenGig.org', '_blank')}
            title={"GitHub"}
        />
    </div>
    <div theme='row'>
        <Button
            type='text'
            label='Privacy'
            onMouseDown={() => state.client.openPage = { name: "Privacy" }}
        />
        <Button
            type='text'
            label='Terms'
            onMouseDown={() => state.client.openPage = { name: "Terms" }}
        />
    </div>
</Paper>;

export default Footer;