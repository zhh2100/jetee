define("a",function(require,exports){
	var c = require("c");
	//var d = require("d");
	exports.list = function(){
		//console.log(d.n());
		return [1,2,3];
	}
	exports.list2 = function(){
		//console.log(d.n());
		//console.log(d.show());
		return [4,2,3];
	}

	exports.getC = function(){
		return c.x();
	}
});


define("c",function(require,exports){
	var a = require("a");
	exports.x  = function(){
		return a.list2();
	}
});
define("f",function(require,exports){
	
	exports.x  = function(){
		return "f";
	}
});