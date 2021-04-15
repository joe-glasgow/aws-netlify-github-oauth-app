import {Vpc} from "@aws-cdk/aws-ec2";
import {SubnetType} from "@aws-cdk/aws-ec2";
import {Construct} from "@aws-cdk/core";

const vpc = (stack: Construct) => new Vpc(stack, "WebappVpc", {
    maxAzs: 2, // Default is all AZs in region
    natGateways: 0,
    subnetConfiguration: [
        {cidrMask: 23, name: 'Public', subnetType: SubnetType.PUBLIC}
    ]
});


export default vpc;