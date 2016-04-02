import braces from 'braces';

/**
 * @param {string} pattern
 * @param {Object} options
 * @returns {string[]}
 */
module.exports = function (pattern, options = {}) {
	pattern = expand(pattern, options);

	let parsed = parse(pattern).p;
	let alternatives = getAlternatives(parsed.map(p => [ p ]));
	let patterns = {};

	// for each alternative, generate a list of all parents
	for (let i = 0; i < alternatives.length; i++) {
		let parts = alternatives[i].split('/');
		let j = 0;

		while (j++ < parts.length) {
			patterns[parts.slice(0, j).join('/')] = true;

			// if we get a double star, we can stop right here;
			// anything under the double star is going to mach anyway
			if (options.dot && parts[j - 1] === '**') {
				break;
			}
		}
	}

	return Object.keys(patterns).filter(x => !!x);
};

/**
 * @param {string} pattern
 * @param {{makeRe: boolean, nobrace: boolean, nobraces: boolean}} options
 * @returns {*}
 */
function expand (pattern, options) {
	if (!options.nobraces && !options.nobrace) {
		// naive/fast check for imbalanced characters
		let a = pattern.match(/[\{\(\[]/g);
		let b = pattern.match(/[\}\)\]]/g);

		// if imbalanced, don't optimize the pattern
		if ((a && !b) || (!a && b) || (a && b && (a.length !== b.length))) {
			options.makeRe = false;
		}

		let res = braces(pattern, options);

		// the parsing functions assumes alternatives are wrapped in ()
		return options.makeRe || res.length <= 1? res.join('|') : `(${res.join('|')})`;
	}

	return pattern;
}

/**
 * This functions takes a parsed pattern, and generates a list
 * of all possible matching paths.
 *
 * E.g., a pattern `aaa/{bbb,ccc,ddd/eee}/*.js`
 * would generate the following list:
 *
 *   - aaa/bbb/*.js
 *   - aaa/ccc/*.js
 *   - aaa/ddd/eee/*.js
 *
 * @param {Array<string|Array>} parsed
 * @param {string|Array} [base]
 * @returns {string[]}
 */
function getAlternatives (parsed, base = '') {
	let a = [];

	for (let i = 0; i < parsed.length; i++) {
		if (Array.isArray(parsed[i]) && parsed[i].length <= 1) {
			parsed[i] = parsed[i][0];
		}

		if (Array.isArray(parsed[i])) {
			a.push(getAlternatives(parsed[i], a.pop() || base));
		} else {
			if (Array.isArray(base)) {
				for (let j = 0; j < base.length; j++) {
					a.push(base[j] + parsed[i]);
				}
			} else {
				a.push(base + parsed[i]);
			}
		}
	}

	return a.reduce((c, x) => {
		if (Array.isArray(x)) {
			c.push(...x);
		} else {
			c.push(x);
		}

		return c;
	}, []);
}

/**
 * @param {string} pattern
 * @returns {{i: number, p: Array<string|Array>}}
 */
function parse (pattern) {
	let str = '';
	let parts = [ [] ];
	let extGlob = /[!@*+?]/;
	let extDepth = 0;
	let char, extStart;

	for (var i = 0; i < pattern.length; i++) {
		char = pattern[i];

		// escaped character
		if (char === '\\') {
			str += char + pattern[i + 1];
			i++;
		}

		// extended glob
		else if (extGlob.test(char) && pattern[i + 1] === '(') {
			// save the start position
			if (!extDepth) {
				extStart = str.length;
			}

			str += char + pattern[i + 1];
			extDepth++;
			i++;
		}

		// alternation
		else if (char === '|') {
			parts[parts.length - 1].push(str);
			parts.push([]);
			str = '';
		}

		// group start
		else if (char === '(') {
			if (str) {
				parts[parts.length - 1].push(str);
				str = '';
			}

			// recursively parse the group
			let r = parse(pattern.substr(i + 1));
			i += r.i + 1;

			parts.push(r.p);
			parts.push([]);
		}

		// group end
		else if (char === ')') {
			// exit if no group is open
			if (!extDepth--) {
				break;
			} else {
				str += char;

				// end of the outer-most extended glob group
				if (extDepth === 0 && extStart !== undefined) {
					let group = str.substr(extStart);

					// if the group contains a slash, we'll need to replace the whole
					// group with double star, otherwise we might get some false positives
					if (~group.indexOf('/')) {
						let index = str.substr(0, extStart - 1).lastIndexOf('/');
						str = str.substr(0, index !== -1 ? index : 0) + (index !== -1 ? '/**/' : '**/');
					}
				}
			}
		}

		// nothing special here
		else {
			str += char;
		}
	}

	if (str) {
		parts[parts.length - 1].push(str);
	}

	return {
		i: i,
		p: parts.filter(p => !!p.length).map((p) => {
			return p.map((pp) => {
				if (typeof pp === 'string') {
					// these character classes match slashes, and could generate
					// some false positives; we'll replace them with double star
					let ppIndex = pp.search(/\[!\[:(?:alnum|alpha|blank|digit|lower|upper|word|xdigit):]]|\[:punct:]/);

					if (~ppIndex) {
						let index = pp.substr(0, ppIndex - 1).lastIndexOf('/');
						pp = pp.substr(0, index !== -1 ? index : 0) + (index !== -1 ? '/**/' : '**/');
					}
				}

				return pp;
			});
		}),
	};
}
