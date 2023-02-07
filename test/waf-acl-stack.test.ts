import { Template } from 'aws-cdk-lib/assertions';
import { App } from 'aws-cdk-lib';
import {RestApiStack} from '../lib/rest-api-stack';
import {WafAclStack} from "../lib/waf-acl-stack";

describe('WAF ACL stack test', () => {
    const app = new App();

    const wafAclStack = new WafAclStack(app, 'FrontEndStack', {
        env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
    });

    test('a WAF Web ACL exists with WAF "Allow" rules from deployed API endpoints and "Block" rules for all other endpoints as per source-controlled snapshot', () => {
        expect(Template.fromStack(wafAclStack)).toMatchSnapshot();
    });
});
