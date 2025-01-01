import { spawn } from "child_process";
import { Logger, extractFolderFromURL } from "../utils/Helper.js";
import { resolve } from "path";
import { rejects } from "assert";

let log = new Logger();

const tasks = [
    {
        pull : {
            commands : ["git clone "],
        },
        build : [{
            type : "react",
            commands : ["npm install", "npm run build"],
        },
        {
            type : "node",
            commands : ["npm install"]
        },
        {
            type : "static",
            commands : [""]
        }
        ],
        deploy : [
            {
                type : "react",
                commands : ["npm run dev"],//deploy in nginx
            },
            {
                type : "node",
                commands : ["npm start"],//isolate in a docker container and inside pm2
            }
        ]
    }
]

async function Run(command, args, options = {}) {
    const process = spawn(command, args, {
        stdio: ['ignore', 'pipe', 'pipe'], // stdio setup for stdout/stderr pipes
        shell: true,
        ...options // Allow additional options like cwd for custom working directories
    });

    // Listen to stdout for real-time logs
    process.stdout.on('data', data => {
        log.info(data.toString());
    });

    // Listen to stderr for real-time error logs
    process.stderr.on('data', data => {
        log.error(data.toString());
    });

    // Return a promise to handle process completion
    return new Promise((resolve, reject) => {
        process.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Command failed: ${command} with exit code ${code}`));
            }
        });
    });
}

async function StartDeployment(){
    //simulation
    const URL = "https://github.com/Samiul-Islam-123/cloud-storage.git";
    const type = "node";
    const root_directory = "backend";

    let folder = extractFolderFromURL(URL);
    for(const task of tasks){
        //pull task
        log.info("Pulling Code from github...")
        const pullTask = task.pull;
        if(pullTask){
            for(const command of pullTask.commands){
                //await Run(command, [URL]);
            }
        }

        //biuld task
        log.info("Building...");
        const buildTask = task.build;
        if(buildTask){
            const appType = buildTask.find(task => task.type === type)
            if(appType){
                const workDirectory = `./${folder}/${root_directory}`;
                for(const command of appType.commands){
                    await Run(command,[], workDirectory);
                    //console.log(workDirectory)
                }
            }
            else
            log.error("Invalid application type. Cannot proceed further")
        }

    }
}

(async() =>{
    //await Run("git clone ", ["https://github.com/Samiul-Islam-123/cloud-storage.git"])
    await StartDeployment();
})()