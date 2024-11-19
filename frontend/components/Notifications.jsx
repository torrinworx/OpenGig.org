import { OArray, Observer } from 'destam-dom';
import { Theme, Button, Icon } from 'destamatic-ui';

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
        gap: '10px',
    },
    notification: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px',
        color: 'white',
        borderRadius: '5px',
        pointerEvents: 'auto',
        width: '500px',
        transition: 'opacity 3s',
    },
    notification_error: {
        backgroundColor: '#F95959',
    },
    notification_warning: {
        color: 'black',
        backgroundColor: '#FFFC56',
    },
    notification_ok: {
        extends: 'secondary',
        backgroundColor: '$color',
    },
    notification_default: {
        backgroundColor: 'DarkGrey',
    },

    // TODO: Adjust these colours based on error/warning/ok/default, yellow warning looks a bit weird.
    notificationButton: {
        extends: 'button_icon',
        color: 'white'
    },
    notificationButton_hovered: {
        extends: ['primary', 'button_icon_hovered'],
        color: '$color',
    },
});

const Notification = ({ each: msg, notifications }) => {
    const opacity = Observer.mutable(1);

    setTimeout(() => {
        opacity.set(0);
        setTimeout(() => {
            const index = notifications.indexOf(msg);
            if (index !== -1) {
                notifications.splice(index, 1);
            }
        }, 3000);
    }, 5000);

    return <div theme={`notification_${msg.type || 'default'}`} style={{ opacity: opacity.map(o => o) }}>
        <span style={{ flex: 1 }}>{msg.content}</span>
        <Button
            theme='notificationButton'
            Icon={<Icon size='20' libraryName='feather' iconName='x' />}
            style={{ flexShrink: 0, marginLeft: 'auto' }}
            type='icon'
            onMouseDown={() => {
                const index = notifications.indexOf(msg);
                if (index !== -1) {
                    notifications.splice(index, 1);
                }
            }}
        />
    </div>;
};

const Notifications = ({ state }) => {
    let notifications = state.client.notifications = OArray([]);

    return state.observer.path('sync').shallow().ignore().map((s) => {
        if (s) {
            notifications = state.sync.notifications;

            if (state.client.notifications) {
                delete state.client.notifications;
            }
        }

        return <div theme='notifications'>
            <Notification each={notifications} notifications={notifications} />
        </div>;
    });

};

export default Notifications;
