const faker = require("faker");

module.exports.faker = faker;

module.exports.basic = {
	id: {
		isKey: true,
		required: true
	},
	foo: true,
	bar: false
};

const getRequestsReponseValidKey = faker.lorem.sentence();

module.exports.types = {

	number: {
		definition: {
			key: {
				isKey: true
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
				field: 0
			}
		}
	},

	object: {
		definition: {
			key: {
				isKey: true
			},
			field: {
				type: "object",
				required: true
			}
		},
		payload: {
			valid: {
				key: "A",
				field: {
					a: faker.random.word()
				}
			},
			invalid: {
				key: "A",
				field: {}
			}
		}
	},

	array: {
		definition: {
			key: {
				isKey: true
			},
			field: {
				type: "array",
				required: true
			}
		},
		payload: {
			valid: {
				key: "A",
				field: [faker.random.word()]
			},
			invalid: {
				key: "A",
				field: []
			}
		}
	},

	string: {
		definition: {
			key: {
				isKey: true
			},
			field: {
				type: "string",
				required: true
			}
		},
		payload: {
			valid: {
				key: "A",
				field: faker.random.word()
			},
			invalid: {
				key: "A",
				field: ""
			}
		}
	},

	boolean: {
		definition: {
			key: {
				isKey: true
			},
			field: {
				type: "boolean",
				required: true
			}
		},
		payload: {
			valid: {
				key: "A",
				field: true
			}
		}
	},

	"Boolean false": {
		definition: {
			key: {
				isKey: true
			},
			field: {
				type: "boolean",
				required: true
			}
		},
		payload: {
			valid: {
				key: "A",
				field: false
			}
		}
	}
};

module.exports.delete = {
	definition: {
		key: {
			isKey: true,
			reequired: true
		}
	},
	requests: {
		valid: {
			key: getRequestsReponseValidKey
		}
	},
	response: {
		valid: {}
	}
};

module.exports.scan = (() => {
	const count = faker.random.number(10);

	return {
		definition: {
			from: {
				isKey: true,
				required: true
			},
			to: true,
			toCode: true,
			fromCode: true
		},
		response: {
			valid: {
				Items: (new Array(count)).fill(null).map(() => {
					return {
						from: getRequestsReponseValidKey,
						to: faker.lorem.sentence(),
						toCode: faker.address.countryCode(),
						fromCode: faker.address.countryCode()
					};
				}),
				Count: count
			}
		}
	};
})();

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
			key: getRequestsReponseValidKey
		}
	},
	response: {
		valid: {
			from: getRequestsReponseValidKey,
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
			from: getRequestsReponseValidKey,
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
			from: getRequestsReponseValidKey,
			to: faker.random.number(),
			toCode: faker.address.countryCode(),
			fromCode: faker.address.countryCode()
		}
	}
};

module.exports.put = {
	definition: {
		from: {
			isKey: true,
			required: true
		},
		to: true,
		toCode: true,
		fromCode: true
	},
	requests: {
		valid: {
			key: faker.random.word(),
			payload: {
				to: faker.random.word(),
				toCode: faker.address.countryCode(),
				fromCode: faker.address.countryCode()
			}
		},
		invalid: {
			key: faker.random.word(),
			payload: {
				to: faker.random.word()
			}
		}
	}
};
