import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as waf from 'aws-cdk-lib/aws-wafv2';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Fn } from 'aws-cdk-lib';

export interface WafRule
{
    name: string;
    rule: waf.CfnWebACL.RuleProperty;
}

export class FrontEndStack extends cdk.Stack
{
    readonly openApiPaths: string[];

    constructor(scope: Construct, id: string, props?: cdk.StackProps)
    {
        super(scope, id, props);

        this.openApiPaths = Fn.split(',',
            ssm.StringParameter.fromStringParameterAttributes(this, 'ERSchedulerSSMOpenApiPaths', {
                parameterName: 'openapi-paths',
            }).stringValue
        );

        this.createWafAcl();
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

    // todo aeells - it might be more efficient to create a single rule with multiple statements?
    private getApiGatewayPathAllowRules(priority: number): WafRule[] {
        const rules: WafRule[] = [];
        for (let i = 0; i < this.openApiPaths.length; i++) {
            const apiPath: string = Fn.select(i, this.openApiPaths);
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
                        searchString: '/api/',
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
