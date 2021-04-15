import {CfnWebACL} from '@aws-cdk/aws-wafv2';
import { Construct } from '@aws-cdk/core';

const WebAppWaf = (stack: Construct) => new CfnWebACL(stack, 'waf', {
    description: 'ACL for WebApp',
    scope: 'REGIONAL',
    defaultAction: { allow: {} },
    visibilityConfig: {
        sampledRequestsEnabled: true,
        cloudWatchMetricsEnabled: true,
        metricName: 'webapp-firewall'
    },
    rules: [
        {
            name: 'LimitRequests1000',
            priority: 2,
            action: {
                block: {}
            },
            statement: {
                rateBasedStatement: {
                    limit: 1000,
                    aggregateKeyType: "IP"
                }
            },
            visibilityConfig: {
                sampledRequestsEnabled: true,
                cloudWatchMetricsEnabled: true,
                metricName: 'LimitRequests1000'
            }
        },
    ]
})

export default WebAppWaf;