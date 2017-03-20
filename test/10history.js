"use strict";

var assert = require("assert");
var exec   = require("./helper").exec;
var fs     = require("fs");
var rfs    = require("./helper").rfs;

describe("history", function() {
	describe("maxFiles", function() {
		before(function(done) {
			var self = this;
			exec(done, "rm -rf *log *txt ; echo none > test.log.txt ; echo -n test >> test.log.txt", function() {
				self.rfs = rfs(setTimeout.bind(null, done, 50), { size: "10B", maxFiles: 3 });
				self.rfs.on("removed", function(name) { self.removed = name; });
				self.rfs.write("test\n");
				self.rfs.write("test\n");
				setTimeout(function() {
					self.rfs.write("test\n");
					self.rfs.write("test\n");
					setTimeout(function() {
						self.rfs.write("test\n");
						self.rfs.write("test\n");
						setTimeout(function() {
							self.rfs.write("test\n");
							self.rfs.write("test\n");
							setTimeout(function() {
								self.rfs.end("test\n");
							}, 50);
						}, 50);
					}, 50);
				}, 50);
			});
		});

		it("no error", function() {
			assert.ifError(this.rfs.ev.err);
		});

		it("warning", function() {
			assert.equal(this.rfs.ev.warn, "File 'test' contained in history is not a regular file");
		});

		it("4 rotation", function() {
			assert.equal(this.rfs.ev.rotation, 4);
		});

		it("4 rotated", function() {
			assert.equal(this.rfs.ev.rotated.length, 4);
		});

		it("file content", function() {
			assert.equal(fs.readFileSync("test.log"), "test\n");
		});

		it("removed", function() {
			assert.equal(this.removed, "1-test.log");
		});

		it("removed first rotated file", function() {
			assert.equal(fs.existsSync("1-test.log"), false);
		});

		it("second rotated file content", function() {
			assert.equal(fs.readFileSync("2-test.log"), "test\ntest\n");
		});

		it("third rotated file content", function() {
			assert.equal(fs.readFileSync("3-test.log"), "test\ntest\n");
		});

		it("forth rotated file content", function() {
			assert.equal(fs.readFileSync("4-test.log"), "test\ntest\n");
		});
	});

	describe("maxSize", function() {
		before(function(done) {
			var self = this;
			exec(done, "rm -rf *log", function() {
				self.rfs = rfs(setTimeout.bind(null, done, 50), { size: "10B", maxSize: "35B", history: "history.log" });
				self.rfs.write("test\n");
				self.rfs.write("test\n");
				setTimeout(function() {
					self.rfs.write("test\n");
					self.rfs.write("test\n");
					setTimeout(function() {
						self.rfs.write("test\n");
						self.rfs.write("test\n");
						setTimeout(function() {
							self.rfs.write("test\n");
							self.rfs.write("test\n");
							setTimeout(function() {
								self.rfs.end("test\n");
							}, 50);
						}, 50);
					}, 50);
				}, 50);
			});
		});

		it("no error", function() {
			assert.ifError(this.rfs.ev.err);
		});

		it("4 rotation", function() {
			assert.equal(this.rfs.ev.rotation, 4);
		});

		it("4 rotated", function() {
			assert.equal(this.rfs.ev.rotated.length, 4);
		});

		it("file content", function() {
			assert.equal(fs.readFileSync("test.log"), "test\n");
		});

		it("removed first rotated file", function() {
			assert.equal(fs.existsSync("1-test.log"), false);
		});

		it("second rotated file content", function() {
			assert.equal(fs.readFileSync("2-test.log"), "test\ntest\n");
		});

		it("third rotated file content", function() {
			assert.equal(fs.readFileSync("3-test.log"), "test\ntest\n");
		});

		it("forth rotated file content", function() {
			assert.equal(fs.readFileSync("4-test.log"), "test\ntest\n");
		});
	});
});