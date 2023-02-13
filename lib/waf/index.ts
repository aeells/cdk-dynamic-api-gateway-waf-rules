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

    const apiPaths: string[] = [];
    for (const [key] of Object.entries(JSON.parse(apiExport.body.toString()).paths))
    {
        apiPaths.push(key.replace('{bookId}', '[A-Za-z0-9]+-[A-za-z0-9]+'));
    }

    await new AWS.SSM().putParameter({
        Name: 'api-paths',
        Value: apiPaths.toString(),
        Overwrite: true,
        Type: 'String'
    }).promise();
};

