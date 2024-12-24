# AWSI - [AWS] EC2 [i]nstances connecter
Easily connect to AWS EC2 instances using SSM

## Prerequisites
To connect to AWS EC2 instances using SSM, make sure you have set up your profiles using the AWS CLI. Run the following command to configure your profile:

```sh
aws configure --profile PROFILE_NAME
```

If you want to use the default credentials, you can omit the `--profile PROFILE_NAME` parameter.

For more information on setting up AWS CLI profiles, refer to the [AWS CLI User Guide](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html).

## Setup
To install the necessary dependencies, run the following command:

```sh
npm install -g .
```

Additionally, add the following alias to your shell configuration file:

```sh
alias awsi="source awsi"
```

## Usage
To connect to AWS EC2 instances using SSM, simply run the following command:

```sh
awsi
```