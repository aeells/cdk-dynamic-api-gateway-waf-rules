import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as path from 'path';

import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { ApiGatewayWafTrigger } from "./api-gateway-waf-trigger";

export class RestApiStack extends cdk.Stack
{
    private restApi: apigateway.RestApi;
    
    constructor(scope: Construct, id: string, props?: cdk.StackProps)
    {
        super(scope, id, props);

        // in the real world, our api endpoint resources are loaded from an external package from another development team
        this.createExampleRestApi();

        // there is no cdk api to list/get RestApi resources so using a lambda and sdk
        this.createApiGatewayWafTrigger();
    }

    private createExampleRestApi()
    {
        this.restApi = new apigateway.RestApi(this, 'ApiGatewayRestApi', {
            description: 'example api gateway',
        });

        const users = this.restApi.root.addResource('users');
        const user = users.addResource('{userId}');
        const getUserLambda = new lambda.Function(this, 'getUserLambda', {
            runtime: lambda.Runtime.NODEJS_16_X,
            handler: 'index.main',
            code: lambda.Code.fromAsset(path.join(__dirname, '/user')),
        });
        user.addMethod('GET', new apigateway.LambdaIntegration(getUserLambda, {proxy: true}));
        // ...etc...
    }

    private createApiGatewayWafTrigger()
    {
        const apiGatewayWafTrigger = new ApiGatewayWafTrigger(this, 'ApiGatewayWafTrigger', {
            restApiId: this.restApi.restApiId,
            stageName: 'prod',
        });

        apiGatewayWafTrigger.triggerFunction.executeAfter(this.restApi);
    }
}
