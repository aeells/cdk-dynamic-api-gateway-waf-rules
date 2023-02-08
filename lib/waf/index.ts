import * as AWS from 'aws-sdk';

export const handler = async (
    event:  any
) => {
    const apiExport : any = await new AWS.APIGateway().getExport({
        exportType: 'oas30',
        restApiId: `${process.env.REST_API_ID}`,
        stageName: `${process.env.STAGE_NAME}`,
        accepts: 'application/json'
    }).promise();

    const openApiSpec: string[] = [];
    for (const [key] of Object.entries(JSON.parse(apiExport.body.toString()).paths))
    {
        openApiSpec.push(key.replace('{bookId}', '[A-Za-z0-9]+-[A-za-z0-9]+'));
    }

    await new AWS.SSM().putParameter({
        Name: 'openapi-paths',
        Value: openApiSpec.toString(),
        Overwrite: true,
        Type: 'String'
    }).promise();
};
