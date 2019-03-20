module.exports = class DynoMight {

    constructor(db, tableName, definition = {}) {
        this.db = db;
        this.tableName = tableName;
        this.definition = definition;
    }

    get(key) {
        return new Promise((resolve, reject) => {
            this.db.get({
                TableName: this.tableName,
                Key: {
                    [this._keyField()] : key
                }
            }, (err, result) => {
                if(err) {
                    reject(err);
                } else {
                    if (result.item) {
                        resolve(this._mapFields(result.item));
                    } else {
                        reject({});
                    }
                }
            });
        });
    }

    put(key, payload) {
        return new Promise((resolve, reject) => {

            const Item = {...{
                [this._keyField()]: key
            }, ...payload};

            this.db.put({
                TableName: this.tableName,
                Item
            }, (err) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(Item);
                }
            });
        });
    }

    isValid(payload) {

    }

    _keyField() {
        return this._definitionAsArray().find((entities) => {
            const [field, data] = entities;
            if(data.isKey === true) {
                return field;
            }
        }) || null;
    }

    _mapFields(item) {
        let responseData = {};
        this._definitionAsArray().forEach((entities) => {
            const [field, data] = entities;
            if(field in item) {
                responseData[field] = data;
            }
        });
        return responseData;
    }

    _definitionAsArray() {
        return Object.entries(this.definition);
    }

}