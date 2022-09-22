# DropTheBit IaC with Pulumi

This repository covers how to implement the cloud infrastructure of DropTheBit services through the 'Pulumi Automation API'.

## Step
1. Github Actions Secrets
1. Pulumi Secrets
1. MongoDB Atlas Secrets
1. Set AWS credential
    - export AWS_ACCESS_KEY_ID=<YOUR_ACCESS_KEY_ID>
    - export AWS_SECRET_ACCESS_KEY=<YOUR_SECRET_ACCESS_KEY>
1. Set .env

## Pulumi up
1. yarn run start api up
1. yarn run start web up

## Pulumi destroy
1. yarn run start api destroy
1. yarn run start web destroy

## Github ci/cd
- .aws/production.task-definition.json
    - AWS account id update(009135987042)
        > arn:aws:organizations::009135987042:account/o-6x08yykizg/*009135987042*
- .github/workflows/production.aws.yml
    - ECS_SERVICE name update
- set github secrets
    - secrets.ECS_PRODUCTION_DROPTHEBIT_AWS_ACCESS_KEY_ID
    - secrets.ECS_PRODUCTION_DROPTHEBIT_AWS_SECRET_ACCESS_KEY
