import chalk from 'chalk';
import os from 'os';

class Logger {
    info(message) {
        const timeStamp = new Date().toISOString().split('.')[0];
        const msg = chalk.green(message); // Message in green
        console.log(`[${timeStamp}]: ${msg}`);
    }

    error(message) {
        const timeStamp = chalk.red(new Date().toDateString()); // Timestamp in red
        const msg = chalk.yellow(message); // Message in yellow
        console.error(`[${timeStamp}]: ${msg}`);
    }

    warn(message) {
        const timeStamp = chalk.yellow(new Date().toISOString().split('.')[0]);
        const msg = chalk.redBright(message);
        console.warn(`[${timeStamp}]: ${msg}`);
    }
    
}

const getLocalIPAddress = () => {
    const network = os.networkInterfaces();
    for (const interfaceName in network) {
        const interfaces = network[interfaceName];
        for (const networkInterface of interfaces) {
            if (networkInterface.family === 'IPv4') {
                return networkInterface.address;
            }
        }
    }
    return "IP Address not found :(";
};

const extractFolderFromURL = (url) => {
    // Remove the .git suffix, then split by '/' and take the last part
    const match = url.replace('.git', '').split('/').pop();
    return match;
}

export { Logger, getLocalIPAddress , extractFolderFromURL};
