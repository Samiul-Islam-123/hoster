#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import axios from "axios";

const program = new Command();

program
  .name("hoster")
  .description("CLI tool to deploy and manage applications")
  .version("1.0.0");

program
  .command("deploy")
  .description("Deploy an application")
  .option("-u, --url <url>", "Repository URL")
  .option("-n, --username <username>", "Username for deployment")
  .option("-f, --targetFolder <targetFolder>", "Target folder for deployment")
  .action(async (options) => {
    const { url, username, targetFolder } = options;

    // Check if required options are provided
    if (!url || !username || !targetFolder) {
      console.error(chalk.red("Error: URL, Username, and Target Folder are required!"));
      process.exit(1);
    }

    try {
      console.log(chalk.blue("Starting deployment..."));
      const response = await axios.post("https://tough-dolphin-45.telebit.io/deploy", {
        repoURL: url,
        username: username,
        targetFolder: targetFolder, // Send targetFolder to the server
      });
      console.log(chalk.green(`Success: ${response.data.message}`));
      console.log(`Output: ${response.data.output}`);
    } catch (error) {
      console.error(chalk.red("Error during deployment:"), error.message);
    }
  });

program.parse(process.argv);
