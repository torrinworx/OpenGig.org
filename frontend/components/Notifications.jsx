const Notification = ({ each: msg }) => {
    const msgStyle = {
        padding: '10px',
        margin: '5px 0',
        color: 'white',
        borderRadius: '5px',
        pointerEvents: 'auto',
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
        {msg.content}
    </div>;
};

const Notifications = ({ state }) => {
    const notifications = state.stateSync.notifications;

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
        <Notification each={notifications} />
    </div>;
};

export default Notifications
