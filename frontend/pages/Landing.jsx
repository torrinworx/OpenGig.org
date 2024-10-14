import { h, Markdown, Button, Typography } from 'destamatic-ui';
import { Observer } from 'destam-dom';
import readmeContent from '../../README.md'; // Adjust the path as necessary

const isMobile = () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    return /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
};

const Header = ({}) => {
    const hover = Observer.mutable(false);
    return <div style={{
            position: 'sticky',
            top: 0,
            backgroundColor: 'white',
            zIndex: 1000,
            padding: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            borderBottom: '1px solid #ddd'
        }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <Typography type="h4" onMouseEnter={() => hover.set(true)} onMouseLeave={() => hover.set(false)}>
              OpenGig
          </Typography>
          <div
            style={{
              backgroundColor: "black",
              width: hover.map(h => isMobile() || h ? '100%' : '0%'),
              height: '4px',
              position: 'absolute',
              bottom: '-2px',
              left: 0,
              transition: 'width 0.6s cubic-bezier(0.2,0.5,0.6,1)',
            }}
          />
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

const Landing = ({ OClient }) => {
    console.log(readmeContent);

    return <div>
        <Header />
        <Markdown markdown={readmeContent} />
    </div>;
};

export default Landing;
