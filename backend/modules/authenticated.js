
export default () => {
    return {
        onMsg: ({ test }) => {
            console.log(test);
            console.log('AUTHENTICATED');
            return test
        }
    }
};
