import { Button, Typography } from 'destamatic-ui';

const Header = ({}) => {
    return <div style={{
            position: 'sticky',
            top: 0,
            backgroundColor: 'white',
            padding: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            borderBottom: '1px solid #ddd'
        }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <Typography type="h4">
              OpenGig
          </Typography>
        </div>
        <Button
            label='Sign up'
            type='contained'
            onMouseDown={() => {}}
        />
        <Button
            label='Login'
            type='outlined'
            onMouseDown={() => {}}
        />
    </div>;
}

const Landing = ({ state }) => {
    return <div>
        <Header />
    </div>;
};

export default Landing;
