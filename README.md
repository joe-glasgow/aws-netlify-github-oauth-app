# AWS ECS Simple NodeJS App for Netlify Github Oauth!

This Project is a boilerplate for running a secure NodeJS app for Github Oauth through ECS using Fargate with CDK.

Based on a previous app created by [TylerGaw](https://glitch.com/edit/#!/netlify-cms-github-oauth-provider-example).

Full blog post [here](https://tylergaw.com/blog/netlify-cms-custom-oath-provider/).

The application provides Oauth for a [NetlifyCMS](https://www.netlifycms.org/) application (or any Github auth flow).

Provided with a basic [WAF](https://aws.amazon.com/waf/)

## Getting up and running!

Configure your [aws-cli](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html) and [CDK](https://aws.amazon.com/cdk/)

Be sure how you know how run CDK in [context](https://docs.aws.amazon.com/cdk/latest/guide/context.html)

## Setup domains and Route53

Register or transfer a domain using [Route53](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/Welcome.html).

Follow the steps to create a [Hosted Zone](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/hosted-zones-working-with.html)

Tip:

[Create accounts for development/testing/production](https://aws.amazon.com/organizations/getting-started/best-practices/)

I wished to have some sub-domains for various development/testing and production environment so this [tutorial](https://serverless-stack.com/chapters/share-route-53-domains-across-aws-accounts.html) helped set that up!

## Setup Oauth Key and Secret in Parameter store

Create your Oauth app in Github as detailed here:

https://docs.github.com/en/developers/apps/creating-an-oauth-app

Make sure the URL you use is the same as defined in the Route53 step above

Make a note of the Client Secret and Client ID and create 2 Parameters for each respectively in the [Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html).
* Use String for development only, SecureString should be used in production environments*

By default this application assumes there are named `GITHUB_OAUTH_CLIENTSECRET` and `GITHUB_OAUTH_CLIENTID`.


### Build the OauthApp stack

The webapp stack runs a simple NodeJS server instance with micro-service which consumes the graphql endpoint.
The app is [loadbalanced](https://aws.amazon.com/elasticloadbalancing/?elb-whats-new.sort-by=item.additionalFields.postDateTime&elb-whats-new.sort-order=desc) with its container hosted on [Fargate](https://aws.amazon.com/fargate/?whats-new-cards.sort-by=item.additionalFields.postDateTime&whats-new-cards.sort-order=desc&fargate-blogs.sort-by=item.additionalFields.createdDate&fargate-blogs.sort-order=desc) and protected using [WAF](https://aws.amazon.com/waf/) rules.


`cdk deploy --profile <YOURPROFILE-ID> -c region=eu-west-1 -c domain=<YOUR.DOMAIN.COM>`

The `cdk.json` file tells the CDK Toolkit how to execute your app.


## Certificate Creation for HTTPS

Uses the CDK method `DnsValidatedCertificate` which authorizes your certificates without having to manually approve. 
This requires the previous step completed for domains in Route53.

## ECS Registry, Cluster, Tasks, Service and Docker

WebappStack is deployed to ECS and the task is run based on the Dockerfile in the `simple` directory.

This application uses the ECS Patterns for an [application load balanced fargatge service](https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-ecs-patterns.ApplicationLoadBalancedFargateService.html)

## Testing the application

TODO

## CI Integration

TODO

## Local Development

To run the OauthNodeApp instances locally with Docker:

1. Deploy the GraphQL stack as described above
2. Change directory to the simple application `cd simple` 
3. Export the required variables used by the Docker instance
    `$ export GITHUB_OAUTH_CLIENTSECRET=$(aws ssm get-parameter --name=GITHUB_OAUTH_CLIENTSECRET --profile=<YOUR-PROFILE-ID> --query "Parameter.Value")`
    `$ export GITHUB_OAUTH_CLIENTID=$(aws ssm get-parameter --name=GITHUB_OAUTH_CLIENTID --profile=<YOUR-PROFILE-ID> --query "Parameter.Value")`
4. Build the docker image providing the new env variables e.g.
    `$ docker build --build-arg GITHUB_OAUTH_CLIENTSECRET --build-arg GITHUB_OAUTH_CLIENTID . `
5. Get the latest docker image id
    `$ docker image ls`
6. Run the latest image id and bind port 3000
   `$ docker run -p 3000:3000 <docker image id from step 5>`



## Useful commands


 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy -c domain=<INSERT DOMAIN NAME HERE>` deploy this stack to your default AWS account/region, providing a domain name
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
