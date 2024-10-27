import { Button, Icon } from "destamatic-ui";

const Notification = ({ each: msg, notifications }) => {
    const msgStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px',
        margin: '5px 0',
        color: 'white',
        borderRadius: '5px',
        pointerEvents: 'auto',
        width: '500px',
        backgroundColor: (() => {
            if (msg.type === 'error') {
                return 'red';
            } else if (msg.type === 'warning') {
                return 'yellow';
            } else if (msg.type === 'ok') {
                return 'green';
            }
            return 'gray';
        })()
    };

    return <div style={msgStyle}>
        <span style={{ flex: 1 }}>{msg.content}</span>
        <Button
            Icon={<Icon size='20' libraryName='feather' iconName='x' style={{ color: 'black' }} />}
            style={{ flexShrink: 0, marginLeft: 'auto' }}
            type='icon'
            onMouseDown={() => {
                notifications.splice(notifications.indexOf(msg), 1);
            }}
        />
    </div>;
};



const Notifications = ({ state }) => {
    const notifications = state.sync.notifications;

    notifications.push({
        content: "This is a test",
        type: 'warning'
    });

    return <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column-reverse',
        padding: '10px',
        pointerEvents: 'none'
    }}>
        <Notification each={notifications} notifications={notifications} />
    </div>;
};

export default Notifications
