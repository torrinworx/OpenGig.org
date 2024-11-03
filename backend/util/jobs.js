import path from 'path';
import { promises as fs } from 'fs';

import { parse } from './clone.js';

export default class Jobs {
    constructor(directory) {
        this.directory = path.resolve(directory || '../jobs');
        console.log(this.directory);
        if (!Jobs.instance) {
            Jobs.instance = this;
            this.jobs = new Map();
            Jobs.instance.ready = this._getJobs();
        }
        return Jobs.instance;
    }

    async _getJobs() {
        const jobFiles = await this._findJobFiles(this.directory);
        const jobPromises = jobFiles.map(filePath => this._loadJobsFromFile(filePath));

        return Promise.all(jobPromises).then(() => {
            console.log('All jobs are loaded');
        }).catch(error => {
            console.error('Error loading jobs:', error);
        });
    }

    async _findJobFiles(dir) {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        const files = await Promise.all(entries.map(async entry => {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                return this._findJobFiles(fullPath);
            } else if (entry.name.endsWith('.js')) {
                return fullPath;
            }
        }));
        return files.flat().filter(Boolean);
    }

    async _loadJobsFromFile(filePath) {
        try {
            const module = await import(filePath);
            const jobName = this._generateJobName(filePath);
            if (typeof module.default === 'function') {
                this.jobs.set(jobName, module.default);
            }
            console.log(`Job "${jobName}" loaded`);
        } catch (e) {
            console.error(`Failed to load module from ${filePath}: ${e}`);
        }
    }

    _generateJobName(filePath) {
        const relativePath = path.relative(this.directory, filePath);
        return relativePath.replace(/[/\\]/g, '_').replace(/\.js$/, '');
    }

    async setupHandlers(props) {
        await Jobs.instance.ready;

        this.handlers = {};
        for (const [jobName, jobFactory] of this.jobs.entries()) {
            this.handlers[jobName] = jobFactory(props);
        }
    }

    connection() {
        for (const handler of Object.values(this.handlers)) {
            if (typeof handler.connection === 'function') {
                handler.connection();
            }
        }
    }

    async message(msg) {
        try {
            msg = parse(msg);
            const handler = this.handlers[msg.name];

            if (handler && typeof handler.message === 'function') {
                const { name, id, ...msgWithout } = msg;
                // TODO: Maybe make a system where job() {} is a new function rather than message
                // explicetly configure it so that it doesn't need to return something for it to get through.
                // A default confirmation value that the job succeded with it's result. Something like that?
                // So handler.job if the ws has a job parameter rather than a ws thing. could be overengineered stupidnes though.
                const result = await handler.message(msgWithout);

                return { id, result };
            } else {
                console.error(`Handler not found for job: ${msg.name}`);
            }
        } catch (e) {
            console.error('Error processing message:', e);
        }
    }

    close() {
        for (const handler of Object.values(this.handlers)) {
            if (typeof handler.close === 'function') {
                handler.close();
            }
        }
    }

    error(e) {
        for (const handler of Object.values(this.handlers)) {
            if (typeof handler.error === 'function') {
                handler.error(e);
            }
        }
    }
};
