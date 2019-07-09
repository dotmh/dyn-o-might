module.exports = class DynoMight {
	constructor(db, tableName, definition) {
		this.db = db;
		this.tableName = tableName;
		this.definition = definition;

		this.beforePutHook = Symbol("hook.before.put");
		this.afterPutHook = Symbol("hook.after.put");

		this.beforeGetHook = Symbol("hook.before.get");
		this.afterGetHook = Symbol("hook.after.get");

		this.beforeDeleteHook = Symbol("hook.before.delete");
		this.afterDeleteHook = Symbol("hook.after.delete");

		this.beforeScanHook = Symbol("hook.before.scan");
		this.afterScanHook = Symbol("hook.after.scan");

		this.validationHook = Symbol("hook.validation");

		this.hooks = {};
		this.validHooks = [
			this.beforePutHook,
			this.afterPutHook,
			this.beforeGetHook,
			this.afterGetHook,
			this.beforeDeleteHook,
			this.afterDeleteHook,
			this.beforeScanHook,
			this.afterScanHook,
			this.validationHook
		];
	}

	scan(_params = {}) {
		return new Promise((resolve, reject) => {
			let params = {
				TableName: this.tableName,
				..._params
			};

			params = this._triggerHook(this.beforeScanHook, params);
			this.db.scan(params, (err, result) => {
				if (err) {
					reject(err);
				} else {
					let mapped = result.map((item) => this._mapFields(item));
					mapped = this._triggerHook(this.afterScanHook, mapped);
					resolve(mapped);
				}
			});
		});
	}

	get(key) {
		return new Promise((resolve, reject) => {
			let params = {
				TableName: this.tableName,
				Key: {
					[this._keyField()]: key
				}
			};
			params = this._triggerHook(this.beforeGetHook, params);
			this.db.get(params, (err, result) => {
				if (err) {
					reject(err);
				} else if (result.Item) {
					let mapped = this._mapFields(result.Item);
					mapped = this._triggerHook(this.afterGetHook, mapped);
					resolve(mapped);
				} else {
					resolve(null);
				}
			});
		});
	}

	put(key, payload) {
		return new Promise((resolve, reject) => {
			let Item = {...{
				[this._keyField()]: key
			}, ...payload};

			Item = this._triggerHook(this.beforePutHook, Item);
			const validation = this.isValid(Item);

			if (!validation.isValid) {
				reject(new Error(validation.errors.join(", ")));
				return null;
			}

			this.db.put({
				TableName: this.tableName,
				Item
			}, (err) => {
				if (err) {
					reject(err);
				} else {
					Item = this._triggerHook(this.afterPutHook, Item);
					resolve(Item);
				}
			});
		});
	}

	delete(key) {
		return new Promise((resolve, reject) => {
			let event = {
				key,
				canDelete: true
			};
			if (this._hasHandlers(this.beforeDeleteHook)) {
				event = this._triggerHook(this.beforeDeleteHook, event);
			}

			if (!event.canDelete) {
				resolve({
					status: false,
					data: null
				});
			}

			this.db.delete({
				TableName: this.tableName,
				Key: key
			}, (err, data) => {
				if (err) {
					reject(err);
				} else {
					let response = {
						status: true,
						data
					};

					response = this._triggerHook(this.afterDeleteHook, response);
					resolve(response);
				}
			});
		});
	}

	isValid(payload) {
		let validation = [];
		let event = {
			preventDefault: false,
			data: payload,
			definition: this.definition,
			tableName: this.tableName,
			result: []
		};

		if (this._hasHandlers(this.validationHook)) {
			event = this._triggerHook(this.validationHook, event);
		}

		if ("result" in event) {
			validation = validation.concat(event.result);
		}

		if (!("preventDefault" in event) || ("preventDefault" in event && event.preventDefault === false)) {
			this._definitionAsArray().forEach((entities) => {
				const [field, data] = entities;
				const item = field in payload ? payload[field] : undefined;
				if (this._isType(data, "object")) {
					if ("type" in data) {
						validation.push(
							this._test(
								this._isType(item, data.type),
								`${field} should be ${data.type} but ${typeof (item)} found`
							)
						);
					}

					if ("required" in data && data.required === true) {
						validation.push(this._test(this._isRequired(item), `${field} is required`));
					}
				} else if (data === true) {
					validation.push(this._test(this._isRequired(item), `${field} is required`));
				}
			});

			validation.push(this._test(this._hasKey(payload), `Key field ${this._keyField()} is required`));
		}

		const errors = validation.filter((result) => result !== true);

		return {
			isValid: errors.length === 0,
			errors
		};
	}

	on(hookName, fn) {
		if (this.validHooks.lastIndexOf(hookName) === -1) {
			throw new Error(`Hook ${hookName.toString()} does not exist`);
		}

		this.hooks[hookName] = this.hooks[hookName] || [];
		this.hooks[hookName].push(fn);
	}

	_test(result, message) {
		return result === false ? message : result;
	}

	_hasKey(payload) {
		return Object.keys(payload).lastIndexOf(this._keyField()) !== -1;
	}

	_isType(data, type) {
		return type === "array" ? Array.isArray(data) : typeof (data) === type;
	}

	_isRequired(data) {
		let valid = true;

		switch (typeof (data)) {
			case "number":
				valid = data !== 0;
				break;
			case "object":
				if (Array.isArray(data)) {
					valid = data.length > 0;
				} else {
					valid = Object.keys(data).length > 0;
				}

				break;
			case "string":
				valid = data.length > 0;
				break;
			case "boolean":
				valid = data === true || data === false;
				break;
			default:
				valid = false;
				break;
		}

		return valid;
	}

	_keyField() {
		return this._definitionAsArray().find((entities) => {
			return (entities[1].isKey === true);
		})[0] || null;
	}

	_mapFields(item) {
		const responseData = {};
		this._definitionAsArray().forEach((entities) => {
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

	_triggerHook(hookName, event) {
		if (hookName in this.hooks) {
			this.hooks[hookName].forEach((hook) => {
				event = hook.call(this, event);
			});
		}

		return event;
	}

	_hasHandlers(hookName) {
		return (hookName in this.hooks && Array.isArray(this.hooks[hookName]) && this.hooks[hookName].length > 0);
	}
};
