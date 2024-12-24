#!/usr/bin/env node

const { EC2Client, DescribeInstancesCommand } = require("@aws-sdk/client-ec2");
const inquirer = require('inquirer');
const inquirerSearchList = require('inquirer-search-list');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Register the plugin with inquirer
inquirer.registerPrompt('search-list', inquirerSearchList);

const ssoCachePath = path.join(process.env.HOME, ".aws/sso/cache");
const cacheFilePath = path.join(__dirname, '.aws_ec2_cache.json');
const cacheExpiryTime = 3600 * 60 * 1000; // 24 hours

async function isSessionValid() {
  try {
    if (!fs.existsSync(ssoCachePath)) {
      return false;
    }
    const files = fs.readdirSync(ssoCachePath);
    for (const file of files) {
      const filePath = path.join(ssoCachePath, file);
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      if (content.expiresAt) {
        const expiryTime = new Date(content.expiresAt).getTime();
        if (Date.now() < expiryTime) {
          return true; // Session is valid
        }
      }
    }
    return false; // No valid session found
  } catch (err) {
    console.error("Error checking SSO session:", err.message);
    return false;
  }
}

async function fetchInstancesFromAWS(region) {
  const ec2Client = new EC2Client({ region });
  const command = new DescribeInstancesCommand({});
  const response = await ec2Client.send(command);
  const instances = [];

  response.Reservations.forEach(reservation => {
    reservation.Instances.forEach(instance => {
      const nameTag = instance.Tags?.find(tag => tag.Key === 'Name');
      const instanceName = nameTag ? nameTag.Value : 'Unnamed Instance';

      instances.push({
        name: `${instanceName} (${instance.InstanceId})`,
        value: instance.InstanceId,
        description: `Instance ID: ${instance.InstanceId}, State: ${instance.State.Name}`
      });
    });
  });

  return instances;
}

async function listInstances(region) {
  const profile = process.env.AWS_PROFILE || 'default';
  try {
    if (fs.existsSync(cacheFilePath)) {
      const cacheData = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
      const profileCache = cacheData[profile];

      if (profileCache && Date.now() - profileCache.timestamp < cacheExpiryTime) {
        console.log('Using cached instance data.');
        return profileCache.instances;
      }
    }

    console.log('Fetching instance data from AWS...');
    const instances = await fetchInstancesFromAWS(region);

    let cacheData = {};
    if (fs.existsSync(cacheFilePath)) {
      cacheData = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
    }

    cacheData[profile] = {
      timestamp: Date.now(),
      instances
    };

    fs.writeFileSync(cacheFilePath, JSON.stringify(cacheData, null, 2), 'utf8');

    return instances;
  } catch (error) {
    console.error('Error retrieving instances:', error.message);
    return [];
  }
}

function startSSMSession(instanceId, region) {
  console.log(`Starting SSM session for instance: ${instanceId}`);

  const ssmProcess = spawn('aws', ['ssm', 'start-session', '--target', instanceId, '--region', region], {
    stdio: 'inherit'
  });

  ssmProcess.on('close', (code) => {
    console.log(`SSM session ended with exit code ${code}`);
  });

  ssmProcess.on('error', (err) => {
    console.error('Failed to start SSM session:', err);
  });
}

async function main() {
  process.on('SIGINT', () => {
    console.log('\nSIGINT received. Ignoring in main process...');
  });

  const isValid = await isSessionValid();
  if (!isValid) {
    console.error("SSO session is expired. Please login using 'aws sso login'.");
    process.exit(1);
  }

  const region = process.env.AWS_REGION || 'us-east-1';
  console.log(`Region: ${region}\n`);

  const instances = await listInstances(region);

  if (!instances || instances.length === 0) {
    console.log('No instances available.');
    return;
  }

  const answers = await inquirer.prompt([
    {
      type: 'search-list',
      name: 'instanceId',
      message: 'Start typing to filter instances',
      choices: instances.map(instance => ({ name: instance.name, value: instance.value })),
    }
  ]);

  startSSMSession(answers.instanceId, region);
}

main();
