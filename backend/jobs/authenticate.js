export default ({args}) => {
    console.log('Executing example with args:', args);
    // Simulate asynchronous work
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(`Result from example, processed args: ${JSON.stringify(args)}`);
        }, 1000);
    });
}
