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
}


// Loop through sampleENV and dynamically create the `-e` flags for docker run
const sampleENV = {
  DB_URL: "mongodb+srv://isamiul099:1o3N6qdppkSANbtD@cluster0.82tmx.mongodb.net/dev_cluster?retryWrites=true&w=majority&appName=Cluster0",
  CLOUDINARY_CLOUD_NAME: "duwx8enno",
  CLOUDINARY_API_KEY: "174881656337715",
  CLOUDINARY_API_SECRET: "dN0vbjrv4bBMb2mi1tMdyODci1k",
  STRIPE_SECRET_KEY: "sk_test_51QLrAdATuFnOEMSezUetNvu3nzzdqymEV1qpT13T4TCNKZDq7IZi2N1jQaCfCipPO287KRrTKUDSxPsVbQ073DS8004gbNppFa",
  CLIENT_URL: "https://www.lessortiesdediane.com",
  PASS: "deeraaaocilwrpagP",
  USER: "zonechill204@gmail.com",
  BACKEND_URL: "https://api.lessortiesdediane.com"
};

let envVariables = '';
for (const [key, value] of Object.entries(sampleENV)) {
  envVariables += `-e ${key}="${value}" `;
}

DeployApplication(`https://github.com/Samiul-Islam-123/event-management.git`, "event-management-system","backend",  envVariables);
//DeployApplication(`https://github.com/Samiul-Islam-123/node-app.git`, "MyProject", );
