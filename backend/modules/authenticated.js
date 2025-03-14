
export default () => {
    return {
        int: (something) => {
            console.log('something: ', something);
            console.log('AUTHENTICATED');
            return 'Authenticated'
        }
    }
};
