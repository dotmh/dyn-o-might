module.exports = class DynoMight {
	constructor(db, tableName, definition = {}) {
		this.db = db;
		this.tableName = tableName;
		this.definition = definition;
	}

	get(key) {
		return new Promise((resolve, reject) => {

			const params = {
				TableName: this.tableName,
				Key: {
					[this._keyField()]: key
				}
			};

			console.log('PARAMS', params);

			this.db.get(params, (err, result) => {

				console.log('ITEM', result);

				if (err) {
					reject(err);
				} else if (result.Item) {
					resolve(this._mapFields(result.Item));
				} else {
					resolve({});
				}
			});
		});
	}

	put(key, payload) {
		return new Promise((resolve, reject) => {
			const Item = {...{
				[this._keyField()]: key
            }, ...payload};
            
            const validation = isValid(item);

            if (!validation.valid) {
                throw new Error(validation.validation.join(' '));
            }

			this.db.put({
				TableName: this.tableName,
				Item
			}, err => {
				if (err) {
					reject(err);
				} else {
					resolve(Item);
				}
			});
		});
	}

	isValid(payload) {
		const validation = [];

		this._definitionAsArray().forEach(entities => {
			const [field, data] = entities;

			if (field in payload) {
				const item = payload[field];
				if (this._isType(data, 'object')) {
					if ('type' in data) {
						validation.push(
							this._test(
								this._isType(item, data.type),
								`${field} should be ${data.type} but ${typeof (item)} found`
							)
						);
					}

					if ('required' in data && data.required === true) {
						validation.push(this._test(this._isRequired(item), `${field} is required`));
					}
				} else if (data === true) {
					validation.push(this._test(this._isRequired(item), `${field} is required`));
				}
			}
		});

		validation.push(this._test(this._hasKey(payload), `Key field ${this._keyField()} is required`));
    
        return {
            isValid: validation.length === 0,
            errors: validation
        };
    }

	_test(result, message) {
		return result === false ? message : result;
	}

	_hasKey(payload) {
		return Object.keys(payload).lastIndexOf(this._keyField()) !== -1;
	}

	_isType(data, type) {
		return type(data) === type;
	}

	_isRequired(data) {
		let valid = true;
		switch (typeof (data)) {
			case 'number':
				valid = data !== 0;
				break;
			case 'object':
				if (Array.isArray) {
					valid = data.length > 0;
				} else {
					valid = Object.keys(data).length > 0;
				}

				break;
			case 'symbol':
			case 'string':
				valid = data.length;
				break;
			case 'boolean':
				valid = data === true || data === false;
				break;
			case 'function':
			case 'undefined':
			default:
				valid = false;
				break;
		}

		return valid;
	}

	_keyField() {
		return this._definitionAsArray().find(entities => {
			return (entities[1].isKey === true);
		})[0] || null;
	}

	_mapFields(item) {
		const responseData = {};
		this._definitionAsArray().forEach(entities => {
			const [field, data] = entities;
			if (field in item) {
				responseData[field] = item[field];
			}
		});
		return responseData;
	}

	_definitionAsArray() {
		return Object.entries(this.definition);
	}
};
