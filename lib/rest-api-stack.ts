import {Construct} from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as triggers from 'aws-cdk-lib/triggers';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';

export class RestApiStack extends cdk.Stack
{
    private restApi: apigateway.RestApi;
    
    constructor(scope: Construct, id: string, props?: cdk.StackProps)
    {
        super(scope, id, props);

        // in the real world, our api endpoint resources are loaded from an external package from another development team
        this.createDummyRestApi();

        // there is no cdk api to list/get RestApi resources so using a lambda and sdk
        this.createApiGatewayWafTrigger();
    }

    private createDummyRestApi()
    {
        this.restApi = new apigateway.RestApi(this, 'ApiGatewayRestApi', {
            description: 'example api gateway',
        });

        const books = this.restApi.root.addResource('books');
        books.addMethod('GET');
        books.addMethod('POST');

        const book = books.addResource('{bookId}');
        book.addMethod('GET');
        book.addMethod('DELETE');

        // ...etc...
    }

    private createApiGatewayWafTrigger()
    {
        const triggerFunction = new triggers.TriggerFunction(this, 'ApiGatewayOpenApiPutFn', {
            runtime: lambda.Runtime.NODEJS_16_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, 'waf')),
            environment: {
                REST_API_ID: this.restApi.restApiId,
                STAGE_NAME: 'prod'
            },
            initialPolicy: [
                new iam.PolicyStatement({
                    effect: iam.Effect.ALLOW,
                    actions: ['apigateway:GET', 'ssm:*'],
                    resources: ['*']
                })
            ]
        });

        triggerFunction.executeAfter(this.restApi);
    }
}
