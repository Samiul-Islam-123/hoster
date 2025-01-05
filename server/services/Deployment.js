const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const portfinder = require('portfinder');
const Log = require("../Log.js");

const log = new Log();

function RunCommand(command) {
  if (!command) return "No command received. Please provide a command";

  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) return reject(error);
      return resolve(stderr || stdout);
    });
  });
}

function addDockerfile(port, targetDirectory) {
  const DockerContent = `
  FROM node:18

  WORKDIR /usr/src/app

  COPY package*.json ./
  RUN npm install

  COPY . .

  EXPOSE ${port}

  CMD ["node", "index.js"]
  `;

  fs.writeFileSync(path.join(targetDirectory, "Dockerfile"), DockerContent);
}

async function DeployApplication(gitURL, projectName, targetFolder,envVariables) {
  const dynamicPort = await portfinder.getPortPromise({ port: [5000, 6000] });
  log.info(`Using dynamic port: ${dynamicPort}`);

  log.info("Cloning repository...");
  await RunCommand(`git clone ${gitURL} ${projectName}`);
  //const targetFolder = "backend";

  log.info("Adding Dockerfile...");
  addDockerfile(dynamicPort, path.join(projectName, targetFolder ? targetFolder : "/"));

  log.info("Building Docker image...");
  log.info(await RunCommand(
    `sudo docker build -t ${projectName.toLowerCase()} ${path.join(projectName, targetFolder ? targetFolder : "/")}`
  ));

  log.info("Running Docker image...");
  log.info(await RunCommand(
    `sudo docker run -d -p ${dynamicPort}:${dynamicPort} -e PORT=${dynamicPort} ${envVariables ? envVariables : ''}  ${projectName.toLowerCase()}`
  ));

  log.info("Tunneling into a public link...");
  const output = await RunCommand(`~/telebit http ${dynamicPort} ${projectName.toLowerCase()}`);
  log.info(output);
  return output;
}






//DeployApplication(`https://github.com/Samiul-Islam-123/event-management.git`, "event-management-system","backend",  envVariables);
//DeployApplication(`https://github.com/Samiul-Islam-123/node-app.git`, "MyProject", );

module.exports = DeployApplication;