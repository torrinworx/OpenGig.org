import { Theme, Button, Icon } from "destamatic-ui";

Theme.define({
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
})

const Notification = ({ each: msg, notifications }) => {
    return <div theme={`notification_${msg.type || 'default'}`}>
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

    return <div theme='notifications'>
        <Notification each={notifications} notifications={notifications} />
    </div>;
};

export default Notifications;
