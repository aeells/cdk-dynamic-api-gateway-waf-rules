## Generate dynamic WAF rules from deployed API Gateway endpoints

### Why is this helpful?


### CDK Components
This example repo consists of the following CDK components.

###### Rest API stack
- Dummy API Gateway REST API 
- TriggerFunction to invoke an AWS Lambda function during deployment
- Lambda function to capture and store API endpoints in AWS Systems Manager Parameter Store

###### Frontend stack
- Reads API endpoint paths from AWS Systems Manager Parameter Store
- Creates 'Allow' WAF rules matching all '/api/**' endpoints
- Creates 'Block' WAF rules for all other '/api' endpoints
- Creates an associated Regional WAF ACL

### Prerequisites
- Sign up for an AWS account (this example will deploy to free-tier if destroyed) 
- (Best practice) Enable MFA for the root user
- (Best practice) Create a user group with 'AdministratorAccess' permissions and associate a user with access key credentials
- Store these access key credentials in `~/.aws/credentials`

### Basic commands

* `npm run build`     compile typescript to js
* `cdk deploy --all`  deploy all stacks to your default AWS account/region
* `cdk destroy --all` destroy all stacks in your default AWS account/region

### Additional useful commands

* `npm run clean`     clean project
* `npm run watch`     watch for changes and compile
* `npm run test`      perform the jest unit tests
* `npm run test:update-snapshot` update any jest unit test snapshots
* `cdk diff`          compare deployed stack with current state
* `cdk synth`         emits the synthesized CloudFormation template
