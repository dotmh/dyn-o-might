const faker = require('faker');

module.exports.basic = {
    id : {
        isKey: true,
        required: true
    },
    foo: true,
    bar: false
}

const get_requests_reponse_valid_key = faker.lorem.sentence();

module.exports.get = {
    definition: {
        from : {
            isKey: true,
            required: true
        },
        to: true,
        toCode: true,
        fromCode: true
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
            toCode: faker.address.countryCode,
            fromCode: faker.address.countryCode
        }
    }
}