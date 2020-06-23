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