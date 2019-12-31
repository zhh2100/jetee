define("d", function(require, exports) {
	//var a = require("a");
	//d = require("d");
	exports.show = function() {
		dp = "a";
		var a = modulejs(dp, function() {
			console.log("e");
		dp = "b";
		var b = modulejs(dp, function() {
			console.log("g");

		})

		})

		return "d";
	}
});