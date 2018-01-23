import moment from "moment";
import AWS from "aws-sdk";
import path from "path";
import fs from "fs";
import * as dynamoTools from "./tools/dynamoTools";
import { success, failure } from "./tools/responseTools";
import config from "./config.json"

export function createThread(event, context, callback) {
    AWS.config.update({ region: config.region });
    const dynamoDb = new AWS.DynamoDB.DocumentClient();
    const s3 = new AWS.S3({ region: config.region });

    const data = JSON.parse(event.body);

    const dbParams = {
        TableName: config.tableName,
        Thread: {
            threadId: moment().valueOf(),
            threadTitle: data.threadTitle,
            posts: data.posts
        }
    };

    var putDbPromise = dynamoTools.call("put", dbParams);
    putDbPromise.then(function(data) {
        callback(null, success(params.Item));
    }).catch(function(err) {
        callback(null, failure({ status: false }));
    })
}

export async function getAllThreads(event, context, callback) {
    AWS.config.update({ region: config.region });
    const dynamoDb = new AWS.DynamoDB.DocumentClient();

    const time = moment().subtract(event.pathParameters.days, 'days').valueOf()
    const params = {
        TableName: config.tableName,
        KeyConditionExpression: "threadId >= :threadId",
        ExpressionAttributeValues: {
            ":threadId": time
        }
    };

    try {
        const result = await dynamoTools.call("query", params);
        callback(null, success(result.Item));
    } catch (e) {
        callback(null, failure({ status: false }));
    }
}