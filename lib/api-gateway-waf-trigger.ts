import {Construct} from 'constructs';

import * as triggers from 'aws-cdk-lib/triggers';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';

export interface ApiGatewayWafTriggerProps
{
    readonly restApiId: string;
    readonly stageName: string;
}

export class ApiGatewayWafTrigger extends Construct
{
    readonly triggerFunction: triggers.TriggerFunction;

    constructor(scope: Construct, id: string, properties: ApiGatewayWafTriggerProps)
    {
        super(scope, id);

        this.triggerFunction = new triggers.TriggerFunction(this, 'ApiGatewayOpenApiPutFn', {
            runtime: lambda.Runtime.NODEJS_16_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, 'waf')),
            environment: {
              REST_API_ID: properties.restApiId,
              STAGE_NAME: properties.stageName
            },
            initialPolicy: [
                new iam.PolicyStatement({
                    effect: iam.Effect.ALLOW,
                    actions: ['apigateway:GET', 'ssm:*'],
                    resources: ['*']
                })
            ]
        })
    }
}