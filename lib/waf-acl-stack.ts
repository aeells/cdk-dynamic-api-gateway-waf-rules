import {Construct} from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as waf from 'aws-cdk-lib/aws-wafv2';
import * as ssm from 'aws-cdk-lib/aws-ssm';

export interface WafRule
{
    name: string;
    rule: waf.CfnWebACL.RuleProperty;
}

export class WafAclStack extends cdk.Stack
{
    private openApiPaths: string[];

    constructor(scope: Construct, id: string, props?: cdk.StackProps)
    {
        super(scope, id, props);

        // retrieve the REST API endpoint paths from SSM
        this.retrieveRestApiEndpointPaths();

        // create WAF Web ACL rules locked down to those endpoints
        this.createWafAcl();
    }

    private retrieveRestApiEndpointPaths()
    {
        this.openApiPaths = cdk.Fn.split(',',
            ssm.StringParameter.fromStringParameterAttributes(this, 'SSMOpenApiPaths', {
                parameterName: 'openapi-paths',
            }).stringValue,
            // todo aeells - this sucks but is a limitation of the CDK and required to iterate properly
            // not sure how to handle this better (should define as CONSTANT but easier here for demo)
            // read the Fn#split api to understand the restrictions
            2
        );
    }

    private createWafAcl() {
        const wafRules: WafRule[] = [
            ...this.getApiGatewayPathAllowRules(10), // 10+ Allow
            this.getApiGatewayPathBlockRule(20), // 20 Block
        ];

        return new waf.CfnWebACL(this, 'WafV2', {
            defaultAction: { allow: {} },
            visibilityConfig: {
                cloudWatchMetricsEnabled: false,
                metricName: 'cloudwatch-metrics-disabled-for-example-code',
                sampledRequestsEnabled: false,
            },
            scope: 'REGIONAL',
            rules: wafRules.map((wafRule) => wafRule.rule),
        });
    }

    private getApiGatewayPathAllowRules(priority: number): WafRule[] {
        const rules: WafRule[] = [];
        for (let i = 0; i < this.openApiPaths.length; i++) {
            const apiPath: string = cdk.Fn.select(i, this.openApiPaths);
            rules.push(this.createApiGatewayRegexAllowRule(apiPath, priority++));
        }

        return rules;
    }

    private createApiGatewayRegexAllowRule(path: string, priority: number): WafRule {
        return {
            name: `ApiGatewayPathAllows${priority}`,
            rule: {
                name: `ApiGatewayPathAllows${priority}`,
                priority: priority,
                action: {
                    allow: {},
                },
                visibilityConfig: {
                    sampledRequestsEnabled: true,
                    cloudWatchMetricsEnabled: true,
                    metricName: 'ApiGatewayPathAllows',
                },
                statement: {
                    regexMatchStatement: {
                        fieldToMatch: {
                            uriPath: {},
                        },
                        regexString: path,
                        textTransformations: [
                            {
                                type: 'NONE',
                                priority: 0,
                            },
                        ],
                    },
                },
            },
        };
    }

    private getApiGatewayPathBlockRule(priority: number): WafRule {
        return {
            name: 'ApiGatewayPathBlocks',
            rule: {
                name: 'ApiGatewayPathBlocks',
                priority: priority,
                action: {
                    block: {},
                },
                visibilityConfig: {
                    sampledRequestsEnabled: true,
                    cloudWatchMetricsEnabled: true,
                    metricName: 'ApiGatewayPathBlocks',
                },
                statement: {
                    byteMatchStatement: {
                        fieldToMatch: {
                            uriPath: {},
                        },
                        positionalConstraint: 'STARTS_WITH',
                        searchString: '/',
                        textTransformations: [
                            {
                                type: 'NONE',
                                priority: 0,
                            },
                        ],
                    },
                },
            },
        };
    }
}
