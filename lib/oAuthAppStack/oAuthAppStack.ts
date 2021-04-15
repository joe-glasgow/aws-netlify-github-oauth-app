import * as cdk from '@aws-cdk/core';
import * as ecs from "@aws-cdk/aws-ecs";
import * as wafv2 from '@aws-cdk/aws-wafv2';
import {PublicHostedZone} from "@aws-cdk/aws-route53";
import {DnsValidatedCertificate} from "@aws-cdk/aws-certificatemanager";
import WebAppWaf from "./waf/waf";
import vpc from "./vpc/vpc";
import applicationLoadBalancedService from "./applicationLoadBalancedService/applicationLoadBalancedService";
import path from 'path';
import {StringParameter} from "@aws-cdk/aws-ssm";

export class OauthAppStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        // provide domain name in cdk.json or via CLI e.g. -c domain=<sub.mydomain.com | mydomain.com>
        const domainName = this.node.tryGetContext('domain') || process.env.DOMAIN_NAME

        const domainZone = PublicHostedZone.fromLookup(this, 'PublicHostedZone', {
            domainName,
            privateZone: false,
        })

        const certificate = new DnsValidatedCertificate(this, 'LBCertificate', {
            hostedZone: domainZone,
            domainName,
        })

        const webAppVpc = vpc(this);

        const cluster = new ecs.Cluster(this, "WebappCluster", {
            vpc: webAppVpc,
            containerInsights: true,
        });
        // Path to application directory with Dockerfile
        const imagePath = path.resolve(__dirname, '../../simple')
        const envSecrets = {
            GITHUB_OAUTH_CLIENTSECRET: StringParameter.valueFromLookup(this, 'GITHUB_OAUTH_CLIENTSECRET'),
            GITHUB_OAUTH_CLIENTID: StringParameter.valueFromLookup(this, 'GITHUB_OAUTH_CLIENTID')
        }

        const appService = applicationLoadBalancedService({
            stack: this,
            cluster,
            domainZone,
            domainName,
            certificate,
            imagePath,
            envSecrets
        })
        // attach policy
        // Redirects HTTP to HTTPS as default if no configuration provided - ideal!
        appService.loadBalancer.addRedirect()

        const appWaf = WebAppWaf(this);
        // WAF to WebApp
        const wafAssoc = new wafv2.CfnWebACLAssociation(this, 'WebApp-waf-assoc', {
            resourceArn: appService.loadBalancer.loadBalancerArn,
            webAclArn: appWaf.attrArn
        });
        // attach the waf to load balancer
        wafAssoc.node.addDependency(appService.loadBalancer);
    }
}
