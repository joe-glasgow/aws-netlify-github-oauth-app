import {
    ApplicationLoadBalancedFargateService,
    ApplicationLoadBalancedServiceRecordType
} from "@aws-cdk/aws-ecs-patterns";
// @ts-ignore
import path from "path";
import {ApplicationProtocol} from "@aws-cdk/aws-elasticloadbalancingv2";
import {Construct} from "@aws-cdk/core";
import {IHostedZone} from "@aws-cdk/aws-route53";
import {ICertificate} from "@aws-cdk/aws-certificatemanager";
import {ICluster, ContainerImage} from "@aws-cdk/aws-ecs";

interface ContainerSecrets {
    [key: string]: string
}

interface ApplicationLoadBalancedServiceProps {
    stack: Construct,
    cluster: ICluster,
    domainZone: IHostedZone,
    domainName: string,
    certificate: ICertificate,
    imagePath: string,
    envSecrets: ContainerSecrets
}

const applicationLoadBalancedService = (
    {
        stack,
        cluster,
        domainZone,
        domainName,
        certificate,
        imagePath,
        envSecrets,
    }: ApplicationLoadBalancedServiceProps) => new ApplicationLoadBalancedFargateService(
    stack, "WebappFargateService", {
        cluster, // Required
        cpu: 512, // Default is 256
        desiredCount: 1, // Default is 1
        assignPublicIp: true,
        taskImageOptions: {
            containerPort: 3000,
            image: ContainerImage.fromAsset(imagePath),
            enableLogging: true,
            environment: envSecrets
        },
        memoryLimitMiB: 1024, // Default is 512
        domainZone,
        protocol: ApplicationProtocol.HTTPS,
        domainName,
        certificate,
        recordType: ApplicationLoadBalancedServiceRecordType.ALIAS,
        publicLoadBalancer: true // Default is false
    })

export default applicationLoadBalancedService
