import * as cdk from '@aws-cdk/core';
import * as ec2 from "@aws-cdk/aws-ec2";
import * as ecs from "@aws-cdk/aws-ecs";
import * as ecs_patterns from "@aws-cdk/aws-ecs-patterns";
import {ApplicationLoadBalancedServiceRecordType} from "@aws-cdk/aws-ecs-patterns";
import {PublicHostedZone} from "@aws-cdk/aws-route53";
import * as path from "path";
import {DnsValidatedCertificate} from "@aws-cdk/aws-certificatemanager";
import {ApplicationProtocol} from "@aws-cdk/aws-elasticloadbalancingv2";

export class WebappStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const domainName = this.node.tryGetContext('domain') || process.env.DOMAIN_NAME

    const domainZone = PublicHostedZone.fromLookup(this, 'PublicHostedZone', {
      domainName,
      privateZone: false,
    })

    const vpc = new ec2.Vpc(this, "WebappVpc", {
      maxAzs: 3 // Default is all AZs in region
    });

    const cluster = new ecs.Cluster(this, "WebappCluster", {
      vpc: vpc
    });

    const certificate = new DnsValidatedCertificate(this, 'LBCertificate', {
      hostedZone: domainZone,
      domainName,
    })

    // Create a load-balanced Fargate service and make it public
    const lb = new ecs_patterns.ApplicationLoadBalancedFargateService(this, "WebappFargateService", {
      cluster, // Required
      cpu: 512, // Default is 256
      desiredCount: 1, // Default is 1
      taskImageOptions: {
        containerPort: 3000,
        image: ecs.ContainerImage.fromAsset(path.resolve(__dirname, '../simple'))
      },
      memoryLimitMiB: 1024, // Default is 512
      domainZone,
      protocol: ApplicationProtocol.HTTPS,
      domainName,
      certificate,
      recordType: ApplicationLoadBalancedServiceRecordType.ALIAS,
      publicLoadBalancer: true // Default is false
    })

    lb.loadBalancer.addRedirect()
  }
}