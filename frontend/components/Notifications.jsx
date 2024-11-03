import { Button, Icon } from "destamatic-ui";

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
