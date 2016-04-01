var expect = require('chai').expect;
var gpp = require('../lib/index');

module.exports = function (lib, mm, options) {
	it('should correctly deal with empty patterns', function () {
		expect(gpp('')).to.deep.equal([]);
	});

	describe('simple patterns', function () {
		it('should match', function () {
			expect(mm('', '')).to.be.true;
			expect(mm('/', '/')).to.be.true;
			expect(mm('.', '.')).to.be.true;
			expect(mm('a', 'a')).to.be.true;
			expect(mm('/a', '/a')).to.be.true;
			expect(mm('a', 'a/b')).to.be.true;
			expect(mm('/a', '/a/b')).to.be.true;
			expect(mm('a/b', 'a/b')).to.be.true;
			expect(mm('/a/b', '/a/b')).to.be.true;
			expect(mm('a/b', 'a/b/c')).to.be.true;
			expect(mm('/a/b', '/a/b/c')).to.be.true;
			expect(mm('/', '/a')).to.be.true;
		});

		it('should\'t match', function () {
			expect(mm('a', 'ab')).to.be.false;
			expect(mm('/a', '/ab')).to.be.false;
			expect(mm('a', 'ba')).to.be.false;
			expect(mm('/a', '/ba')).to.be.false;
			expect(mm('aa', 'a/b')).to.be.false;
			expect(mm('/aa', '/a/b')).to.be.false;
			expect(mm('aa/b', 'a/b')).to.be.false;
			expect(mm('/aa/b', '/a/b')).to.be.false;
			expect(mm('b', 'a/b')).to.be.false;
			expect(mm('/b', '/a/b')).to.be.false;
			expect(mm('b/a', 'a/b')).to.be.false;
			expect(mm('/b/a', '/a/b')).to.be.false;
			expect(mm('ab', 'a')).to.be.false;
			expect(mm('/ab', '/a')).to.be.false;
		});
	});

	describe('glob patterns', function () {
		it('should match', function () {
			expect(mm('a/b', 'a/b/*')).to.be.true;
			expect(mm('/a/b', '/a/b/*')).to.be.true;
			expect(mm('a/b', 'a/*')).to.be.true;
			expect(mm('/a/b', '/a/*')).to.be.true;
			expect(mm('a/b', 'a/*/c')).to.be.true;
			expect(mm('/a/b', '/a/*/c')).to.be.true;
			expect(mm('ab', '*')).to.be.true;
			expect(mm('/ab', '/*')).to.be.true;
			expect(mm('ab', '*/*')).to.be.true;
			expect(mm('/ab', '*/*')).to.be.true;
			expect(mm('ab', '??')).to.be.true;
			expect(mm('/ab', '/??')).to.be.true;
			expect(mm('ab', 'a?')).to.be.true;
			expect(mm('/ab', '/a?')).to.be.true;
			expect(mm('a/b', '?/?')).to.be.true;
			expect(mm('/a/b', '/?/?')).to.be.true;

			expect(mm('a/b/c.md', 'a/*/*.md')).to.be.true;
			expect(mm('a/b/c.md', '**/*.md')).to.be.true;
			expect(mm('c.md', '*.md')).to.be.true;

			expect(mm('a/b/c/xyz.md', 'a/b/c/*.md')).to.be.true;
			expect(mm('/a/b/c/xyz.md', '/a/b/c/*.md')).to.be.true;
			expect(mm('a/bb/c/xyz.md', 'a/*/c/*.md')).to.be.true;
			expect(mm('a/bb.bb/aa/bb/aa/c/xyz.md', 'a/**/c/*.md')).to.be.true;
			expect(mm('a/bb.bb/aa/b.b/aa/c/xyz.md', 'a/**/c/*.md')).to.be.true;
			expect(mm('a/bb.bb', 'a/**/c/*.md')).to.be.true;
		});

		it('should\'t match', function () {
			expect(mm('ab', '?')).to.be.false;
			expect(mm('/ab', '/?')).to.be.false;
			expect(mm('ab', '?/?')).to.be.false;
			expect(mm('/ab', '?/?')).to.be.false;
			expect(mm('ab', 'a/*')).to.be.false;
			expect(mm('/ab', '/a/*')).to.be.false;
			expect(mm('ab', './')).to.be.false;
			expect(mm('a/c.md', '*.md')).to.be.false;
		});
	});

	describe('dot files', function () {
		it('should match', function () {
			expect(mm('.c.md', '.*.md')).to.be.true;
			expect(mm('.a', '.a')).to.be.true;
			expect(mm('.ab', '.*')).to.be.true;
			expect(mm('.ab', '.*/a')).to.be.true;
			expect(mm('.ab', '.a*')).to.be.true;
			expect(mm('a/.c.md', 'a/.c.md')).to.be.true;
			expect(mm('a/b/c/.xyz.md', 'a/b/c/.*.md')).to.be.true;
			expect(mm('a/b', 'a/b/c/.*.md')).to.be.true;
			expect(mm('a/b/c/d.a.md', 'a/b/c/*.md')).to.be.true;
		});

		it('should\'t match', function () {
			expect(mm('a/.c.md', '*.md')).to.be.false;
			expect(mm('.c.md', '.c.')).to.be.false;
			// expect(mm('.c.md', '*.md')).to.be.false;
			expect(mm('.abc', '.a')).to.be.false;
			expect(mm('b/bb.bb/aa/b.b/aa/c/xyz.md', 'a/**/c/*.md')).to.be.false;
			expect(mm('aaa/bbb', 'aaa?bbb')).to.be.false;
		});
	});

	describe('braces', function () {
		if (!options.nobrace) {
			it('should match', function () {
				expect(mm('a', 'a/{b,c,d/e,f{1..5}{g,h}}/x/*.js')).to.be.true;
				expect(mm('a/b', 'a/{b,c,d/e,f{1..5}{g,h}}/x/*.js')).to.be.true;
				expect(mm('a/d', 'a/{b,c,d/e,f{1..5}{g,h}}/x/*.js')).to.be.true;
				expect(mm('a/d/e', 'a/{b,c,d/e,f{1..5}{g,h}}/x/*.js')).to.be.true;
				expect(mm('a/f1h', 'a/{b,c,d/e,f{1..5}{g,h}}/x/*.js')).to.be.true;
				expect(mm('a/f1h/x', 'a/{b,c,d/e,f{1..5}{g,h}}/x/*.js')).to.be.true;
				expect(mm('a/f1h/x/c.js', 'a/{b,c,d/e,f{1..5}{g,h}}/x/*.js')).to.be.true;
			});

			it('should\'t match', function () {
				expect(mm('b', 'a/{b,c,d/e,f{1..5}{g,h}}/x/*.js')).to.be.false;
				expect(mm('a/b/e', 'a/{b,c,d/e,f{1..5}{g,h}}/x/*.js')).to.be.false;
				expect(mm('a/d/x', 'a/{b,c,d/e,f{1..5}{g,h}}/x/*.js')).to.be.false;
				expect(mm('a/b/c', 'a/{b,c,d/e,f{1..5}{g,h}}/x/*.js')).to.be.false;
				expect(mm('a/f1', 'a/{b,c,d/e,f{1..5}{g,h}}/x/*.js')).to.be.false;
				expect(mm('a/e', 'a/{b,c,d/e,f{1..5}{g,h}}/x/*.js')).to.be.false;
			});
		} else {
			it('should match', function () {
				expect(mm('a/{b,c}', 'a/{b,c}')).to.be.true;
				expect(mm('a', 'a/{b,c}')).to.be.true;
			});

			it('should\'t match', function () {
				expect(mm('a/b', 'a/{b,c}')).to.be.false;
				expect(mm('a/c', 'a/{b,c}')).to.be.false;
			});
		}
	});

	describe('extglob', function () {
		it('should match', function () {
			expect(mm('a', 'a/b?(xx)c/d')).to.be.true;
			expect(mm('a/bc', 'a/b?(xx)c/d')).to.be.true;
			expect(mm('a/bxxc', 'a/b?(xx)c/d')).to.be.true;
			expect(mm('a/bxxc/d', 'a/b?(xx)c/d')).to.be.true;

			expect(mm('a/bc', 'a/b?(x/x)c/d')).to.be.true;
			expect(mm('a/bx/xc', 'a/b?(x/x)c/d')).to.be.true;
			expect(mm('a/yyy', 'a/b?(x/x)c/d')).to.be.true;

			expect(mm('a/bc', 'a/b?(x@(/x))c/d')).to.be.true;
			expect(mm('a/bx/xc', 'a/b?(x@(/x))c/d')).to.be.true;
			expect(mm('a/yyy', 'a/b?(x@(/x))c/d')).to.be.true;

			expect(mm('yyy', '?(x/x)')).to.be.true;
			expect(mm('/yyy', '/?(x/x)')).to.be.true;
			
			expect(mm('a/.bx/xc', 'a/.b?(x/x)c/d')).to.be.true;
			expect(mm('a/bc/.d', 'a/b?(x/x)c/.d')).to.be.true;
		});

		it('should\'t match', function () {
			expect(mm('a/b', 'a/b?(xx)c/d')).to.be.false;
			expect(mm('a/bxx', 'a/b?(xx)c/d')).to.be.false;

			expect(mm('b/yyy', 'a/b?(x/x)c/d')).to.be.false;
			expect(mm('b/bx/xc', 'a/b?(x/x)c/d')).to.be.false;
		});
	});

	// these are only supported by micromatch
	if (lib === 'micromatch') {
		describe('bracket expansion', function () {
			it('should match', function () {
				expect(mm('a', 'a/b[:alpha:]c/d')).to.be.true;
				expect(mm('a/bxc', 'a/b[:alpha:]c/d')).to.be.true;

				expect(mm('a', 'a[:punct:]b')).to.be.true;
				expect(mm('x', 'a[:punct:]b')).to.be.true;
				expect(mm('a', 'a/b[:punct:]c')).to.be.true;
				expect(mm('a/c', 'a/b[:punct:]c')).to.be.true;
				expect(mm('a/c/x/y', 'a/b[:punct:]c')).to.be.true;

				expect(mm('a', 'a[![:alpha:]]b')).to.be.true;
				expect(mm('x', 'a[![:alpha:]]b')).to.be.true;
				expect(mm('a', 'a/b[![:alpha:]]c')).to.be.true;
				expect(mm('a/c', 'a/b[![:alpha:]]c')).to.be.true;
				expect(mm('a/c/x/y', 'a/b[![:alpha:]]c')).to.be.true;

				expect(mm('a/c/.x', 'a/b[![:alpha:]]c/.x')).to.be.true;
				expect(mm('a/.0', 'a/.b[![:alpha:]]')).to.be.true;
			});

			it('should\'t match', function () {
				expect(mm('a', 'a[:alpha:]b')).to.be.false;
				expect(mm('x', 'a[:alpha:]b')).to.be.false;
				expect(mm('a/b', 'a/b[:alpha:]c')).to.be.false;
				expect(mm('a/c', 'a/b[:alpha:]c')).to.be.false;
				expect(mm('a/c/x/y', 'a/b[:alpha:]c')).to.be.false;

				expect(mm('a/bx', 'a/b[:alpha:]c/d')).to.be.false;
			});
		});

		describe('miscellaneous', function () {
			it('should pass', function () {
				expect(mm('aa/bb', 'aa/\\(bb\\)')).to.be.false;
				expect(mm('aa/(bb)', 'aa/\\(bb\\)')).to.be.true;

				expect(mm('aa/xx', 'aa/{xx')).to.be.false;
				expect(mm('aa/{xx', 'aa/{xx')).to.be.true;
			});
		});
	}

	describe('other tests from micromatch', function () {
		it('should return true when full file paths are matched:', function () {
			expect(mm('a/.b', 'a/.*')).to.be.true;
			expect(mm('a/.b', 'a/')).to.be.false;
			expect(mm('a/b/z/.a', 'b/z')).to.be.false;
			expect(mm('a/b/z/.a', 'a/*/z/.a')).to.be.true;
			expect(mm('a/b/c/d/e/z/c.md', 'a/**/z/*.md')).to.be.true;
			expect(mm('a/b/c/d/e/z/c.md', 'b/c/d/e')).to.be.false;
			expect(mm('a/b/c/d/e/j/n/p/o/z/c.md', 'a/**/j/**/z/*.md')).to.be.true;
			expect(mm('a/b/c/cd/bbb/xyz.md', 'a/b/**/c{d,e}/**/xyz.md')).to.be.true;
			expect(mm('a/b/baz/ce/fez/xyz.md', 'a/b/**/c{d,e}/**/xyz.md')).to.be.true;
		});

		it('should match path segments:', function () {
			expect(mm('aaa', 'aaa')).to.be.true;
			expect(mm('aaa', 'aa')).to.be.false;
			expect(mm('aaa/bbb', 'aaa/bbb')).to.be.true;
			expect(mm('aaa/bbb', 'aaa/*')).to.be.true;
			expect(mm('aaa/bba/ccc', 'aaa/*')).to.be.false;
			expect(mm('aaa', 'aaa/bbb/*')).to.be.true;
			expect(mm('aaa/bbb', 'aaa/bbb/*')).to.be.true;
			expect(mm('aaa/bba/ccc', 'aaa/**')).to.be.true;
			expect(mm('aaa/bba/ccc', 'aaa*')).to.be.false;
			expect(mm('aaa/bba/ccc', 'aaa**')).to.be.false;
			// expect(mm('aaa/bba/ccc', 'aaa/**ccc')).to.be.false;
			expect(mm('aaa/bba/ccc', 'aaa/*z')).to.be.false;
			expect(mm('aaa/bba/ccc', 'aaa/**z')).to.be.false;
			expect(mm('aaa', '*/*/*')).to.be.true;
			expect(mm('aaa/bbb', '*/*/*')).to.be.true;
			expect(mm('aaa/bba/ccc', '*/*/*')).to.be.true;
			expect(mm('aaa/bb/aa/rr', '*/*/*')).to.be.false;
			expect(mm('abzzzejklhi', '*j*i')).to.be.true;
			expect(mm('ab/zzz/ejkl/hi', '*/*z*/*/*i')).to.be.true;
			expect(mm('ab/zzz/ejkl/hi', '*/*jk*/*i')).to.be.false;
		});

		it('should return false when full file paths are not matched:', function () {
			expect(mm('a/b/z/.a', 'b/a')).to.be.false;
			expect(mm('a/.b', 'a/**/z/*.md')).to.be.true;
			// expect(mm('a/b/z/.a', 'a/**/z/*.a')).to.be.false;
			expect(mm('a/b/d/xyz.md', 'a/b/**/c{d,e}/**/xyz.md')).to.be.true;
			expect(mm('a/b/c/xyz.md', 'a/b/**/c{d,e}/**/xyz.md')).to.be.true;
		});

		it('should match paths with leading `./`:', function () {
			expect(mm('./.a', 'a/**/z/*.md')).to.be.false;
			expect(mm('./a/b/z/.a', 'a/**/z/.a')).to.be.false;
			expect(mm('./a/b/z/.a', './a/**/z/.a')).to.be.true;
			expect(mm('./a/b/c/d/e/z/c.md', 'a/**/z/*.md')).to.be.false;
			expect(mm('./a/b/c/d/e/z/c.md', './a/**/z/*.md')).to.be.true;
			expect(mm('./a/b/c/d/e/z/c.md', './a/**/j/**/z/*.md')).to.be.true;
			expect(mm('./a/b/c/j/e/z/c.md', './a/**/j/**/z/*.md')).to.be.true;
			expect(mm('./a/b/c/j/e/z/c.md', 'a/**/j/**/z/*.md')).to.be.false;
			expect(mm('./a/b/c/d/e/j/n/p/o/z/c.md', './a/**/j/**/z/*.md')).to.be.true;
			expect(mm('./a/b/c/j/e/z/c.txt', './a/**/j/**/z/*.md')).to.be.true;
			expect(mm('./a/b/d/xyz.md', './a/b/**/c{d,e}/**/xyz.md')).to.be.true;
			expect(mm('./a/b/c/xyz.md', './a/b/**/c{d,e}/**/xyz.md')).to.be.true;
			expect(mm('./a/b/c/cd/bbb/xyz.md', './a/b/**/c{d,e}/**/xyz.md')).to.be.true;
			expect(mm('./a/b/baz/ce/fez/xyz.md', './a/b/**/c{d,e}/**/xyz.md')).to.be.true;
		});
	});
};
