/*!
 * 简单易用加精简,功能仿,先用它做站，功能不够再原版替换
 * https://github.com/qqtxt/jetee
 * Released under the MIT license 
 * Jetee(requirejs,jquery,bootstrap) version 1.0.2
 * build: 2020-1-7 22:11:13
 * http://www.ma863.com 
 */

(function(root) {
    var debug = true, context = {
        topModule: [],
        modules: {},
        waiting: [],
        loaded: []
    }, config = {
        paths: {},
        shim: {}
    }, cfg = {}, jsSuffixRegExp = /\.js$/, requireCounter = 1, head, isBrowser = !!(typeof window !== "undefined" && typeof navigator !== "undefined" && window.document), log = console.log;
    function unique(arr) {
        var tmp = new Array();
        for (var i in arr) {
            if (tmp.indexOf(arr[i]) == -1) {
                tmp.push(arr[i]);
            }
        }
        return tmp;
    }
    function extend(destination, source) {
        for (var property in source) {
            destination[property] = source[property];
        }
        return destination;
    }
    function each(obj, callback) {
        var value, i = 0, length = obj.length;
        for (;i < length; i++) {
            value = callback.call(obj[i], obj[i], i);
            if (value === false) {
                break;
            }
        }
    }
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
        return document.getElementsByTagName("script");
    }
    function isUrl(url) {
        if (url.substr(0, 7).toLowerCase() == "http://" || url.substr(0, 8).toLowerCase() == "https://") {
            return 1;
        }
        return 0;
    }
    function req(name, callback) {
        var deps = config.shim[name];
        deps = deps ? deps.deps : [];
        function notifymess() {
            if (iscomplete(deps)) {
                var element = createScript(name);
                element && (element.onload = element.onreadystatechange = function() {
                    onscriptLoaded.call(this, callback);
                });
            }
        }
        if (deps.length > 0) {
            each(deps, function(name) {
                req(name, notifymess);
            });
        } else {
            notifymess();
        }
    }
    function onscriptLoaded(callback) {
        if (!this.readyState || /loaded|complete/.test(this.readyState)) {
            this.onload = this.onreadystatechange = null;
            var name = this.getAttribute("data-requiremodule");
            context.waiting.splice(context.waiting.indexOf(name), 1);
            context.loaded.push(name);
            typeof callback === "function" && callback();
            if (context.modules.hasOwnProperty("temp")) {
                var tempModule = context.modules["temp"];
                tempModule.moduleName = name;
                createModule(tempModule);
                delete context.modules["temp"];
            }
            completeLoad();
        }
    }
    function createModule(options) {
        var name = options.moduleName, module = context.modules[name] = {};
        module.moduleName = name;
        module.deps = [];
        module.callback = function() {};
        module.args = [];
        extend(module, options);
    }
    function createScript(name) {
        name = trimJs(name);
        if (context.waiting.indexOf(name) !== -1 || context.loaded.indexOf(name) !== -1) return false;
        context.waiting.push(name);
        var node = createNode();
        var path = (config.paths[name] || name) + ".js";
        if (cfg.baseUrl && !isUrl(path)) {
            path = cfg.baseUrl + path;
        }
        node.src = path;
        node.setAttribute("data-requiremodule", name);
        head.appendChild(node);
        return node;
    }
    function createNode() {
        var node = document.createElement("script");
        node.type = "text/javascript";
        node.charset = "utf-8";
        node.async = true;
        return node;
    }
    function trimJs(name) {
        return name.replace(jsSuffixRegExp, "");
    }
    function trimArrJs(deps) {
        var newDeps = [];
        each(deps, function(name) {
            newDeps.push(trimJs(name));
        });
        return newDeps;
    }
    function iscomplete(deps) {
        for (var i = 0; i < deps.length; i++) {
            if (context.loaded.indexOf(trimJs(deps[i])) == -1) {
                return false;
                break;
            }
        }
        return true;
    }
    function exec(module) {
        var deps = module.deps;
        var args = module.args;
        for (var i = 0, len = deps.length; i < len; i++) {
            var dep = context.modules[deps[i]];
            if (dep) {
                args[i] = exec(dep);
            }
        }
        return module.callback.apply(module, args);
    }
    function completeLoad() {
        if (!context.waiting.length) {
            while (context.topModule.length) {
                var name = context.topModule.shift(), topModule = context.modules[name];
                exec(topModule);
            }
        }
    }
    require = root.require = function(dep, callback) {
        if (typeof dep == "function") {
            callback = dep;
            dep = [];
        } else if (typeof callback != "function") {
            callback = function() {};
            dep = dep || [];
        }
        var name = "_@$" + requireCounter++;
        context.topModule.push(name);
        dep = unique(dep);
        createModule({
            moduleName: name,
            deps: trimArrJs(dep),
            callback: callback
        });
        each(dep, function(name) {
            req(name);
        });
        completeLoad();
    };
    var define = root.define = function(name, dep, callback) {
        if (typeof name === "object") {
            callback = dep;
            dep = name;
            name = "temp";
        } else if (typeof name === "function") {
            callback = name;
            dep = [];
            name = "temp";
        } else if (typeof dep == "function") {
            callback = dep;
            dep = [];
        } else if (typeof callback != "function") {
            callback = function() {};
            dep = dep || [];
        }
        dep = unique(dep);
        createModule({
            moduleName: name,
            deps: trimArrJs(dep),
            callback: callback
        });
        each(dep, function(name) {
            var element = createScript(name);
            element && (element.onload = element.onreadystatechange = onscriptLoaded);
        });
    };
    require.config = function(options) {
        config = extend(config, options);
    };
    if (isBrowser) {
        head = document.getElementsByTagName("head")[0] || document.documentElement;
        eachReverse(scripts(), function(script) {
            if (!head) {
                head = script.parentNode;
            }
            var dataMain = script.getAttribute("data-main");
            if (!cfg.baseUrl) {
                cfg.baseUrl = dataMain.split("/");
                cfg.baseUrl.pop();
                cfg.baseUrl = cfg.baseUrl.length ? cfg.baseUrl.join("/") + "/" : "./";
            }
            if (dataMain) {
                var node = createNode();
                node.src = dataMain + ".js";
                head.appendChild(node);
            }
        });
    }
    define.amd = {
        jQuery: true
    };
})(this);

