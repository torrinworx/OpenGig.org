import path from 'path';
import { promises as fs } from 'fs';

const Jobs = async (directory = '../jobs', props = {}) => {
    const jobsDirectory = path.resolve(directory);
    console.log(jobsDirectory);

    const jobs = new Map();
    const handlers = {};

    const findJobFiles = async dir => {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        const filesPromises = entries.map(async entry => {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                return findJobFiles(fullPath);
            } else if (entry.name.endsWith('.js')) {
                return fullPath;
            }
        });
        const files = await Promise.all(filesPromises);
        return files.flat().filter(Boolean);
    };

    const loadJobsFromFile = async filePath => {
        try {
            const module = await import(filePath);
            const relativePath = path.relative(jobsDirectory, filePath);
            const jobName = relativePath.replace(/[/\\]/g, '_').replace(/\.js$/, '');
            if (typeof module.default === 'function') {
                jobs.set(jobName, module.default);
            }
            console.log(`Job "${jobName}" loaded`);
        } catch (e) {
            console.error(`Failed to load module from ${filePath}: ${e}`);
        }
    };

    try {
        const jobFiles = await findJobFiles(jobsDirectory);
        const jobPromises = jobFiles.map(filePath => loadJobsFromFile(filePath));

        await Promise.all(jobPromises);
        console.log('All jobs are loaded');
        for (const [jobName, jobFactory] of jobs.entries()) {
            handlers[jobName] = jobFactory(props);
        }
    } catch (error) {
        console.error('Error loading jobs:', error);
    }

    const jobHandlers = {};

    for (const [jobName, handler] of Object.entries(handlers)) {
        jobHandlers[jobName] = {
            connection: (...props) => {
                if (typeof handler.connection === 'function') {
                    handler.connection(...props);
                }
            },
            message: async msg => {
                try {
                    if (typeof handler.message === 'function') {
                        const { name, id, ...msgWithout } = msg;
                        const result = await handler.message(msgWithout);
                        return { id, result };
                    } else {
                        console.error(`Handler not found for job: ${msg.name}`);
                    }
                } catch (e) {
                    console.error('Error processing message:', e);
                }
            },
            close: (...props) => {
                if (typeof handler.close === 'function') {
                    handler.close(...props);
                }
            },
            error: e => {
                if (typeof handler.error === 'function') {
                    handler.error(e);
                }
            }
        };
    }

    return jobHandlers;
};

export default Jobs;
