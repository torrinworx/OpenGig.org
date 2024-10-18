import { join, resolve, relative } from "https://deno.land/std/path/mod.ts";

class JobRequest {
    constructor(name, args = {}) {
        this.name = name;
        this.args = args;
    }
}

class Jobs {
    constructor(directory) {
        this.directory = resolve(directory || './jobs');
        console.log(this.directory);
        if (!Jobs.instance) {
            Jobs.instance = this;
            this.jobs = new Map();
            Jobs.instance.ready = this._getJobs()
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
        for await (const entry of Deno.readDir(dir)) {
            const fullPath = join(dir, entry.name);
            if (entry.isDirectory) {
                await this._findJobFiles(fullPath);
            } else if (entry.name.endsWith(".js")) {
                this.jobs.set(fullPath, fullPath);
            }
        }
        return Array.from(this.jobs.keys());
    }

    async _loadJobsFromFile(filePath) {
        try {
            const module = await import(`file://${filePath}`);
            const jobName = this._generateJobName(filePath);
            if (typeof module.default === 'function') {
                this.jobs.set(jobName, module.default);
            }
            console.log(`Job "${jobName}" loaded`)
        } catch (e) {
            console.error(`Failed to load module from ${filePath}: ${e}`);
        }
    }

    _generateJobName(filePath) {
        const relativePath = relative(this.directory, filePath);
        return relativePath.replace(/[/\\]/g, '_').replace(/\.js$/, '');
    }

    async router(jobRequest) {
        await Jobs.instance.ready;

        const jobFunc = this.jobs.get(jobRequest.name);

        if (!jobFunc) {
            throw new Error(`The job '${jobRequest.name}' was not found.`);
        }

        const result = jobFunc(jobRequest.args);
        if (result && typeof result[Symbol.asyncIterator] === 'function') {
            return result;
        } else {
            return await result;
        }
    }
}

export { JobRequest, Jobs };

/*

Example:

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
*/
