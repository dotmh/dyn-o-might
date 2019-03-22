const {expect} = require('chai');
const AWS = require('aws-sdk-mock');

const mocks = require('./mocks');
const Dynomight = require('..');


const TableName = process.env.TABLE_NAME || "TEST_TABLE";

const DynamoDB = {
    DocumentClient: "DynamoDB.DocumentClient"
}

describe("Dyn-O-Might", function () {

    describe('#construct', function( ) {
        it("should create a new instance of the class", function () {
            const ddb = AWS.mock(DynamoDB.DocumentClient, 'get', (params,cb) => cb(null));
            const definition = mocks.basic;
            const dynomight = new Dynomight(ddb, TableName, definition);
            expect(dynomight.definition).to.be.an("object").and.deep.include(definition);
            expect(dynomight.tableName).to.equal(TableName);
        });
    });

    describe('#get', function () {
        it("should get data from DynamoDB", async function () {
            const mockResponse = mocks.get.response.valid;
            const ddb = AWS.mock(DynamoDB.DocumentClient, 'getItem', (params, cb) => {
                cb(mockResponse);
            });
            const definition = mocks.get.definition;
            const dynomight = new Dynomight(ddb, TableName, definition);

            const response = await dynomight.get(mocks.get.requests.valid.key);
            expect(response).to.deep.equal(mockResponse);
        });
    });
});
