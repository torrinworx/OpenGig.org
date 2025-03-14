
export default () => {
    return {
        authenticated: false,
        int: (test) => {
            console.log(test)
            console.log("UNAUTHENTICATED");

            return "UNAUTHENTICATED"
        }
    }
};
