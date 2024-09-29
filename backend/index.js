import { OObject, OArray, Observer } from 'destam';

import {Jobs, JobRequest } from './jobs.js';

const state = OObject({
	name: 'John Doe',
	address: 'Tokyo',
});

state.observer.path('address').watch(delta => {
	console.log(`${delta.getParent().name}'s address changed to ${delta.value}`);
});

state.address = 'Toronto';


(async () => {
    const jobs = new Jobs('./backend/jobs');    

    const jobRequest = new JobRequest('example', { args: 'example' });
    try {
        const result = await jobs.router(jobRequest);
        console.log('Job result:', result);
    } catch (error) {
        console.error('Job execution error:', error);
    }
})();
