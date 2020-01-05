/*!
 * jetee-requirejs 1.0  简单易用加精简
 * 功能仿requirejs2.3.6  可以先用它做站，功能不够就用原版更换

 * Author: jetee www.ma863.com
 * Update: 2020-01-01
 *
 */
(function(root){
	var debug=true,
		context = {
		topModule:[], //存储require函数调用生成的顶层模块对象名。　　自定义的_@$1  _@$2   有几次require就是几
		modules:{}, //存储所有的模块。使用模块名作为key，模块对象作为value　　
		waiting:[], //等待加载完成的模块
		loaded:[] //加载好的模块   (加载好是指模块所在的文件加载成功)
	},
	config = {
		paths:{},
		shim:{}
	},
	cfg={},
	jsSuffixRegExp = /\.js$/,
	requireCounter = 1,
	head,
	isBrowser = !!(typeof window !== 'undefined' && typeof navigator !== 'undefined' && window.document),
	log=console.log;

	function unique(arr){//去重
		var tmp = new Array();
		for(var i in arr){
			if(tmp.indexOf(arr[i])==-1){
				tmp.push(arr[i]);
			}
		}
		return tmp;
	};

	function extend(destination, source) {
		for (var property in source) {
			destination[property] = source[property];
		}
		return destination;
	};

	function each(obj,callback){
		var value,
			i = 0,
			length = obj.length;

		for(;i<length;i++){
			value = callback.call(obj[i],obj[i],i);
			if(value === false){
				break;
			}
		}    
	};
	function eachReverse(ary, func) {
		if (ary) {
			var i;
			for (i = ary.length - 1; i > -1; i -= 1) {
				if (ary[i] && func(ary[i], i, ary)) {
					break;
				}
			}
		}
	}
	function scripts() {
		return document.getElementsByTagName('script');
	}
	function isUrl(url){
		if(url.substr(0,7).toLowerCase() == "http://" || url.substr(0,8).toLowerCase() == "https://"){
			return 1;
		}
		return 0;
	}
	//加载单个模块   也就是 require(['moudle1','moudle2'])的其中一个modle
	function req(name,callback){//‘moudle1’,加载完成运行callback
		var deps = config.shim[name];
		deps = deps ? deps.deps : [];

		//依赖加载完成后   才加载该模块的脚本 
		function notifymess(){
			if(iscomplete(deps)){
				var element = createScript(name);				
				element && (element.onload = element.onreadystatechange = function () {
					onscriptLoaded.call(this,callback);
				});
			}
		};

		//如果存在依赖则把创建script标签的任务交给依赖去完成
		if(deps.length > 0){
			each(deps,function(name){
				req(name, notifymess);
			});
		}else{
			notifymess();  
		}
   
	};

	function onscriptLoaded(callback){//处理加载完js 
		if (!this.readyState || /loaded|complete/.test(this.readyState)) {
			this.onload = this.onreadystatechange = null;
			var name = this.getAttribute('data-requiremodule');//从属性取require(['jquery'])中的　jquery  this为创建的script对象
			context.waiting.splice(context.waiting.indexOf(name),1);//从正在加载中删除
			context.loaded.push(name);
			typeof callback === 'function' && callback();
			if(context.modules.hasOwnProperty('temp')){
				var tempModule = context.modules['temp'];				
				tempModule.moduleName = name;//修改临时模块名				
				createModule(tempModule);//生成新模块				
				delete context.modules['temp'];//删除临时模块
			}
		   
			//script标签全部加载完成，准备依次执行define的回调函数
			completeLoad();
		}

	};
	//创建模块放入context.modules
	function createModule(options){
		var name = options.moduleName,
			module = context.modules[name] = {};
		module.moduleName = name;
		module.deps = [];
		module.callback = function(){};
		module.args = [];
		extend(module,options);
	};

	function createScript(name){
		name = trimJs(name);
		//正在加载 与加载完成
		if(context.waiting.indexOf(name) !==-1 || context.loaded.indexOf(name) !== -1) return false;
		context.waiting.push(name);
		var node=createNode();
		var path=(config.paths[name] || name) + '.js';
		if(cfg.baseUrl && !isUrl(path)){
			path=cfg.baseUrl+path;//加基址
		}
		node.src=path;
		node.setAttribute('data-requiremodule', name);
		head.appendChild(node);
		return node;
	};

	function createNode() {
		var node = document.createElement('script');
		node.type ='text/javascript';
		node.charset = 'utf-8';
		node.async = true;
		return node;
	};


	function trimJs(name){//去后缀'.js'
		return name.replace(jsSuffixRegExp, '');
	};

	function trimArrJs(deps){
		var newDeps = [];
		each(deps,function(name){
			newDeps.push(trimJs(name));
		});
		return newDeps;
	};
	//如果加载完成  context.loaded就存在
	function iscomplete(deps){
		for (var i = 0; i < deps.length; i++) {
			if (context.loaded.indexOf(trimJs(deps[i])) == -1) {
				return false;
				break;
			}
		}
		return true;
	};
	//运行require或是define中的 function
	function exec(module) {
		var deps = module.deps;　　//当前模块的依赖数组    
		var args = module.args;　　//当前模块的回调函数参数    
		for (var i = 0, len = deps.length; i < len; i++) { //遍历
			var dep = context.modules[deps[i]];
			if(dep){
				args[i] = exec(dep); //递归得到依赖模块返回值作为对应参数  
			}
		}
		return module.callback.apply(module, args); // 调用回调函数，传递给依赖模块对应的参数。
	}

	function completeLoad(){//js加载完成　运行
		if(!context.waiting.length){
			while(context.topModule.length){
				var name = context.topModule.shift(),
					topModule = context.modules[name]; //找到顶层模块。
				exec(topModule);
			}
		}
	};
	//require(['module1','module2',3,4],callback);
	require = root.require = function(dep,callback) {
		if (typeof dep == 'function'){
			callback = dep;
			dep = [];
		}else if (typeof callback != 'function'){
			callback = function(){};
			dep = dep || [];
		}
	
		var name = '_@$' + (requireCounter++);//name=_@$1  _@$2
		context.topModule.push(name);
		//剔除数组重复项
		dep = unique(dep);
		//context.modules._@$1 = {moduleName:"_@$1",deps:["a","b"],callback:null,callbackReturn:null,args:null}
		createModule({//就是放入　context.modules
			moduleName:name,
			deps:trimArrJs(dep),//格式化数组去掉.js  ［'jquery.js','vue.js'］变成['jquery','vue']
			callback:callback
		});
		//dep=['module1','module2']  加载多个模块
		each(dep,function(name){
			req(name);//载入
		});
		//如果dep是空数组直接执行callback
		completeLoad();

	};

	var define = root.define = function(name,dep,callback){
		if(typeof name === 'object'){
			callback = dep;
			dep = name;
			name = 'temp';
		}else if(typeof name === 'function'){
			callback = name;
			dep = [];
			name = 'temp';
		}else if (typeof dep == 'function') {
			callback = dep;
			dep = [];
		}else if (typeof callback != 'function') {
			callback = function () {};
			dep = dep || [];
		}
		
		//剔除数组重复项
		dep = unique(dep);

		//创建一个临时模块，在onload完成后修改它
		createModule({
			moduleName:name,
			deps:trimArrJs(dep),
			callback:callback
		});

		//遍历依赖，如果配置文件中不存在则创建script标签
		each(dep,function(name){
			var element = createScript(name);
			element && (element.onload = element.onreadystatechange = onscriptLoaded);
		});
	};


	require.config = function(options){
		config = extend(config,options);
	};


	if (isBrowser) {
		head = document.getElementsByTagName('head')[0] || document.documentElement;
		//处理 data-main  入口
		eachReverse(scripts(), function (script) {
			if (!head) {
				head = script.parentNode;
			}
			var dataMain = script.getAttribute('data-main');
			if (!cfg.baseUrl) {
				cfg.baseUrl = dataMain.split('/');
				cfg.baseUrl.pop();
				cfg.baseUrl = cfg.baseUrl.length ? cfg.baseUrl.join('/')  + '/' : './';
			}
			if (dataMain) {
				var node=createNode();
				node.src=dataMain+ '.js';
				head.appendChild(node);
			}
		});
	}
	define.amd = {
		jQuery: true
	};
})(this);/*!
 * jetee-jquery 1.0  简单易用加精简
 * 功能仿jquery1.12.4  可以先用它做站，功能不够就用原版更换

 * Author: jetee www.ma863.com
 * Update: 2020-01-01
 *
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define("jquery",[],factory) :
  (global = global || self, global.$ =global.jQuery = factory());
}(this, function () {
	var $,
	// Support: Android<4.1, IE<9
	// Make sure we trim BOM and NBSP
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;

	$ = function (selector, context) {
		return new $.fn.init(selector, context);//$()绕道init对象取自己原型方法   $.fn=$.prototype  $.fn.init.prototype=$.fn
	};
	$.fn = $.prototype={
		init : function  (selector, context) {
			var nodeList = [];
			if (typeof (selector) == 'string') {
				nodeList = (context || document).querySelectorAll(selector);
			} else if (selector instanceof Node) {
				nodeList[0] = selector;
			} else if (selector instanceof NodeList || selector instanceof Array) {
				nodeList = selector;
			}
			this.length = nodeList.length;
			for (var i = 0; i < this.length; i += 1) {
				this[i] = nodeList[i];
			}
			return this;
		},
		log: function( obj ) {
			console.log(obj);
		},
		type: function( obj ) {
			return typeof obj;
		},
		isFunction: function( obj ) {
			return $.type( obj ) === "function";
		},
		isArray: Array.isArray || function( obj ) {
			return $.type( obj ) === "array";
		},
		isWindow: function( obj ) {
			return obj != null && obj == obj.window;
		},
		isPlainObject: function( obj ) {//纯粹对象 即是通过{}或者new Object()方式创建的对象　　删除多余代码自己确保是纯粹对象
			// 必须是Object.
			//　确保不是　DOM nodes and window objects
			if ( !obj || $.type( obj ) !== "object" || obj.nodeType || $.isWindow( obj ) ) {
				return false;
			}
			return true;
		},
		// Support: Android<4.1, IE<9
		trim : function ( text ) {
			return text == null ?
				"" :
				( text + "" ).replace( rtrim, "" );
		},
		each : function  (cb_fun, need_ret) {
			var res = [];
			for (var i = 0; i < this.length; i++) {
				res[i] = cb_fun.call(this[i]);
			}
			if (need_ret) {
				if (res.length == 1) {
					res = res[0];
				}
				return res;
			}
			return this;
		},
		eq : function  () {
			var nodeList = [];
			for (var i = 0; i < arguments.length; i++) {
				nodeList[i] = this[arguments[i]];
			}
			return $(nodeList);
		},
		first : function  () {
			return this.eq(0);
		},
		last : function  () {
			return this.eq(this.length - 1);
		},
		find : function  (str) {
			var nodeList = [];
			var res = this.each(function () {
				return this.querySelectorAll(str);
			}, 1);
			if (res instanceof Array) {
				for (var i = 0; i < res.length; i++) {
					for (var j = 0; j < res[i].length; j++) {
						nodeList.push(res[i][j]);
					}
				}
			} else {
				nodeList = res;
			}
			return $(nodeList);
		},
		parent : function  () {
			return $(this.each(function () {
				return this.parentNode;
			}, 1));
		},
		hide : function  () {
			return this.each(function () {
				this.style.display = "none";
			});
		},
		show : function  () {
			return this.each(function () {
				this.style.display = "";
			});
		},
		text : function  (str) {
			if (str != undefined) {
				return this.each(function () {
					this.innerText = str;
				});
			} else {
				return this.each(function () {
					return this.innerText;
				}, 1);
			}
		},
		html : function  (str) {
			if (str != undefined) {
				return this.each(function () {
					this.innerHTML = str;
				});
			} else {
				return this.each(function () {
					return this.innerHTML;
				}, 1);
			}
		},
		outHtml : function  (str) {
			if (str != undefined) {
				return this.each(function () {
					this.outerHTML = str;
				});
			} else {
				return this.each(function () {
					return this.outerHTML;
				}, 1);
			}
		},
		val : function  (str) {
			if (str != undefined) {
				return this.each(function () {
					this.value = str;
				});
			} else {
				return this.each(function () {
					return this.value;
				}, 1);
			}
		},
		css : function  (key, value, important) {
			if (value != undefined) {
				return this.each(function () {
					this.style.setProperty(key, value, important);
				});
			} else {
				return this.each(function () {
					return this.style.getPropertyValue(key);
				}, 1);
			}
		},
		attr : function  (key, value) {
			if (value != undefined) {
				return this.each(function () {
					this.setAttribute(key, value);
				});
			} else {
				return this.each(function () {
					return this.getAttribute(key);
				}, 1);
			}
		},
		removeAttr : function  (key) {
			return this.each(function () {
				this.removeAttribute(key);
			});
		},
		remove : function  () {
			return this.each(function () {
				this.remove();
			});
		},
		append : function  (str) {
			return this.each(function () {
				this.insertAdjacentHTML('beforeend', str);
			});
		},
		prepend : function  (str) {
			return this.each(function () {
				this.insertAdjacentHTML('afterbegin', str);
			});
		},
		hasClass : function  (str) {
			return this.each(function () {
				return this.classList.contains(str);
			}, 1);
		},
		addClass : function  (str) {
			return this.each(function () {
				return this.classList.add(str);
			});
		},
		removeClass : function  (str) {
			return this.each(function () {
				return this.classList.remove(str);
			});
		},
		click : function  (f) { //click改为监听事件，
			if (typeof (f) == "function") { //重载，若含有参数就注册事件，无参数就触发事件
				this.each(function () {
					this.addEventListener("click", f);
				});
			} else {
				this.each(function () {
					var event = document.createEvent('HTMLEvents');
					event.initEvent("click", true, true);
					this.dispatchEvent(event);
				});
			}
		},
		tag : function  (tag) {
			var dom = document.createElement(tag);
			this[0] = dom;
			return this;
		},
		dom : function  (str) {
			var dom = document.createElement('p');
			dom.innerHTML = str;
			this[0] = dom.childNodes[0];
			return this;
		},
		parents : function  () {
			return $(this.each(function () {
				return $.dir(this, "parentNode");
			}, 1));
		},
		dir : function  (elem, dir, until) { // 这个函数很精髓，短短几行代码，支持遍历祖先、所有兄长、所有兄弟！
			var matched = [],
				cur = elem[dir];
			while (cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery(cur).is(until))) {
				if (cur.nodeType === 1) {
					matched.push(cur);
				}
				cur = cur[dir];
			}
			return matched;
		}

	};
	$.fn.init.prototype = $.fn;

	$.extend = $.fn.extend = function() {
		var src, copyIsArray, copy, name, options, clone,
			target = arguments[ 0 ] || {},
			i = 1,//从哪里开始合并
			length = arguments.length,
			deep = false;

		// 是否深度复制
		if ( typeof target === "boolean" ) {
			deep = target;

			// skip the boolean and the target
			target = arguments[ i ] || {};
			i++;
		}

		// Handle case when target is a string or something (possible in deep copy)
		if ( typeof target !== "object" && !$.isFunction( target ) ) {
			target = {};
		}

		// extend $ itself 只有一个参数
		if ( i === length ) {
			target = this;
			i--;
		}

		for ( ; i < length; i++ ) {
			// Only deal with non-null/undefined values
			if ( ( options = arguments[ i ] ) != null ) {
				// Extend the base object
				for ( name in options ) {
					src = target[ name ];
					copy = options[ name ];

					// Prevent never-ending loop
					if ( target === copy ) {
						continue;
					}

					// Recurse if we're merging plain objects or arrays
					if ( deep && copy && ( $.isPlainObject( copy ) ||
						( copyIsArray = $.isArray( copy ) ) ) ) {

						if ( copyIsArray ) {
							copyIsArray = false;
							clone = src && $.isArray( src ) ? src : [];

						} else {
							clone = src && $.isPlainObject( src ) ? src : {};
						}

						// Never move original objects, clone them
						target[ name ] = $.extend( deep, clone, copy );

					} else if ( copy !== undefined ) {
						target[ name ] = copy;
					}
				}
			}
		}

		// Return the modified object
		return target;
	};

	$.ajax = function (options) {
		function empty() {}

		function obj2Url(obj) {
			var arr = [];
			for (var i in obj) {
				arr.push(encodeURI(i) + '=' + encodeURI(obj[i]));
			}
			return arr.join('&').replace(/%20/g, '+');
		}
		var opt = {
			url: '', //请求地址
			sync: true, //true，异步 | false　同步，会锁死浏览器，并且open方法会报浏览器警告
			method: 'GET', //提交方法
			data: null, //提交数据
			dataType: 'json', //返回数据类型  支持 json text html xml不支持 script 
			username: null, //账号
			password: null, //密码
			success: empty, //成功返回回调
			error: empty, //错误信息回调
			timeout: 10000 //请求超时ms
		};
		$.extend(opt,options);//合并对象到opt,有的替换 没定义的不换
		//Object.assign(opt, options); //es6标准
		var abortTimeout = null;
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (xhr.readyState == 4) {
				xhr.onreadystatechange = empty;
				clearTimeout(abortTimeout);
				if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
					var result = xhr.responseText;
					try {
						if (opt.dataType == 'json') {
							result = result.replace(' ', '') == '' ? null : JSON.parse(result);
						}
					} catch (e) {
						opt.error(e, xhr);
						xhr.abort();
					}
					opt.success(result, xhr);
				} else if (0 == xhr.status) {
					opt.error("跨域请求失败", xhr);
				} else {
					opt.error(xhr.statusText, xhr);
				}
			}
		};
		var data = opt.data ? obj2Url(opt.data) : opt.data;
		opt.method = opt.method.toUpperCase();
		if (opt.method == 'GET') {
			opt.url += (opt.url.indexOf('?') == -1 ? '?' : '&') + data;
		}
		xhr.open(opt.method, opt.url, opt.sync, opt.username, opt.password);
		if (opt.method == 'POST') {
			xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		}
		if (opt.timeout > 0) {
			abortTimeout = setTimeout(function () {
				xhr.onreadystatechange = empty;
				xhr.abort();
				opt.error('网络请求超时', xhr);
			}, opt.timeout);
		}
		xhr.send(data);
	};
	$(["get","post"]).each(function() {
		var method=this;
		$[method] = function( url, data, callback, type ) {
			// 如果没有data 左移出
			if (typeof(data)=='function') {
				type = type || callback;
				callback = data;
				data = undefined;
			}
			$.ajax({
				method: method,
				dataType:type,
				url:url,
				data:data,
				success:callback,
				error:function(data,xhr){
				   alert(data);
				}
			});
		};
	});
	return $;
}));