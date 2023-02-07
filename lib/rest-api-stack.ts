import {Construct} from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { ApiGatewayWafTrigger } from "./api-gateway-waf-trigger";

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
        const apiGatewayWafTrigger = new ApiGatewayWafTrigger(this, 'ApiGatewayWafTrigger', {
            restApiId: this.restApi.restApiId,
            stageName: 'prod',
        });

        apiGatewayWafTrigger.triggerFunction.executeAfter(this.restApi);
    }
}
