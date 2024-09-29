import { OObject, OArray, Observer } from 'destam';

const state = OObject({
	name: 'John Doe',
	address: 'Tokyo',
});

state.observer.path('address').watch(delta => {
	console.log(`${delta.getParent().name}'s address changed to ${delta.value}`);
});

state.address = 'Toronto';

console.log("Hi there")

