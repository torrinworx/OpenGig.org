import { Observer, OObject, OArray, createNetwork } from 'destam';

const initialState = {};

const stateClient = OObject({});
const networkClient = createNetwork(stateClient.observer);

const serverState = OObject({});

networkClient.digest((commit, regFunc) => {
    console.log(regFunc)
    console.log('Digest invoked with commit:', commit);

    // Check if commit has events
    if (commit && commit.length > 0) {
        console.log('Applying commit events:', commit);

        // Perform expected operations or log it happening
    } else {
        console.log('No events to process.');
    }
}, 1000/30);

stateClient.name = 'test Doe';

stateClient.projects = OObject({});
console.log("hi there")

// stateTree.projects.push({ title: 'Another project'});

console.log(stateClient)
console.log(serverState)




// import { Observer, OObject, OArray, createNetwork } from 'destam';

// const initialState = {};

// const stateClient = OObject(initialState);
// const stateServer = OObject(initialState);

// const networkClient = createNetwork(stateClient.observer);
// const networkServer = createNetwork(stateServer.observer);

// const fromClient = {};
// const fromServer = {};

// networkClient.digest(async commit => {
// 	const cloned = commit;
// 	networkServer.apply(cloned);
// }, 1000 / 30, arg => arg === fromClient);

// networkServer.digest(async commit => {
// 	const cloned = commit; // main issue, how do we clone something like this?
// 	// Need a custom serialize/deserialzier?
// 	networkClient.apply(cloned);
// }, 1000 / 30, arg => arg === fromClient);

// stateClient.name = 'test Doe';

// stateClient.projects = OObject({});

// console.log(stateClient);
// console.log(stateServer);
