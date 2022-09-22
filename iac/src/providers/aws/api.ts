import * as aws from "@pulumi/aws";
import * as cloudflare from "@pulumi/cloudflare";
import * as mongodbAtlas from "@pulumi/mongodbatlas";
import * as pulumi from "@pulumi/pulumi";
import 'dotenv/config';
import { PREFIX, TAGS } from "../../interfaces/enumerated";

export const ProgramAPI = async () => {

    // create new project in mongodb atlas
    const project = new mongodbAtlas.Project(`${PREFIX.PROJECT}-mongodb-project`, {
        name: `${PREFIX.PROJECT}-mongodb-project`,
        orgId: process.env.MONGODB_ATLAS_ORGANIZATION_ID,
    });

    // create mongodb cluster
    const mongodbCluster = new mongodbAtlas.Cluster(`cluster`, {
        projectId: project.id,
        clusterType: "REPLICASET",
        providerName: "AWS",
        providerRegionName: process.env.MONGODB_ATLAS_REGION_NAME,
        providerInstanceSizeName: process.env.MONGODB_ATLAS_PROVIDER_INSTANCE_SIZE_NAME,
        mongoDbMajorVersion: process.env.MONGODB_ATLAS_MAJOR_VERSION,
        numShards: 1,
        backupEnabled: false,
        autoScalingDiskGbEnabled: false,
    });

    // create mongodb database user
    const mongodbDatabaseUser = new mongodbAtlas.DatabaseUser(`${PREFIX.PROJECT}-mongodb-user`, {
        projectId: project.id,
        authDatabaseName: "admin",
        roles: [{
            databaseName: "admin",
            roleName: "atlasAdmin",
        }],
        username: process.env.MONGODB_ATLAS_DATABASE_USERNAME,
        password: process.env.MONGODB_ATLAS_DATABASE_PASSWORD,
    });

    // create mongodb privateLinkEndpoint
    const mongodbPrivateLinkEndpoint = new mongodbAtlas.PrivateLinkEndpoint(`${PREFIX.PROJECT}-mongodb-private-link-endpoint`, {
        projectId: project.id,
        providerName: "AWS",
        region: process.env.AWS_REGION
    });

    const vpc = new aws.ec2.Vpc(`${PREFIX.PROJECT}-vpc`, {
        cidrBlock: "10.1.0.0/16",
        instanceTenancy: "default",
        tags: TAGS.AWS
    });
    // create subnetA
    const subnetA = new aws.ec2.Subnet(`${PREFIX.PROJECT}-subnet-a`, {
        availabilityZone: `${process.env.AWS_REGION}a`,
        cidrBlock: "10.1.1.0/24",
        vpcId: vpc.id,
        tags: TAGS.AWS
    });
    // create subnetC
    const subnetC = new aws.ec2.Subnet(`${PREFIX.PROJECT}-subnet-c`, {
        availabilityZone: `${process.env.AWS_REGION}c`,
        cidrBlock: "10.1.3.0/24",
        vpcId: vpc.id,
        tags: TAGS.AWS
    });
    // create internet gateway
    const internetGateway = new aws.ec2.InternetGateway(`${PREFIX.PROJECT}-internet-gateway`, {
        vpcId: vpc.id,
        tags: TAGS.AWS
    });

    const defaultRouteTable = new aws.ec2.DefaultRouteTable(`${PREFIX.PROJECT}-default-route-table`, {
        defaultRouteTableId: vpc.defaultRouteTableId,
        routes: [{
            cidrBlock: "0.0.0.0/0",
            gatewayId: internetGateway.id
        }],
        tags: TAGS.AWS
    });

    // create security group for vpc endpoint witch is mongodb connection
    const endpointSecurityGroup = new aws.ec2.SecurityGroup(`${PREFIX.PROJECT}-endpoint-security-group`, {
        vpcId: vpc.id,
        description: "Allow mongodb connection for private link endpoint",
        ingress: [
            {
                fromPort: 0,
                toPort: 0,
                protocol: "-1",
                cidrBlocks: ["0.0.0.0/0"],
            }
        ],
        tags: TAGS.AWS
    });

    const VpcEndpoint = new aws.ec2.VpcEndpoint(`${PREFIX.PROJECT}-endpoint`, {
        vpcId: vpc.id,
        serviceName: mongodbPrivateLinkEndpoint.endpointServiceName,
        vpcEndpointType: "Interface",
        subnetIds: [subnetA.id, subnetC.id],
        securityGroupIds: [endpointSecurityGroup.id],
        tags: TAGS.AWS
    });
    const mongodbPrivateLinkEndpointService = new mongodbAtlas.PrivateLinkEndpointService(`${PREFIX.PROJECT}-endpoint-service`, {
        projectId: mongodbPrivateLinkEndpoint.projectId,
        privateLinkId: mongodbPrivateLinkEndpoint.privateLinkId,
        endpointServiceId: VpcEndpoint.id,
        providerName: "AWS"
    });

    // create new ECR repository
    const ecrRepository = new aws.ecr.Repository(`${PREFIX.PROJECT}-ecr`, {
        name: `${PREFIX.PROJECT}-ecr`,
        imageTagMutability: "MUTABLE",
        tags: TAGS.AWS
    });

    // create ecs network cluster with FARGATE provider
    const cluster = new aws.ecs.Cluster(`${PREFIX.PROJECT}-cluster`, {
        name: `${PREFIX.PROJECT}-cluster`,
        capacityProviders: ["FARGATE"],
        tags: TAGS.AWS
    });

    const ecsTaskExecutionWithSecretsRole = new aws.iam.Role(`${PREFIX.PROJECT}-ecs-task-execution-with-secrets-Access`, {
        name: `${PREFIX.PROJECT}-ecsTaskExecutionWithSecretsAccess`,
        description: "Allows ECS tasks to call AWS services on your behalf.",
        assumeRolePolicy: JSON.stringify({
            "Version": "2008-10-17",
            "Statement": [{
                "Effect": "Allow",
                "Principal": { "Service": "ecs-tasks.amazonaws.com" },
                "Action": "sts:AssumeRole"
            }]
        }),
        inlinePolicies: [
            {
                name: "SecretsAccessAndLogsPolicy",
                policy: JSON.stringify({
                    Version: "2012-10-17",
                    Statement: [
                        {
                            "Effect": "Allow",
                            "Action": "secretsmanager:*",
                            "Resource": "*"
                        },
                        {
                            "Effect": "Allow",
                            "Action": [
                                "logs:CreateLogGroup",
                                "logs:CreateLogStream",
                                "logs:PutLogEvents",
                                "logs:DescribeLogStreams"
                            ],
                            "Resource": [
                                "arn:aws:logs:*:*:*"
                            ]
                        }
                    ]
                })
            },
        ],
        tags: TAGS.AWS
    });

    const rolePolicyAttachment = new aws.iam.RolePolicyAttachment(`${PREFIX.PROJECT}-role-policy-attachment`, {
        role: ecsTaskExecutionWithSecretsRole,
        policyArn: "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
    });

    const secretManager = new aws.secretsmanager.Secret(`${PREFIX.PROJECT}-secretsmanager`, {
        name: `${PREFIX.PROJECT}-secretsmanager`,
        description: `${PREFIX.PROJECT} secret string`,
        recoveryWindowInDays: 0,
        tags: TAGS.AWS
    });

    const secretManagerVersion = mongodbCluster.connectionStrings[0].privateEndpoints[0].srvConnectionString.apply(srvConnectionString => {
        const svrString = "mongodb+srv://";
        const suffixString = "/dropthebit?authSource=admin&readPreference=primary&ssl=true"
        const mongodbUser = `${process.env.MONGODB_ATLAS_DATABASE_USERNAME}:${process.env.MONGODB_ATLAS_DATABASE_PASSWORD}@`;
        const connectionString = `${svrString}${mongodbUser}${srvConnectionString.split(svrString)[1]}${suffixString}`
        return new aws.secretsmanager.SecretVersion(`${PREFIX.PROJECT}-secret-manager-version`, {
            secretId: secretManager.id,
            secretString: JSON.stringify({
                "MONGO_URI": connectionString,
                "SES_ACCESS_KEY_ID": process.env.API_SES_ACCESS_KEY_ID,
                "SES_SECRET_ACCESS_KEY": process.env.API_SES_SECRET_ACCESS_KEY,
                "SES_REGION": process.env.API_SES_REGION,
                "SECRET_KEY": process.env.API_SECRET_KEY
            })
        });
    });

    // TODO: save task definition to local json file and use it in the next step
    const taskDefinition = pulumi.all([secretManagerVersion.arn, ecrRepository.repositoryUrl])
    .apply(([secretManagerVersionArn, repositoryUrl]) => {
        return new aws.ecs.TaskDefinition(`${PREFIX.PROJECT}-task-definition`, {
            family: `${PREFIX.PROJECT}-task-definition`,
            networkMode: "awsvpc",
            executionRoleArn: ecsTaskExecutionWithSecretsRole.arn,
            containerDefinitions: JSON.stringify(
                [
                    {
                        "command": [],
                        "cpu": 0,
                        "dependsOn": null,
                        "disableNetworking": null,
                        "dnsSearchDomains": [],
                        "dnsServers": [],
                        "dockerLabels": {},
                        "dockerSecurityOptions": [],
                        "entryPoint": [],
                        "environment": [],
                        "environmentFiles": [],
                        "essential": true,
                        "extraHosts": [],
                        "firelensConfiguration": null,
                        "healthCheck": null,
                        "hostname": null,
                        "image": `${repositoryUrl}:latest`,
                        "interactive": null,
                        "links": [],
                        "linuxParameters": null,
                        "logConfiguration": {
                            "logDriver": "awslogs",
                            "options": {
                                "awslogs-create-group": "true",
                                "awslogs-group": `/ecs/${PREFIX.PROJECT}-ecs-task`,
                                "awslogs-region": process.env.AWS_REGION,
                                "awslogs-stream-prefix": "ecs"
                            },
                            "secretOptions": []
                        },
                        "memory": null,
                        "memoryReservation": null,
                        "mountPoints": [],
                        "name": `${PREFIX.PROJECT}-container`,
                        "portMappings": [
                            {
                                "containerPort": Number(process.env.API_SERVICE_CONTAINER_PORT),
                                "hostPort": Number(process.env.API_SERVICE_CONTAINER_PORT),
                                "protocol": "tcp"
                            }
                        ],
                        "privileged": null,
                        "pseudoTerminal": null,
                        "readonlyRootFilesystem": null,
                        "resourceRequirements": null,
                        "startTimeout": null,
                        "stopTimeout": null,
                        "systemControls": [],
                        "ulimits": [],
                        "user": null,
                        "volumesFrom": [],
                        "secrets": [
                            {
                                "name": "SECRET_KEY",
                                "valueFrom": `${secretManagerVersionArn}:SECRET_KEY::`
                            },
                            {
                                "name": "MONGO_URI",
                                "valueFrom": `${secretManagerVersionArn}:MONGO_URI::`
                            },
                            {
                                "name": "SES_ACCESS_KEY_ID",
                                "valueFrom": `${secretManagerVersionArn}:SES_ACCESS_KEY_ID::`
                            },
                            {
                                "name": "SES_SECRET_ACCESS_KEY",
                                "valueFrom": `${secretManagerVersionArn}:SES_SECRET_ACCESS_KEY::`
                            },
                            {
                                "name": "SES_REGION",
                                "valueFrom": `${secretManagerVersionArn}:SES_REGION::`
                            }
                        ],
                        "workingDirectory": null
                    }
                ]
            ),
            requiresCompatibilities: [
                "EC2",
                "FARGATE"
            ],
            cpu: process.env.API_TASK_DEFINITION_CPU,
            memory: process.env.API_TASK_DEFINITION_MEMORY,
            runtimePlatform: {
                "cpuArchitecture": "X86_64",
                "operatingSystemFamily": "LINUX"
            },
            tags: TAGS.AWS
        });
    });



    // create security group for alb web 80 port
    const albSecurityGroup = new aws.ec2.SecurityGroup(`${PREFIX.PROJECT}-alb-security-group`, {
        vpcId: vpc.id,
        description: `${PREFIX.PROJECT}-alb-security-group`,
        ingress: [
            {
                "fromPort": 80,
                "protocol": "tcp",
                "toPort": 80,
                "cidrBlocks": [
                    "0.0.0.0/0"
                ],
                "description": "Allow HTTP traffic from the world"
            },
            {
                "fromPort": 443,
                "protocol": "tcp",
                "toPort": 443,
                "cidrBlocks": [
                    "0.0.0.0/0"
                ],
                "description": "Allow HTTPS traffic from the world"
            }
        ],
        egress: [{
            fromPort: 0,
            toPort: 0,
            protocol: "-1",
            cidrBlocks: ["0.0.0.0/0"],
        }],
        tags: TAGS.AWS
    });

    // create application load balancer
    const alb = new aws.lb.LoadBalancer(`${PREFIX.PROJECT}-lb`, {
        name: `${PREFIX.PROJECT}-lb`,
        internal: false,
        ipAddressType: "ipv4",
        securityGroups: [
            albSecurityGroup.id
        ],
        subnets: [subnetA.id, subnetC.id],
        tags: TAGS.AWS
    });
    // create target group
    const targetGroup = new aws.lb.TargetGroup(`${PREFIX.PROJECT}-tg`, {
        name: `${PREFIX.PROJECT}-tg`,
        port: 80,
        protocol: "HTTP",
        vpcId: vpc.id,
        targetType: "ip",
        healthCheck: {
            path: "/",
            protocol: "HTTP",
        },
        tags: TAGS.AWS
    });

    //TODO: Setting up DNS validation
    // create AWS certificate manager
    const certificate = new aws.acm.Certificate(`${PREFIX.PROJECT}-certificate`, {
        domainName: `*.${process.env.CLOUDFLARE_DOMAIN_NAME}`,
        validationMethod: "DNS",
        tags: TAGS.AWS
    });

    const awsCertificateValidationOptions = certificate.domainValidationOptions[0];
    const cloudflareCnameRecordForAwsCertificateValidation = new cloudflare.Record(`${PREFIX.PROJECT}-cloudflare-cname-record-for-aws-certificate-validation`, {
        zoneId: process.env.CLOUDFLARE_ZONE_ID,
        name: awsCertificateValidationOptions.resourceRecordName,
        type: "CNAME",
        value: awsCertificateValidationOptions.resourceRecordValue,
        proxied: false,
        allowOverwrite: true
    });

    const certificateValidation = new aws.acm.CertificateValidation(`${PREFIX.PROJECT}-certificate-validation`, {
        certificateArn: certificate.arn,
        validationRecordFqdns: [cloudflareCnameRecordForAwsCertificateValidation.hostname]
    })

    
    
    // create listener http 80 port
    const listenerHttp = new aws.lb.Listener(`${PREFIX.PROJECT}-alb-listener-http`, {
        loadBalancerArn: alb.arn,
        port: 80,
        protocol: "HTTP",
        defaultActions: [
            {
                type: "forward",
                targetGroupArn: targetGroup.arn
            }
        ],
        tags: TAGS.AWS
    });
    // create listener http 443 port
    const listenerHttps = new aws.lb.Listener(`${PREFIX.PROJECT}-alb-listener-https`, {
        loadBalancerArn: alb.arn,
        port: 443,
        protocol: "HTTPS",
        defaultActions: [
            {
                type: "forward",
                targetGroupArn: targetGroup.arn
            }
        ],
        certificateArn: certificate.arn,
        sslPolicy: "ELBSecurityPolicy-2016-08",
        tags: TAGS.AWS
    });

    //create security group for ecs service which is API_SERVICE_CONTAINER_PORT
    const ecsSecurityGroup = new aws.ec2.SecurityGroup(`${PREFIX.PROJECT}-ecs-security-group`, {
        vpcId: vpc.id,
        description: `${PREFIX.PROJECT}-ecs-security-group`,
        ingress: [{
            fromPort: 0,
            toPort: 0,
            protocol: "-1",
            cidrBlocks: ["0.0.0.0/0"],
        }],
        egress: [{
            fromPort: 0,
            toPort: 0,
            protocol: "-1",
            cidrBlocks: ["0.0.0.0/0"],
        }],
        tags: TAGS.AWS
    });

    //create ecs service
    const service = new aws.ecs.Service(`${PREFIX.PROJECT}-ecs-service`, {
        launchType: "FARGATE",
        cluster: cluster.id,
        taskDefinition: taskDefinition.arn,
        networkConfiguration: {
            assignPublicIp: true,
            securityGroups: [
                ecsSecurityGroup.id
            ],
            subnets: [subnetA.id, subnetC.id]
        },
        desiredCount: Number(process.env.API_SERVICE_DESIRED_COUNT),
        deploymentMaximumPercent: Number(process.env.API_SERVICE_MAXIMUM_PERCENT),
        deploymentMinimumHealthyPercent: Number(process.env.API_SERVICE_MINIMUM_HEALTHY_PERCENT),
        loadBalancers: [
            {
                targetGroupArn: targetGroup.arn,
                containerName: `${PREFIX.PROJECT}-container`,
                containerPort: Number(process.env.API_SERVICE_CONTAINER_PORT)
            }
        ],
        tags: TAGS.AWS
    });

    // create cloudflare DNS record
    const cloudflareDnsRecord = new cloudflare.Record(`${PREFIX.PROJECT}-cloudflare-dns-record`, {
        zoneId: process.env.CLOUDFLARE_ZONE_ID,
        name: `${PREFIX.DNS_RECORD_NAME}`,
        type: "CNAME",
        value: alb.dnsName,
        proxied: true,
        ttl: 1,
        allowOverwrite: true
    });
};
