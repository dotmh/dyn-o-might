/* eslint-disable no-unused-expressions, max-nested-callbacks, spaced-comment */
const {
	expect
} = require("chai");
const AWS = require("aws-sdk");
const AWSMock = require("aws-sdk-mock");

const mocks = require("./mocks");
const Dynomight = require("..");

const TableName = process.env.TABLE_NAME || "TEST_TABLE";

const DynamoDB = {
	DocumentClient: "DynamoDB.DocumentClient"
};

describe("Dyn-O-Might", () => {
	before(() => {
		// Hack so that tests can be run indivisually
		AWSMock.mock(DynamoDB.DocumentClient, "get", (params, callback) => {
			callback(null, {
				Item: {}
			});
		});
		AWSMock.mock(DynamoDB.DocumentClient, "put", (params, callback) => {
			callback(null, {
				Item: {}
			});
		});
		AWSMock.mock(DynamoDB.DocumentClient, "delete", (params, callback) => {
			callback(null, {
				Item: {}
			});
		});
		AWSMock.mock(DynamoDB.DocumentClient, "scan", (params, callback) => {
			callback(null, {
				Item: {}
			});
		});
	});

	describe("#construct", () => {
		it("should create a new instance of the class", () => {
			AWSMock.remock(DynamoDB.DocumentClient, "get", (params, callback) => {
				callback(null, {
					Item: {}
				});
			});
			const definition = mocks.basic;
			const dynomight = new Dynomight((new AWS.DynamoDB.DocumentClient()), TableName, definition);
			expect(dynomight.definition).to.be.an("object").and.deep.include(definition);
			expect(dynomight.tableName).to.equal(TableName);
		});
	});

	describe("#scan", () => {
		it("should return all the data for a table");
		it("should reject the promise when AWS returns an error");
	});

	describe("#get", () => {
		it("should get data from DynamoDB", async () => {
			const mockResponse = mocks.get.response.valid;

			AWSMock.remock(DynamoDB.DocumentClient, "get", (_params, callback) => {
				callback(null, {
					Item: mockResponse
				});
			});
			const {
				definition
			} = mocks.get;
			const dynomight = new Dynomight((new AWS.DynamoDB.DocumentClient()), TableName, definition);

			const response = await dynomight.get(mocks.get.requests.valid.key);
			expect(response).to.deep.equal(mockResponse);
		});

		it("should return null when no data is returned", async () => {
			const mockResponse = mocks.get.response.noData;

			AWSMock.remock(DynamoDB.DocumentClient, "get", (patams, callback) => {
				callback(null, mockResponse);
			});

			const {
				definition
			} = mocks.get;
			const dynomight = new Dynomight((new AWS.DynamoDB.DocumentClient()), TableName, definition);

			const response = await dynomight.get(mocks.get.requests.valid.key);
			expect(response).to.equal(null);
		});

		it("should reject the promise when AWS returns an error", (done) => {
			const errorMessage = "Simulated Error";

			AWSMock.remock(DynamoDB.DocumentClient, "get", (_params, callback) => {
				callback(new Error(errorMessage), null);
			});

			const {
				definition
			} = mocks.get;

			const dynomight = new Dynomight((new AWS.DynamoDB.DocumentClient()), TableName, definition);
			dynomight.get(mocks.get.requests.valid.key).catch((error) => {
				expect(error.message).to.be.a("string").and.equal(errorMessage);
				done();
			});
		});
	});

	describe("#put", () => {
		it("should store data in dynamo db", async () => {
			const mockResponse = {
				...{
					from: mocks.put.requests.valid.key
				},
				...mocks.put.requests.valid.payload
			};

			AWSMock.remock(DynamoDB.DocumentClient, "put", (params, callback) => {
				callback(null, mockResponse);
			});

			const {
				definition
			} = mocks.put;
			const dynomight = new Dynomight((new AWS.DynamoDB.DocumentClient()), TableName, definition);

			const response = await dynomight.put(
				mocks.put.requests.valid.key,
				mocks.put.requests.valid.payload
			);

			expect(response).to.deep.equal(mockResponse);
		});

		it("should reject on invalid data in dynamo db", (done) => {
			const mockResponse = {
				...{
					from: mocks.put.requests.valid.key
				},
				...mocks.put.requests.valid.payload
			};

			AWSMock.remock(DynamoDB.DocumentClient, "put", (params, callback) => {
				callback(null, mockResponse);
			});

			const {
				definition
			} = mocks.put;
			const dynomight = new Dynomight((new AWS.DynamoDB.DocumentClient()), TableName, definition);

			dynomight.put(
				mocks.put.requests.valid.key,
				mocks.put.requests.invalid.payload
			).catch((error) => {
				expect(error.message).to.be.a("string").and.equal("toCode is required, fromCode is required");
				done();
			});
		});

		it("should reject the promise when AWS returns an error", (done) => {
			const errorMessage = mocks.faker.random.words(3);

			AWSMock.remock(DynamoDB.DocumentClient, "put", (params, callback) => {
				callback(new Error(errorMessage), null);
			});

			const {
				definition
			} = mocks.get;

			const dynomight = new Dynomight((new AWS.DynamoDB.DocumentClient()), TableName, definition);
			dynomight.put(
				mocks.put.requests.valid.key,
				mocks.put.requests.valid.payload
			).catch((error) => {
				expect(error.message).to.be.a("string").and.equal(errorMessage);
				done();
			});
		});
	});

	describe("#delete", () => {
		it("should delete the record from DynamoDB", async () => {
			AWSMock.remock(DynamoDB.DocumentClient, "delete", (params, callback) => {
				callback(null, mocks.delete.response.valid);
			});

			const {
				definition
			} = mocks.delete;
			const dynomight = new Dynomight((new AWS.DynamoDB.DocumentClient()), TableName, definition);
			const response = await dynomight.delete(mocks.delete.requests.valid.key);

			expect(response.status).to.be.true;
		});

		it("should reject the promise when AWS returns an error", (done) => {
			const errorMessage = mocks.faker.random.words(3);

			AWSMock.remock(DynamoDB.DocumentClient, "delete", (params, callback) => {
				callback(new Error(errorMessage), null);
			});

			const {
				definition
			} = mocks.delete;
			const dynomight = new Dynomight((new AWS.DynamoDB.DocumentClient()), TableName, definition);

			dynomight.delete(mocks.delete.requests.valid.key).catch((error) => {
				expect(error.message).to.be.a("string").and.equal(errorMessage);
				done();
			});
		});
	});

	describe("#isValid", () => {
		it("should validate against a valid payload", () => {
			const {
				definition
			} = mocks.get;
			const dynomight = new Dynomight((new AWS.DynamoDB.DocumentClient()), TableName, definition);
			const result = dynomight.isValid(mocks.get.response.valid);

			expect(result.isValid).to.be.true; //eslint-
		});

		it("should not validate against an invalid payload", () => {
			const {
				definition
			} = mocks.get;
			const dynomight = new Dynomight((new AWS.DynamoDB.DocumentClient()), TableName, definition);
			const result = dynomight.isValid(mocks.get.response.invalid);

			expect(result.isValid).to.be.false;
		});

		it("should not validate if a required field is missing", () => {
			const {
				definition
			} = mocks.get;
			const dynomight = new Dynomight((new AWS.DynamoDB.DocumentClient()), TableName, definition);

			const result = dynomight.isValid(mocks.get.response.missingRequired);

			expect(result.isValid).to.be.false;
			expect(result.errors).to.be.an("array").and.include("fromCode is required");
		});

		it("should not validate if the key field is missing", () => {
			const {
				definition
			} = mocks.get;
			const dynomight = new Dynomight((new AWS.DynamoDB.DocumentClient()), TableName, definition);

			const result = dynomight.isValid(mocks.get.response.missingKeyField);

			expect(result.isValid).to.be.false;
			expect(result.errors).to.be.an("array").and.includes("Key field from is required");
		});

		it("should not validate if the fields data is the wrong type", () => {
			const definition = mocks.get.definitionWithTypes;
			const dynomight = new Dynomight((new AWS.DynamoDB.DocumentClient()), TableName, definition);

			const result = dynomight.isValid(mocks.get.response.withIncorrectType);

			expect(result.isValid).to.be.false;
			expect(result.errors).to.be.an("array")
				.and.includes("to should be string but number found");
		});

		describe("#isRquired with types", () => {
			Object.entries(mocks.types).forEach((typeData) => {
				const [type, data] = typeData;

				it(`should validate type ${type} as required`, () => {
					const {
						definition
					} = data;
					const dynomight = new Dynomight((new AWS.DynamoDB.DocumentClient()), TableName, definition);

					const result = dynomight.isValid(data.payload.valid);

					expect(result.isValid).to.be.true;
				});

				if ("invalid" in data.payload) {
					it(`shouldn't validate type ${type} as required when its emoty for the type`, () => {
						const {
							definition
						} = data;
						const dynomight = new Dynomight((new AWS.DynamoDB.DocumentClient()), TableName, definition);

						const result = dynomight.isValid(data.payload.invalid);

						expect(result.isValid).to.be.false;
						expect(result.errors).to.be.an("array")
							.and.includes("field is required");
					});
				}
			});
		});
	});

	describe("Validation Hook", () => {
		it("should populate the event with the payload", (done) => {
			const mockData = mocks.get.response.valid;
			const {
				definition
			} = mocks.get;
			const dynomight = new Dynomight((new AWS.DynamoDB.DocumentClient()), TableName, definition);

			dynomight.on(dynomight.validationHook, (event) => {
				expect(event.data).to.deep.equal(mockData);
				done();
			});

			dynomight.isValid(mockData);
		});

		it("should populate the event with the defintion", (done) => {
			const {
				definition
			} = mocks.get;
			const dynomight = new Dynomight((new AWS.DynamoDB.DocumentClient()), TableName, definition);

			dynomight.on(dynomight.validationHook, (event) => {
				expect(event.definition).to.deep.equal(definition);
				done();
			});

			dynomight.isValid(mocks.get.response.valid);
		});

		it("should populate the event with the defintion", (done) => {
			const {
				definition
			} = mocks.get;
			const dynomight = new Dynomight((new AWS.DynamoDB.DocumentClient()), TableName, definition);

			dynomight.on(dynomight.validationHook, (event) => {
				expect(event.tableName).to.deep.equal(dynomight.tableName);
				done();
			});

			dynomight.isValid(mocks.get.response.valid);
		});

		it("should validate against it own rules and report back", () => {
			const {
				definition
			} = mocks.get;
			const dynomight = new Dynomight((new AWS.DynamoDB.DocumentClient()), TableName, definition);

			const fakeError = mocks.faker.random.words(4);

			dynomight.on(dynomight.validationHook, (event) => {
				event.result.push(fakeError);
				return event;
			});

			const result = dynomight.isValid(mocks.get.response.valid);

			expect(result.isValid).to.be.false;
			expect(result.errors).to.be.an("array").and.includes(fakeError);
		});

		it("should be able to prevent the default validation rules", () => {
			const {
				definition
			} = mocks.get;
			const dynomight = new Dynomight((new AWS.DynamoDB.DocumentClient()), TableName, definition);

			dynomight.on(dynomight.validationHook, (event) => {
				event.preventDefault = true;
				return event;
			});

			const result = dynomight.isValid(mocks.get.response.invalid);

			expect(result.isValid).to.be.true;
		});
	});

	describe("Hooks", () => {
		describe("scan", () => {
			it("should fire before a scan event");
			it("should fire after a scan event");
		});

		describe("get", () => {
			it("should fire before a get event", (done) => {
				const key = mocks.faker.random.word();

				AWSMock.remock(DynamoDB.DocumentClient, "get", (params, callback) => {
					expect(params.Key).to.be.a("string").and.equal(key);
					callback(null, {
						Item: null
					});
					done();
				});

				const {
					definition
				} = mocks.get;

				const dynomight = new Dynomight((new AWS.DynamoDB.DocumentClient()), TableName, definition);
				dynomight.on(dynomight.beforeGetHook, (params) => {
					params.Key = key;
					return params;
				});

				dynomight.get(mocks.get.requests.valid.key);
			});

			it("should fire after a get event", async () => {
				const add = mocks.faker.random.word();
				const {
					definition
				} = mocks.get;
				const mockResponse = mocks.get.response.valid;

				AWSMock.remock(DynamoDB.DocumentClient, "get", (params, callback) => {
					callback(null, {
						Item: mockResponse
					});
				});

				const dynomight = new Dynomight((new AWS.DynamoDB.DocumentClient()), TableName, definition);
				dynomight.on(dynomight.afterGetHook, (params) => {
					params.to = add;
					return params;
				});

				const response = await dynomight.get(mocks.get.requests.valid.key);
				expect(response.to).to.equal(add);
			});
		});

		describe("put", () => {
			it("should fire before a put event", async () => {
				const {
					definition
				} = mocks.put;
				const fake = mocks.faker.random.word();

				AWSMock.remock(DynamoDB.DocumentClient, "put", (params, callback) => {
					expect(params.Item.to).to.be.a("string").and.equal(fake);
					callback(null, params.Item);
				});

				const dynomight = new Dynomight((new AWS.DynamoDB.DocumentClient()), TableName, definition);
				dynomight.on(dynomight.beforePutHook, (params) => {
					params.to = fake;
					return params;
				});

				await dynomight.put(
					mocks.put.requests.valid.key,
					mocks.put.requests.valid.payload
				);
			});

			it("should fire after a put event", async () => {
				const {
					definition
				} = mocks.put;
				const fake = mocks.faker.random.word();
				const key = "from";
				const mockResponse = {
					...{
						from: mocks.put.requests.valid.key
					},
					...mocks.put.requests.valid.payload
				};

				AWSMock.remock(DynamoDB.DocumentClient, "put", (params, callback) => {
					callback(null, mockResponse);
				});

				const dynomight = new Dynomight((new AWS.DynamoDB.DocumentClient()), TableName, definition);
				dynomight.on(dynomight.afterPutHook, (params) => {
					params[key] = fake;
					return params;
				});

				const response = await dynomight.put(
					mocks.put.requests.valid.key,
					mocks.put.requests.valid.payload
				);

				expect(response[key]).to.be.a("string").and.equal(fake);
			});
		});

		describe("delete", () => {
			it("should fire before a delete event", async () => {
				AWSMock.remock(DynamoDB.DocumentClient, "delete", (params, callback) => {
					callback(null, mocks.delete.response.valid);
				});

				const {
					definition
				} = mocks.delete;
				const dynomight = new Dynomight((new AWS.DynamoDB.DocumentClient()), TableName, definition);

				dynomight.on(dynomight.beforeDeleteHook, (event) => {
					event.canDelete = false;
					return event;
				});

				const response = await dynomight.delete(mocks.delete.requests.valid.key);

				expect(response.status).to.be.false;
			});

			it("should fire after the delete event", async () => {
				AWSMock.remock(DynamoDB.DocumentClient, "delete", (params, callback) => {
					callback(null, mocks.delete.response.valid);
				});

				const eventValue = mocks.faker.random.word();

				const {
					definition
				} = mocks.delete;
				const dynomight = new Dynomight((new AWS.DynamoDB.DocumentClient()), TableName, definition);
				dynomight.on(dynomight.afterDeleteHook, (event) => {
					event.foo = eventValue;
					return event;
				});

				const response = await dynomight.delete(mocks.delete.requests.valid.key);

				expect(response.foo).to.be.a("string").and.equal(eventValue);
			});
		});

		it("should throw an error when you specifiy an non-existant hook", () => {
			const hook = Symbol("hook.does.not.exist");
			const {
				definition
			} = mocks.get;
			const dynomight = new Dynomight((new AWS.DynamoDB.DocumentClient()), TableName, definition);

			const fn = () => dynomight.on(hook, () => null);

			expect(fn).to.throw(`Hook ${hook.toString()} does not exist`);
		});
	});
});
