var minimatch = require('minimatch');
var micromatch = require('micromatch');
var gpp = require('../lib/index');

[ { dot: true, makeRe: true }, { dot: true, makeRe: false }, { dot: true, nobrace: true } ].forEach(function (options) {
	describe(JSON.stringify(options), function () {
		describe('minimatch', function () {
			require('./tests')('minimatch', function (path, pattern) {
				var normalRegExp = minimatch.makeRe(pattern, options);
				var gppRegExp = new RegExp('^(?:\\/$|(?:' + gpp(pattern, options).map(function (p) {
					return minimatch.makeRe(p, options).toString().slice(1, -1);
				}).join('|') + '))$');

				if (!normalRegExp) {
					if (!pattern) {
						return true;
					}

					throw new Error('normalRegExp = false (pattern: ' + pattern + ')');
				}

				var normalResult = normalRegExp.test(path);
				var gppResult = gppRegExp.test(path);

				if (normalResult && !gppResult) {
					throw new Error('normal = true and gpp = false (' + normalRegExp + ', ' + gppRegExp + ')');
				}

				return gppResult;
			}, options);
		});

		describe('micromatch', function () {
			require('./tests')('micromatch', function (path, pattern) {
				var normalRegExp = micromatch.makeRe(pattern, options);
				var gppRegExp = new RegExp('^(?:\\/$|(?:' + gpp(pattern, options).map(function (p) {
					return micromatch.makeRe(p, options).toString().slice(1, -1);
				}).join('|') + '))$');

				if (!normalRegExp) {
					throw new Error('normalRegExp = false (pattern: ' + pattern + ')');
				}

				var normalResult = normalRegExp.test(path);
				var gppResult = gppRegExp.test(path);

				if (normalResult && !gppResult) {
					throw new Error('normal = true and gpp = false (' + normalRegExp + ', ' + gppRegExp + ')');
				}

				return gppResult;
			}, options);
		});
	});
});

