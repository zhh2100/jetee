/*!
 * 简单易用加精简,功能仿,先用它做站，功能不够再原版替换
 * https://github.com/qqtxt/jetee
 * Released under the MIT license 
 * Jetee(requirejs,jquery,bootstrap) version 1.0.2
 * build: 2020-1-8 14:08:22
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