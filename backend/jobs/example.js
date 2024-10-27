export default ({ syncState, ws }) => {
    return {
        connection: () => {
            console.log("example job detected a connection.");
        },
        message: (msg) => {
            console.log(msg);
            new Promise((resolve) => {
                setTimeout(() => {
                    resolve(`Result from example, processed args: ${JSON.stringify(msg)}`);
                }, 1000);
            });
        },
    }
}