(function(global, factory) {
    typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define("jquery", [], factory) : (global = global || self, 
    global.$ = global.jQuery = factory());
})(this, function() {
    var $, rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
    $ = function(selector, context) {
        return new $.fn.init(selector, context);
    };
    $.fn = $.prototype = {
        init: function(selector, context) {
            var nodeList = [];
            if (typeof selector == "string") {
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
        log: function(obj) {
            console.log(obj);
        },
        type: function(obj) {
            return typeof obj;
        },
        isFunction: function(obj) {
            return $.type(obj) === "function";
        },
        isArray: Array.isArray || function(obj) {
            return $.type(obj) === "array";
        },
        isWindow: function(obj) {
            return obj != null && obj == obj.window;
        },
        isPlainObject: function(obj) {
            if (!obj || $.type(obj) !== "object" || obj.nodeType || $.isWindow(obj)) {
                return false;
            }
            return true;
        },
        trim: function(text) {
            return text == null ? "" : (text + "").replace(rtrim, "");
        },
        each: function(cb_fun, need_ret) {
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
        eq: function() {
            var nodeList = [];
            for (var i = 0; i < arguments.length; i++) {
                nodeList[i] = this[arguments[i]];
            }
            return $(nodeList);
        },
        first: function() {
            return this.eq(0);
        },
        last: function() {
            return this.eq(this.length - 1);
        },
        find: function(str) {
            var nodeList = [];
            var res = this.each(function() {
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
        parent: function() {
            return $(this.each(function() {
                return this.parentNode;
            }, 1));
        },
        hide: function() {
            return this.each(function() {
                this.style.display = "none";
            });
        },
        show: function() {
            return this.each(function() {
                this.style.display = "";
            });
        },
        text: function(str) {
            if (str != undefined) {
                return this.each(function() {
                    this.innerText = str;
                });
            } else {
                return this.each(function() {
                    return this.innerText;
                }, 1);
            }
        },
        html: function(str) {
            if (str != undefined) {
                return this.each(function() {
                    this.innerHTML = str;
                });
            } else {
                return this.each(function() {
                    return this.innerHTML;
                }, 1);
            }
        },
        outHtml: function(str) {
            if (str != undefined) {
                return this.each(function() {
                    this.outerHTML = str;
                });
            } else {
                return this.each(function() {
                    return this.outerHTML;
                }, 1);
            }
        },
        val: function(str) {
            if (str != undefined) {
                return this.each(function() {
                    this.value = str;
                });
            } else {
                return this.each(function() {
                    return this.value;
                }, 1);
            }
        },
        css: function(key, value, important) {
            if (value != undefined) {
                return this.each(function() {
                    this.style.setProperty(key, value, important);
                });
            } else {
                return this.each(function() {
                    return this.style.getPropertyValue(key);
                }, 1);
            }
        },
        attr: function(key, value) {
            if (value != undefined) {
                return this.each(function() {
                    this.setAttribute(key, value);
                });
            } else {
                return this.each(function() {
                    return this.getAttribute(key);
                }, 1);
            }
        },
        removeAttr: function(key) {
            return this.each(function() {
                this.removeAttribute(key);
            });
        },
        remove: function() {
            return this.each(function() {
                this.remove();
            });
        },
        append: function(str) {
            return this.each(function() {
                this.insertAdjacentHTML("beforeend", str);
            });
        },
        prepend: function(str) {
            return this.each(function() {
                this.insertAdjacentHTML("afterbegin", str);
            });
        },
        hasClass: function(str) {
            return this.each(function() {
                return this.classList.contains(str);
            }, 1);
        },
        addClass: function(str) {
            return this.each(function() {
                return this.classList.add(str);
            });
        },
        removeClass: function(str) {
            return this.each(function() {
                return this.classList.remove(str);
            });
        },
        click: function(f) {
            if (typeof f == "function") {
                this.each(function() {
                    this.addEventListener("click", f);
                });
            } else {
                this.each(function() {
                    var event = document.createEvent("HTMLEvents");
                    event.initEvent("click", true, true);
                    this.dispatchEvent(event);
                });
            }
        },
        tag: function(tag) {
            var dom = document.createElement(tag);
            this[0] = dom;
            return this;
        },
        dom: function(str) {
            var dom = document.createElement("p");
            dom.innerHTML = str;
            this[0] = dom.childNodes[0];
            return this;
        },
        parents: function() {
            return $(this.each(function() {
                return $.dir(this, "parentNode");
            }, 1));
        },
        dir: function(elem, dir, until) {
            var matched = [], cur = elem[dir];
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
        var src, copyIsArray, copy, name, options, clone, target = arguments[0] || {}, i = 1, length = arguments.length, deep = false;
        if (typeof target === "boolean") {
            deep = target;
            target = arguments[i] || {};
            i++;
        }
        if (typeof target !== "object" && !$.isFunction(target)) {
            target = {};
        }
        if (i === length) {
            target = this;
            i--;
        }
        for (;i < length; i++) {
            if ((options = arguments[i]) != null) {
                for (name in options) {
                    src = target[name];
                    copy = options[name];
                    if (target === copy) {
                        continue;
                    }
                    if (deep && copy && ($.isPlainObject(copy) || (copyIsArray = $.isArray(copy)))) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && $.isArray(src) ? src : [];
                        } else {
                            clone = src && $.isPlainObject(src) ? src : {};
                        }
                        target[name] = $.extend(deep, clone, copy);
                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }
        return target;
    };
    $.ajax = function(options) {
        function empty() {}
        function obj2Url(obj) {
            var arr = [];
            for (var i in obj) {
                arr.push(encodeURI(i) + "=" + encodeURI(obj[i]));
            }
            return arr.join("&").replace(/%20/g, "+");
        }
        var opt = {
            url: "",
            sync: true,
            method: "GET",
            data: null,
            dataType: "json",
            username: null,
            password: null,
            success: empty,
            error: empty,
            timeout: 1e4
        };
        $.extend(opt, options);
        var abortTimeout = null;
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                xhr.onreadystatechange = empty;
                clearTimeout(abortTimeout);
                if (xhr.status >= 200 && xhr.status < 300 || xhr.status == 304) {
                    var result = xhr.responseText;
                    try {
                        if (opt.dataType == "json") {
                            result = result.replace(" ", "") == "" ? null : JSON.parse(result);
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
        if (opt.method == "GET") {
            opt.url += (opt.url.indexOf("?") == -1 ? "?" : "&") + data;
        }
        xhr.open(opt.method, opt.url, opt.sync, opt.username, opt.password);
        if (opt.method == "POST") {
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        }
        if (opt.timeout > 0) {
            abortTimeout = setTimeout(function() {
                xhr.onreadystatechange = empty;
                xhr.abort();
                opt.error("网络请求超时", xhr);
            }, opt.timeout);
        }
        xhr.send(data);
    };
    $([ "get", "post" ]).each(function() {
        var method = this;
        $[method] = function(url, data, callback, type) {
            if (typeof data == "function") {
                type = type || callback;
                callback = data;
                data = undefined;
            }
            $.ajax({
                method: method,
                dataType: type,
                url: url,
                data: data,
                success: callback,
                error: function(data, xhr) {
                    alert(data);
                }
            });
        };
    });
    return $;
});