# AWSI - [AWS] EC2 [i]nstances connecter

Easily connect to AWS EC2 instances using SSM

## Prerequisites
Setup your profiles using the aws cli

```sh
aws configure --profile PROFILE_NAME
```

You can also leave out the `--profile PROFILE_NAME` param to set your `default` credentials

Refer to this doc for more information
https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html

## Setup

```sh
npm install -g .
```

Add the following
```sh
alias awsi="source awsi"
```

## Usage
```sh
awsi
```