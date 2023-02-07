#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import {RestApiStack} from '../lib/rest-api-stack';
import {WafAclStack} from "../lib/waf-acl-stack";

const app = new cdk.App();

const restApiStack = new RestApiStack(app, 'RestApiStack', {
    env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});

const wafAclStack = new WafAclStack(app, 'WafAclStack', {
    env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});

wafAclStack.addDependency(restApiStack, 'REST API needs to exist before attempting to build WAF rules.');
