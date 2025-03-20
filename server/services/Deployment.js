const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const portfinder = require('portfinder');
const Log = require("../Log.js");
const getLocalIPAddress = require('./IPAddress.js')

const log = new Log();

function RunCommand(command, cwd) {
  if (!command) return "No command received. Please provide a command";

  return new Promise((resolve, reject) => {
    exec(command, {cwd : cwd || "."},(error, stdout, stderr) => {
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

function getProjectName(url) {
  const parts = url.split('/');
  return parts[parts.length - 1].replace('.git', '');
}

async function DeployStaticWebsite(githubRepoURL, username) {
  const projectName = getProjectName(githubRepoURL); // Dynamic project name
  const nginxConfigPath = `/etc/nginx/sites-available/${projectName}`;
  const nginxEnabledPath = `/etc/nginx/sites-enabled/${projectName}`;

  const dynamicPort = await portfinder.getPortPromise({ port: [5000, 6000] });

  // Clone repo
  console.log('Cloning GitHub repo:', githubRepoURL);
  await RunCommand(`sudo git clone ${githubRepoURL}`, `/var/www/`);
  console.log("done...")

  // Create Nginx configuration content
  const nginxConfigContent = `
server {
  listen ${dynamicPort};
  server_name ${getLocalIPAddress()};

  root /var/www/${projectName};
  index index.html;

  location / {
      try_files $uri $uri/ =404;
  }

  # Additional configurations if needed
}`;


  // Save the Nginx config file
  console.log(`Saving Nginx config file to ${nginxConfigPath}...`);
  fs.writeFileSync(path.join(`/tmp`, projectName), nginxConfigContent); // Write temp config file locally
  await RunCommand(`sudo mv /tmp/${projectName} ${nginxConfigPath}`); // Move config file to protected directory

  // Create a symlink in the sites-enabled directory
  console.log('Creating symlink for Nginx configuration...');
  await RunCommand(`sudo ln -s ${nginxConfigPath} ${nginxEnabledPath}`);

  // Reload Nginx to apply changes
  console.log('Reloading Nginx...');
  await RunCommand('sudo systemctl restart nginx');

  console.log(`Deployment complete. Your project is available at http://${getLocalIPAddress()}:${dynamicPort}`);

  log.info("Tunneling into a public link...");
  const output = await RunCommand(`sudo ~/telebit http ${dynamicPort} ${projectName.toLowerCase()}`);
  log.info(output);
}





//DeployApplication(`https://github.com/Samiul-Islam-123/event-management.git`, "event-management-system","backend",  envVariables);
//DeployApplication(`https://github.com/Samiul-Islam-123/node-app.git`, "MyProject", );
//DeployStaticWebsite(`https://github.com/Samiul-Islam-123/adamitras.git`,"client",  ,'Adamitras');
DeployStaticWebsite(`https://github.com/vaibhav1741/ShoppingSystem.git`, "SampleUser2");
//DeployStaticWebsite(`https://github.com/candytale55/dasmoto.git`, "SampleUser3");
//DeployStaticWebsite(`https://github.com/pro-prodipto/Netflix-Website-Project.git`, "SampleUser4");





module.exports = DeployApplication;