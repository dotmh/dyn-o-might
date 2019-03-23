const faker = require('faker');

module.exports.basic = {
    id: {
        isKey: true,
        required: true
    },
    foo: true,
    bar: false
}

const get_requests_reponse_valid_key = faker.lorem.sentence();

module.exports.types = {

    number: {
        definition: {
            key: {
                isKey: true,
            },
            field: {
                type: "number",
                required: true
            }
        },
        payload: {
            valid: {
                key: "A",
                field: faker.random.number()
            },
            invalid: {
                key: "A",
                field: faker.random.word()
            }
        }
    }
}

module.exports.get = {
    definition: {
        from: {
            isKey: true,
            required: true
        },
        to: true,
        toCode: true,
        fromCode: true
    },
    definitionWithTypes: {
        from: {
            isKey: true,
            required: true,
            type: "string"
        },
        to: {
            reequired: true,
            type: "string"
        },
        toCode: {
            reequired: true,
            type: "string"
        },
        fromCode: {
            reequired: true,
            type: "string"
        }
    },
    requests: {
        valid: {
            key: get_requests_reponse_valid_key
        }
    },
    response: {
        valid: {
            from: get_requests_reponse_valid_key,
            to: faker.lorem.sentence(),
            toCode: faker.address.countryCode(),
            fromCode: faker.address.countryCode()
        },
        noData: {},
        invalid: {
            key: "dog",
            text: faker.lorem.sentence(),
            number: faker.random.number()
        },
        missingRequired: {
            from: get_requests_reponse_valid_key,
            to: faker.lorem.sentence(),
            toCode: faker.address.countryCode(),
            fromCode: undefined
        },
        missingKeyField: {
            to: faker.lorem.sentence(),
            toCode: faker.address.countryCode(),
            fromCode: faker.address.countryCode()
        },
        withIncorrectType: {
            from: get_requests_reponse_valid_key,
            to: faker.random.number(),
            toCode: faker.address.countryCode(),
            fromCode: faker.address.countryCode()
        }
    }
}