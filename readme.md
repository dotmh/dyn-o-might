![DynO-Might](logo.svg)

Dyn-O-Might
===========

[![DotMH Future Gadget Lab](https://img.shields.io/badge/DotMH-.dev-red.svg?style=flat-square)](https://www.dotmh.io)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/xojs/xo)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/0d61d8d487524ed98cb6bf18d3db8b57)](https://www.codacy.com?utm_source=github.com&utm_medium=referral&utm_content=dotmh/dynomight&utm_campaign=Badge_Grade)
[![Codacy Badge](https://api.codacy.com/project/badge/Coverage/0d61d8d487524ed98cb6bf18d3db8b57)](https://www.codacy.com?utm_source=github.com&utm_medium=referral&utm_content=dotmh/dynomight&utm_campaign=Badge_Coverage)
[![Build Status](https://semaphoreci.com/api/v1/projects/1b6ec428-e2c7-45ef-b144-acf910092b2d/2598338/badge.svg)](https://semaphoreci.com/dotmh/dyn-o-might)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-v2.0%20adopted-ff69b4.svg)](code_of_conduct.md)
[![Buy us a tree](https://img.shields.io/badge/Treeware-%F0%9F%8C%B3-lightgreen?style=flat-square)](https://plant.treeware.earth/dotmh/lambda-controller)

A small (but one day hopefully mighty) wrapper round [AWS DynomoDB](https://aws.amazon.com/dynamodb/) to do commonly required things. 

**WARNING this is very much a work in progress! Not all off DynomoDB is supported yet. I tend to add new features and support more of dynomoDB as I need it. Use at own risk** 

Installation
------------

to install use NPM

```bash
npm i @dotmh/dynomight
```

Usage
-----

Dynomight is just a standard JS class called `DynoMight` and can be used in essentially two ways.

### Directly

You can create a new instance of the class and then use that directly 

```javascript
const DynoMight = require('@dotmh/dynomight');
const dynomight = new Dynomight((new AWS.DynamoDB.DocumentClient()), 'someTable', {
  id: {
    required: true,
    isKey: true
  }
});
```

then call methods on that instance 

```javascript
const result = await dynomight.put(id, document);
```

### By Extention

You can also create your own class and extend DynoMight , this is the way I tend to use it for more complex projects. 

```javascript
const DynoMight = require('@dotmh/dynomight');

class MyModel extends DynoMight {
  constructor() {
    super((new AWS.DynamoDB.DocumentClient()), 'someTable', {
      id: {
        required: true,
        isKey: true
      }
    });
  }
}
```

This allows you to add domain specific code to the class that is interacting with your DynmoDB data. 

You then of course use an instance of your class to interact with Dynomdb. 

```javascript
const myModel = new MyModel();
const result = await myModel.put(id, document);
```

Definition
----------

In the examples above we pass an instance of the AWS SDK DynamoDB Document Client, the name we want for our table and this thing called a definition. A definition is like a schema in traditional database schema. Dynomight uses this to work out how to handle operations to and from DynamoDB as well as for validation. 

A defintion is a standard object that defines which fields to use, whether they are the key field and optionally some validation rules such as type or requirement. 

The object key is the field name i.e. `id` and the value is the metadata about that field. this can include 

-   `isKey` Whether this is the document key field. _Remember the warning this whole library is not complete, one of the most obvious omitions is that it doesn't support sort keys yet as I just havent needed them_
-   `required` Whether or not the field is required its is a boolean `true` it is required, `false` it is not
-   `type` The JS type of the field if you were to run [typeof](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof) **NOTE** this does know the difference between an object and array. 

When you only want to define a field , you can use a short hand for required and just set the value to a boolean i.e. if there is a field called `to` and it is required `to: true` would be all that is needed. 

Example 

```javascript
{
  from: {
    required: true,
    isKey: true
  },
  to: true,
  fromCode: true,
  toCode: true
}
```

Any other field meta data can be stored here that you want, if you add extra functionality then you can store meta data for the field that it requires. For example I have a plugin that uses more advanced validation using [validate.js](https://validatejs.org) a definition for that was 

```javascript
const defintion = {
  // ... more fields
  website: {
    validation: {
      presence: false,
      type: "string",
      url: true
    }
  },
  // ... more fields
}
```

Hooks
-----

Event ... or whatever you want to call them, is away of extending DynOMight to add new functionality. All operations have a pre hook and most (execpt for validation) has an after hook. Hooks get triggered automatically as the class does its works. 

To bind a hook you use the `on` method. The method takes some hook name, and a callback function to run when the hook is triggered. 

```javascript
myModel.on(myModel.beforePuthHook, (data) => console.log(data));
```

Hook names are always [JS Symbols](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol) so you need to use the class properties for hooks. 

Hooks can be used to achieve all kinds of things, I added them for this very reason as I needed this functionality. One use I needed was to automatically put a "date updated" and "date created" stamp on every record. which looks like this 

```javascript
// class set up code 
constructor() {
  // Constructor set up code
  timestamps();
}

timestamps() {
  // Create some constants
  const DATE_CREATED = 'date-created';
  const DATE_UPDATED = 'date-updated';
  
  // Update the definition to add our new fields.
  this.definition[DATE_CREATED] = true;
	this.definition[DATE_UPDATED] = true;

  //bind to the `beforePut` hook so every time we update a record this is triggered
	this.on(this.beforePutHook, (params) => {
    // Get the time now
    const now = new Date().toUTCString();
    
    // If we don't have a date created then we create one and set the date created
		if (!(DATE_CREATED in params)) {
			params[DATE_CREATED] = now;
		}

    // Set the date updated to now
    params[DATE_UPDATED] = now;
    
    // Return the result This is a MUST!
		return params;
	});
}

```

_Please note that I have changed this code slightly for the sake of this example, as using it as is would cause you to store a date in a not very useful format i.e. `Tue, 23 Jun 2020 14:42:15 GMT` which isn't ideal_

### Hook List

| Hook               | Description                                                 | Parameters                                                                                                                                                                                                                                                                                                 |
| ------------------ | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `beforePutHook`    | Operation Hook - Before Put                                 | `parameters` Object - The raw parameters object before it sent to DynamoDB                                                                                                                                                                                                                                 |
| `afterPutHook`     | Operation Hook - After Put                                  | `response` Object - The processed response object returned by DynamoDB                                                                                                                                                                                                                                     |
| `beforeGetHook`    | Operation Hook - Before Get                                 | `parameters`  Object - The raw parameters object before it sent to DynamoDB                                                                                                                                                                                                                                |
| `afterGetHook`     | Operation Hook - After Get                                  | `response`  Object - The processed response object returned by DynamoDB                                                                                                                                                                                                                                    |
| `beforeDeleteHook` | Operation Hook - Before Delete                              | `parameters`  Object - The raw parameters object before it sent to DynamoDB                                                                                                                                                                                                                                |
| `afterDeleteHook`  | Operation Hook - After Delete                               | `response`  Object - The processed response object returned by DynamoDB                                                                                                                                                                                                                                    |
| `beforeScanHook`   | Operation Hook - Before Scan                                | `parameters`  Object - The raw parameters object before it sent to DynamoDB                                                                                                                                                                                                                                |
| `afterScanHook`    | Operation Hook - After Scan                                 | `response`  Object - The processed response object returned by DynamoDB                                                                                                                                                                                                                                    |
| `validationHook`   | This hook is fired when anything calls the `isValid` method | `event` See `isValid` method documentation  - `preventDefault`: Boolean (false) prevent the use of the default validation - `data`: Object The data that is been saved - `definition` : Object The definition object  - `tableName`: String The table name - `result` : Array The result of the validation |

Documentation
-------------

Comming Soon - Remember its not finished 😜

Licence
-------

This package is [Treeware](https://treeware.earth). If you use it in production, then we ask that you [**buy the world a tree**](https://plant.treeware.earth/dotmh/lambda-controller) to thank us for our work. By contributing to the Treeware forest you’ll be creating employment for local families and restoring wildlife habitats.

Credits
-------

Logo design by [@dotmh](https://www.dotmh.io)
