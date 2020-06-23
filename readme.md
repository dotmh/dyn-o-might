![DynO-Might](logo.svg)


Dyn-O-Might
===========
[![DotMH Future Gadget Lab](https://img.shields.io/badge/DotMH-.dev-red.svg?style=flat-square)](https://www.dotmh.io)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/xojs/xo)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/0d61d8d487524ed98cb6bf18d3db8b57)](https://www.codacy.com?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=dotmh/dynomight&amp;utm_campaign=Badge_Grade)
[![Codacy Badge](https://api.codacy.com/project/badge/Coverage/0d61d8d487524ed98cb6bf18d3db8b57)](https://www.codacy.com?utm_source=github.com&utm_medium=referral&utm_content=dotmh/dynomight&utm_campaign=Badge_Coverage)
[![Build Status](https://semaphoreci.com/api/v1/projects/1b6ec428-e2c7-45ef-b144-acf910092b2d/2598338/badge.svg)](https://semaphoreci.com/dotmh/dyn-o-might)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-v2.0%20adopted-ff69b4.svg)](code_of_conduct.md)

A small (but one day hopefully mighty) wrapper round [AWS DynomoDB](https://aws.amazon.com/dynamodb/) to do commonly required things. 

__WARNING this is very much a work in progress! Not all off DynomoDB is supported yet. I tend to add new features and support more of dynomoDB as I need it. Use at own risk__ 

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
|--------------------|-------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `beforePutHook`    | Operation Hook - Before Put                                 | `parameters` Object - The raw parameters object before it sent to DynamoDB                                                                                                                                                                                                                                 |
| `afterPutHook`     | Operation Hook - After Put                                  | `response` Object - The processed response object returned by DynamoDB                                                                                                                                                                                                                                     |
| `beforeGetHook`    | Operation Hook - Before Get                                 | `parameters`  Object - The raw parameters object before it sent to DynamoDB                                                                                                                                                                                                                                |
| `afterGetHook`     | Operation Hook - After Get                                  | `response`  Object - The processed response object returned by DynamoDB                                                                                                                                                                                                                                    |
| `beforeDeleteHook` | Operation Hook - Before Delete                              | `parameters`  Object - The raw parameters object before it sent to DynamoDB                                                                                                                                                                                                                                |
| `afterDeleteHook`  | Operation Hook - After Delete                               | `response`  Object - The processed response object returned by DynamoDB                                                                                                                                                                                                                                    |
| `beforeScanHook`   | Operation Hook - Before Scan                                | `parameters`  Object - The raw parameters object before it sent to DynamoDB                                                                                                                                                                                                                                |
| `afterScanHook`    | Operation Hook - After Scan                                 | `response`  Object - The processed response object returned by DynamoDB                                                                                                                                                                                                                                    |
| `validationHook`   | This hook is fired when anything calls the `isValid` method | `event` See `isValid` method documentation  - `preventDefault`: Boolean (false) prevent the use of the default validation - `data`: Object The data that is been saved - `definition` : Object The definition object  - `tableName`: String The table name - `result` : Array The result of the validation |