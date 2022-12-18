#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {RestApiStack} from '../lib/rest-api-stack';
import {FrontEndStack} from "../lib/frontend-stack";

const app = new cdk.App();
new RestApiStack(app, 'RestApiStack', {
    env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});

new FrontEndStack(app, 'FrontEndStack', {
    env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});
