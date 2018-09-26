var should = require("should");
var CachedSource = require("../lib/CachedSource");
var OriginalSource = require('../lib/OriginalSource');

describe("CachedSource", function() {
	it("should return the correct size for binary files", function() {
		var source = new OriginalSource(new ArrayBuffer(256), "file.wasm");
		var cachedSource = new CachedSource(source);

		cachedSource.size().should.be.eql(256);
	});
});
