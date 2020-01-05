/*!
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