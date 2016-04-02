# glob-possible-parent [![Build Status](https://img.shields.io/travis/MartinKolarik/glob-possible-parent/master.svg?style=flat-square)](https://travis-ci.org/MartinKolarik/glob-possible-parent) [![Coverage Status](https://img.shields.io/coveralls/MartinKolarik/glob-possible-parent/master.svg?style=flat-square)](https://coveralls.io/github/MartinKolarik/glob-possible-parent?branch=master)

Find out if a path can be a parent of a file you are looking for.

## Installation

```
$ npm install glob-possible-parent
```

## Usage

This library can be used with a glob matching library ([micromatch](https://github.com/jonschlinkert/micromatch/),
[minimatch](https://github.com/isaacs/minimatch), etc.) to create a matcher that will match not
only the given pattern, but also any parent directories. This can be used to optimize
glob implementation, and prevent unnecessary disk access, by immediately ruling out
directories which can't contain any matching files.

```js
var gpp = require('glob-possible-parent');
var micromatch = require('micromatch'); // you can use any matcher implementation here

// 1. use gpp() to transform the original pattern into an array of patterns which can be passed to the matching library
// 2. create a RegExp from each pattern
// 3. join all created RegExps

var gppRegExp = new RegExp('^(?:\\/$|(?:' + gpp('src/js/**/*.js').map(function (pattern) {
	return micromatch.makeRe(pattern, { dot: true }).toString().slice(1, -1);
}).join('|') + '))$');

console.log(gppRegExp.test('src')); // => true
console.log(gppRegExp.test('src/js')); // => true
console.log(gppRegExp.test('src/js/x.js')); // => true

console.log(gppRegExp.test('src/css')); // => false
```

## License
Copyright (c) 2016 Martin Kolárik. Released under the MIT license.
