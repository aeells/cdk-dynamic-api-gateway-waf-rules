import { Template } from 'aws-cdk-lib/assertions';
import { App } from 'aws-cdk-lib';
import {RestApiStack} from '../lib/rest-api-stack';

describe('REST API stack test', () => {
    const app = new App();

    const restApiStack = new RestApiStack(app, 'RestApiStack', {
        env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
    });

    test('an API Gateway REST API exists with Lambda and associated TriggerFunction as per source-controlled snapshot', () => {
        expect(Template.fromStack(restApiStack)).toMatchSnapshot();
    });
});
