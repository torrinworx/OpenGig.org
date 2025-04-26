
export default () => {
    return {
        authenticated: false,
        onMsg: ({ test }) => {
            console.log(test)
            console.log("UNAUTHENTICATED");

            return "UNAUTHENTICATED"
        }
    }
};
