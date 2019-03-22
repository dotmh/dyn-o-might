const {expect} = require('chai');
const AWS = require('aws-sdk');
const AWSMock = require('aws-sdk-mock');

const mocks = require('./mocks');
const Dynomight = require('..');


const TableName = process.env.TABLE_NAME || "TEST_TABLE";

const DynamoDB = {
    DocumentClient: "DynamoDB.DocumentClient"
}

describe("Dyn-O-Might", function () {

    before(function () {
        // hack so that tests can be run indivisually
        AWSMock.mock(DynamoDB.DocumentClient, 'get', function (params, callback) {
            callback(null, {Item: {}});
        });
    })

    describe('#construct', function( ) {
        it("should create a new instance of the class", function () {
            AWSMock.remock(DynamoDB.DocumentClient, 'get', function (params, callback) {
                callback(null, {Item: {}});
            });
            const definition = mocks.basic;
            const dynomight = new Dynomight((new AWS.DynamoDB.DocumentClient()), TableName, definition);
            expect(dynomight.definition).to.be.an("object").and.deep.include(definition);
            expect(dynomight.tableName).to.equal(TableName);
        });
    });

    describe('#get', function () {
        it("should get data from DynamoDB", async function () {
            const mockResponse = mocks.get.response.valid;

            AWSMock.remock(DynamoDB.DocumentClient, 'get', function (params, callback) {
                callback(null, {Item: mockResponse});
            });
            const definition = mocks.get.definition;
            const dynomight = new Dynomight((new AWS.DynamoDB.DocumentClient()), TableName, definition);

            const response = await dynomight.get(mocks.get.requests.valid.key);
            expect(response).to.deep.equal(mockResponse);

        });

        it("should return null when no data is returned", async function () {
            const mockResponse = mocks.get.response.noData;

            AWSMock.remock(DynamoDB.DocumentClient, 'get', function (patams, callback) {
                callback(null, mockResponse);
            });

            const definition = mocks.get.definition;
            const dynomight = new Dynomight((new AWS.DynamoDB.DocumentClient()), TableName, definition);

            const response = await dynomight.get(mocks.get.requests.valid.key);
            expect(response).to.equal(null);
        });

        it("should reject the promise when AWS returns an error", async function () {
            AWSMock.remock(DynamoDB.DocumentClient, 'get', function (params, callback) {
                callback(new Error("Simulated Error"), null);
            });

            const definition = mocks.get.definition;
            const fn = async () => {
                const dynomight = new Dynomight((new AWS.DynamoDB.DocumentClient()), TableName, definition);
                const response = await dynomight.get(mocks.get.requests.valid.key);
            }

            expect(fn).to.throw;
        });
    });

    describe("#isValid" , function () {

        it("should validate against a valid payload", function () {
            const definition = mocks.get.definition;
            const dynomight = new Dynomight((new AWS.DynamoDB.DocumentClient()), TableName, definition);
            const result = dynomight.isValid(mocks.get.response.valid);

            expect(result.isValid).to.be.true;
        });

        it("should not validate against an invalid payload", function () {
            const definition = mocks.get.definition;
            const dynomight = new Dynomight((new AWS.DynamoDB.DocumentClient()), TableName, definition);
            const result = dynomight.isValid(mocks.get.response.invalid);

            expect(result.isValid).to.be.false;
        });

        it("should not validate if a required field is missing");
        it("should not validate if the key field is missing");
        it("should not validate if the fields data is the wrong type");

    });

    describe("#put", function () {

    });
});
