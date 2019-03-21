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
				console.log('ITEM', err, result);

				if (err) {
					reject(err);
				} else if (result.Item) {
					const mapped = this._mapFields(result.Item);
					console.log('MAPPED', mapped);
					resolve(mapped);
				} else {
					resolve(null);
				}
			});
		});
	}

	put(key, payload) {
		return new Promise((resolve, reject) => {
			const Item = {...{
				[this._keyField()]: key
			}, ...payload};

			console.log('PUT:', Item, payload);

			const validation = this.isValid(Item);

			if (!validation.isValid) {
				reject(new Error(validation.errors.join(', ')));
				return null;
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
			const item = field in payload ? payload[field] : undefined;
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
		});

		validation.push(this._test(this._hasKey(payload), `Key field ${this._keyField()} is required`));

		console.log('VALIDATION ERRRS', validation);

		const errors = validation.filter(result => result !== true);

		console.log('ERRORs', errors, errors.length === 0);

		return {
			isValid: errors.length === 0,
			errors
		};
	}

	_test(result, message) {
		return result === false ? message : result;
	}

	_hasKey(payload) {
		return Object.keys(payload).lastIndexOf(this._keyField()) !== -1;
	}

	_isType(data, type) {
		return typeof (data) === type;
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
				valid = data.length > 0;
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
			const field = entities[0];
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
