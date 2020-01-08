/*!
 * 简单易用加精简,功能仿,先用它做站，功能不够再原版替换
 * https://github.com/qqtxt/jetee
 * Released under the MIT license 
 * Jetee(requirejs,jquery,bootstrap) version 1.0.2
 * build: 2020-1-8 14:31:11
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

require([ "jquery" ], function(jQuery) {
    +function($) {
        "use strict";
        function transitionEnd() {
            var el = document.createElement("bootstrap");
            var transEndEventNames = {
                WebkitTransition: "webkitTransitionEnd",
                MozTransition: "transitionend",
                OTransition: "oTransitionEnd otransitionend",
                transition: "transitionend"
            };
            for (var name in transEndEventNames) {
                if (el.style[name] !== undefined) {
                    return {
                        end: transEndEventNames[name]
                    };
                }
            }
            return false;
        }
        $.fn.emulateTransitionEnd = function(duration) {
            var called = false;
            var $el = this;
            $(this).one("bsTransitionEnd", function() {
                called = true;
            });
            var callback = function() {
                if (!called) $($el).trigger($.support.transition.end);
            };
            setTimeout(callback, duration);
            return this;
        };
        $(function() {
            $.support.transition = transitionEnd();
            if (!$.support.transition) return;
            $.event.special.bsTransitionEnd = {
                bindType: $.support.transition.end,
                delegateType: $.support.transition.end,
                handle: function(e) {
                    if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments);
                }
            };
        });
    }(jQuery);
    +function($) {
        "use strict";
        var Button = function(element, options) {
            this.$element = $(element);
            this.options = $.extend({}, Button.DEFAULTS, options);
            this.isLoading = false;
        };
        Button.VERSION = "3.4.1";
        Button.DEFAULTS = {
            loadingText: "loading..."
        };
        Button.prototype.setState = function(state) {
            var d = "disabled";
            var $el = this.$element;
            var val = $el.is("input") ? "val" : "html";
            var data = $el.data();
            state += "Text";
            if (data.resetText == null) $el.data("resetText", $el[val]());
            setTimeout($.proxy(function() {
                $el[val](data[state] == null ? this.options[state] : data[state]);
                if (state == "loadingText") {
                    this.isLoading = true;
                    $el.addClass(d).attr(d, d).prop(d, true);
                } else if (this.isLoading) {
                    this.isLoading = false;
                    $el.removeClass(d).removeAttr(d).prop(d, false);
                }
            }, this), 0);
        };
        Button.prototype.toggle = function() {
            var changed = true;
            var $parent = this.$element.closest('[data-toggle="buttons"]');
            if ($parent.length) {
                var $input = this.$element.find("input");
                if ($input.prop("type") == "radio") {
                    if ($input.prop("checked")) changed = false;
                    $parent.find(".active").removeClass("active");
                    this.$element.addClass("active");
                } else if ($input.prop("type") == "checkbox") {
                    if ($input.prop("checked") !== this.$element.hasClass("active")) changed = false;
                    this.$element.toggleClass("active");
                }
                $input.prop("checked", this.$element.hasClass("active"));
                if (changed) $input.trigger("change");
            } else {
                this.$element.attr("aria-pressed", !this.$element.hasClass("active"));
                this.$element.toggleClass("active");
            }
        };
        function Plugin(option) {
            return this.each(function() {
                var $this = $(this);
                var data = $this.data("bs.button");
                var options = typeof option == "object" && option;
                if (!data) $this.data("bs.button", data = new Button(this, options));
                if (option == "toggle") data.toggle(); else if (option) data.setState(option);
            });
        }
        var old = $.fn.button;
        $.fn.button = Plugin;
        $.fn.button.Constructor = Button;
        $.fn.button.noConflict = function() {
            $.fn.button = old;
            return this;
        };
        $(document).on("click.bs.button.data-api", '[data-toggle^="button"]', function(e) {
            var $btn = $(e.target).closest(".btn");
            Plugin.call($btn, "toggle");
            if (!$(e.target).is('input[type="radio"], input[type="checkbox"]')) {
                e.preventDefault();
                if ($btn.is("input,button")) $btn.trigger("focus"); else $btn.find("input:visible,button:visible").first().trigger("focus");
            }
        }).on("focus.bs.button.data-api blur.bs.button.data-api", '[data-toggle^="button"]', function(e) {
            $(e.target).closest(".btn").toggleClass("focus", /^focus(in)?$/.test(e.type));
        });
    }(jQuery);
    +function($) {
        "use strict";
        var Carousel = function(element, options) {
            this.$element = $(element);
            this.$indicators = this.$element.find(".carousel-indicators");
            this.options = options;
            this.paused = null;
            this.sliding = null;
            this.interval = null;
            this.$active = null;
            this.$items = null;
            this.options.keyboard && this.$element.on("keydown.bs.carousel", $.proxy(this.keydown, this));
            this.options.pause == "hover" && !("ontouchstart" in document.documentElement) && this.$element.on("mouseenter.bs.carousel", $.proxy(this.pause, this)).on("mouseleave.bs.carousel", $.proxy(this.cycle, this));
        };
        Carousel.VERSION = "3.4.1";
        Carousel.TRANSITION_DURATION = 600;
        Carousel.DEFAULTS = {
            interval: 5e3,
            pause: "hover",
            wrap: true,
            keyboard: true
        };
        Carousel.prototype.keydown = function(e) {
            if (/input|textarea/i.test(e.target.tagName)) return;
            switch (e.which) {
              case 37:
                this.prev();
                break;

              case 39:
                this.next();
                break;

              default:
                return;
            }
            e.preventDefault();
        };
        Carousel.prototype.cycle = function(e) {
            e || (this.paused = false);
            this.interval && clearInterval(this.interval);
            this.options.interval && !this.paused && (this.interval = setInterval($.proxy(this.next, this), this.options.interval));
            return this;
        };
        Carousel.prototype.getItemIndex = function(item) {
            this.$items = item.parent().children(".item");
            return this.$items.index(item || this.$active);
        };
        Carousel.prototype.getItemForDirection = function(direction, active) {
            var activeIndex = this.getItemIndex(active);
            var willWrap = direction == "prev" && activeIndex === 0 || direction == "next" && activeIndex == this.$items.length - 1;
            if (willWrap && !this.options.wrap) return active;
            var delta = direction == "prev" ? -1 : 1;
            var itemIndex = (activeIndex + delta) % this.$items.length;
            return this.$items.eq(itemIndex);
        };
        Carousel.prototype.to = function(pos) {
            var that = this;
            var activeIndex = this.getItemIndex(this.$active = this.$element.find(".item.active"));
            if (pos > this.$items.length - 1 || pos < 0) return;
            if (this.sliding) return this.$element.one("slid.bs.carousel", function() {
                that.to(pos);
            });
            if (activeIndex == pos) return this.pause().cycle();
            return this.slide(pos > activeIndex ? "next" : "prev", this.$items.eq(pos));
        };
        Carousel.prototype.pause = function(e) {
            e || (this.paused = true);
            if (this.$element.find(".next, .prev").length && $.support.transition) {
                this.$element.trigger($.support.transition.end);
                this.cycle(true);
            }
            this.interval = clearInterval(this.interval);
            return this;
        };
        Carousel.prototype.next = function() {
            if (this.sliding) return;
            return this.slide("next");
        };
        Carousel.prototype.prev = function() {
            if (this.sliding) return;
            return this.slide("prev");
        };
        Carousel.prototype.slide = function(type, next) {
            var $active = this.$element.find(".item.active");
            var $next = next || this.getItemForDirection(type, $active);
            var isCycling = this.interval;
            var direction = type == "next" ? "left" : "right";
            var that = this;
            if ($next.hasClass("active")) return this.sliding = false;
            var relatedTarget = $next[0];
            var slideEvent = $.Event("slide.bs.carousel", {
                relatedTarget: relatedTarget,
                direction: direction
            });
            this.$element.trigger(slideEvent);
            if (slideEvent.isDefaultPrevented()) return;
            this.sliding = true;
            isCycling && this.pause();
            if (this.$indicators.length) {
                this.$indicators.find(".active").removeClass("active");
                var $nextIndicator = $(this.$indicators.children()[this.getItemIndex($next)]);
                $nextIndicator && $nextIndicator.addClass("active");
            }
            var slidEvent = $.Event("slid.bs.carousel", {
                relatedTarget: relatedTarget,
                direction: direction
            });
            if ($.support.transition && this.$element.hasClass("slide")) {
                $next.addClass(type);
                if (typeof $next === "object" && $next.length) {
                    $next[0].offsetWidth;
                }
                $active.addClass(direction);
                $next.addClass(direction);
                $active.one("bsTransitionEnd", function() {
                    $next.removeClass([ type, direction ].join(" ")).addClass("active");
                    $active.removeClass([ "active", direction ].join(" "));
                    that.sliding = false;
                    setTimeout(function() {
                        that.$element.trigger(slidEvent);
                    }, 0);
                }).emulateTransitionEnd(Carousel.TRANSITION_DURATION);
            } else {
                $active.removeClass("active");
                $next.addClass("active");
                this.sliding = false;
                this.$element.trigger(slidEvent);
            }
            isCycling && this.cycle();
            return this;
        };
        function Plugin(option) {
            return this.each(function() {
                var $this = $(this);
                var data = $this.data("bs.carousel");
                var options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == "object" && option);
                var action = typeof option == "string" ? option : options.slide;
                if (!data) $this.data("bs.carousel", data = new Carousel(this, options));
                if (typeof option == "number") data.to(option); else if (action) data[action](); else if (options.interval) data.pause().cycle();
            });
        }
        var old = $.fn.carousel;
        $.fn.carousel = Plugin;
        $.fn.carousel.Constructor = Carousel;
        $.fn.carousel.noConflict = function() {
            $.fn.carousel = old;
            return this;
        };
        var clickHandler = function(e) {
            var $this = $(this);
            var href = $this.attr("href");
            if (href) {
                href = href.replace(/.*(?=#[^\s]+$)/, "");
            }
            var target = $this.attr("data-target") || href;
            var $target = $(document).find(target);
            if (!$target.hasClass("carousel")) return;
            var options = $.extend({}, $target.data(), $this.data());
            var slideIndex = $this.attr("data-slide-to");
            if (slideIndex) options.interval = false;
            Plugin.call($target, options);
            if (slideIndex) {
                $target.data("bs.carousel").to(slideIndex);
            }
            e.preventDefault();
        };
        $(document).on("click.bs.carousel.data-api", "[data-slide]", clickHandler).on("click.bs.carousel.data-api", "[data-slide-to]", clickHandler);
        $(window).on("load", function() {
            $('[data-ride="carousel"]').each(function() {
                var $carousel = $(this);
                Plugin.call($carousel, $carousel.data());
            });
        });
    }(jQuery);
    +function($) {
        "use strict";
        var Collapse = function(element, options) {
            this.$element = $(element);
            this.options = $.extend({}, Collapse.DEFAULTS, options);
            this.$trigger = $('[data-toggle="collapse"][href="#' + element.id + '"],' + '[data-toggle="collapse"][data-target="#' + element.id + '"]');
            this.transitioning = null;
            if (this.options.parent) {
                this.$parent = this.getParent();
            } else {
                this.addAriaAndCollapsedClass(this.$element, this.$trigger);
            }
            if (this.options.toggle) this.toggle();
        };
        Collapse.VERSION = "3.4.1";
        Collapse.TRANSITION_DURATION = 350;
        Collapse.DEFAULTS = {
            toggle: true
        };
        Collapse.prototype.dimension = function() {
            var hasWidth = this.$element.hasClass("width");
            return hasWidth ? "width" : "height";
        };
        Collapse.prototype.show = function() {
            if (this.transitioning || this.$element.hasClass("in")) return;
            var activesData;
            var actives = this.$parent && this.$parent.children(".panel").children(".in, .collapsing");
            if (actives && actives.length) {
                activesData = actives.data("bs.collapse");
                if (activesData && activesData.transitioning) return;
            }
            var startEvent = $.Event("show.bs.collapse");
            this.$element.trigger(startEvent);
            if (startEvent.isDefaultPrevented()) return;
            if (actives && actives.length) {
                Plugin.call(actives, "hide");
                activesData || actives.data("bs.collapse", null);
            }
            var dimension = this.dimension();
            this.$element.removeClass("collapse").addClass("collapsing")[dimension](0).attr("aria-expanded", true);
            this.$trigger.removeClass("collapsed").attr("aria-expanded", true);
            this.transitioning = 1;
            var complete = function() {
                this.$element.removeClass("collapsing").addClass("collapse in")[dimension]("");
                this.transitioning = 0;
                this.$element.trigger("shown.bs.collapse");
            };
            if (!$.support.transition) return complete.call(this);
            var scrollSize = $.camelCase([ "scroll", dimension ].join("-"));
            this.$element.one("bsTransitionEnd", $.proxy(complete, this)).emulateTransitionEnd(Collapse.TRANSITION_DURATION)[dimension](this.$element[0][scrollSize]);
        };
        Collapse.prototype.hide = function() {
            if (this.transitioning || !this.$element.hasClass("in")) return;
            var startEvent = $.Event("hide.bs.collapse");
            this.$element.trigger(startEvent);
            if (startEvent.isDefaultPrevented()) return;
            var dimension = this.dimension();
            this.$element[dimension](this.$element[dimension]())[0].offsetHeight;
            this.$element.addClass("collapsing").removeClass("collapse in").attr("aria-expanded", false);
            this.$trigger.addClass("collapsed").attr("aria-expanded", false);
            this.transitioning = 1;
            var complete = function() {
                this.transitioning = 0;
                this.$element.removeClass("collapsing").addClass("collapse").trigger("hidden.bs.collapse");
            };
            if (!$.support.transition) return complete.call(this);
            this.$element[dimension](0).one("bsTransitionEnd", $.proxy(complete, this)).emulateTransitionEnd(Collapse.TRANSITION_DURATION);
        };
        Collapse.prototype.toggle = function() {
            this[this.$element.hasClass("in") ? "hide" : "show"]();
        };
        Collapse.prototype.getParent = function() {
            return $(document).find(this.options.parent).find('[data-toggle="collapse"][data-parent="' + this.options.parent + '"]').each($.proxy(function(i, element) {
                var $element = $(element);
                this.addAriaAndCollapsedClass(getTargetFromTrigger($element), $element);
            }, this)).end();
        };
        Collapse.prototype.addAriaAndCollapsedClass = function($element, $trigger) {
            var isOpen = $element.hasClass("in");
            $element.attr("aria-expanded", isOpen);
            $trigger.toggleClass("collapsed", !isOpen).attr("aria-expanded", isOpen);
        };
        function getTargetFromTrigger($trigger) {
            var href;
            var target = $trigger.attr("data-target") || (href = $trigger.attr("href")) && href.replace(/.*(?=#[^\s]+$)/, "");
            return $(document).find(target);
        }
        function Plugin(option) {
            return this.each(function() {
                var $this = $(this);
                var data = $this.data("bs.collapse");
                var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == "object" && option);
                if (!data && options.toggle && /show|hide/.test(option)) options.toggle = false;
                if (!data) $this.data("bs.collapse", data = new Collapse(this, options));
                if (typeof option == "string") data[option]();
            });
        }
        var old = $.fn.collapse;
        $.fn.collapse = Plugin;
        $.fn.collapse.Constructor = Collapse;
        $.fn.collapse.noConflict = function() {
            $.fn.collapse = old;
            return this;
        };
        $(document).on("click.bs.collapse.data-api", '[data-toggle="collapse"]', function(e) {
            var $this = $(this);
            if (!$this.attr("data-target")) e.preventDefault();
            var $target = getTargetFromTrigger($this);
            var data = $target.data("bs.collapse");
            var option = data ? "toggle" : $this.data();
            Plugin.call($target, option);
        });
    }(jQuery);
    +function($) {
        "use strict";
        var Modal = function(element, options) {
            this.options = options;
            this.$body = $(document.body);
            this.$element = $(element);
            this.$dialog = this.$element.find(".modal-dialog");
            this.$backdrop = null;
            this.isShown = null;
            this.originalBodyPad = null;
            this.scrollbarWidth = 0;
            this.ignoreBackdropClick = false;
            this.fixedContent = ".navbar-fixed-top, .navbar-fixed-bottom";
            if (this.options.remote) {
                this.$element.find(".modal-content").load(this.options.remote, $.proxy(function() {
                    this.$element.trigger("loaded.bs.modal");
                }, this));
            }
        };
        Modal.VERSION = "3.4.1";
        Modal.TRANSITION_DURATION = 300;
        Modal.BACKDROP_TRANSITION_DURATION = 150;
        Modal.DEFAULTS = {
            backdrop: true,
            keyboard: true,
            show: true
        };
        Modal.prototype.toggle = function(_relatedTarget) {
            return this.isShown ? this.hide() : this.show(_relatedTarget);
        };
        Modal.prototype.show = function(_relatedTarget) {
            var that = this;
            var e = $.Event("show.bs.modal", {
                relatedTarget: _relatedTarget
            });
            this.$element.trigger(e);
            if (this.isShown || e.isDefaultPrevented()) return;
            this.isShown = true;
            this.checkScrollbar();
            this.setScrollbar();
            this.$body.addClass("modal-open");
            this.escape();
            this.resize();
            this.$element.on("click.dismiss.bs.modal", '[data-dismiss="modal"]', $.proxy(this.hide, this));
            this.$dialog.on("mousedown.dismiss.bs.modal", function() {
                that.$element.one("mouseup.dismiss.bs.modal", function(e) {
                    if ($(e.target).is(that.$element)) that.ignoreBackdropClick = true;
                });
            });
            this.backdrop(function() {
                var transition = $.support.transition && that.$element.hasClass("fade");
                if (!that.$element.parent().length) {
                    that.$element.appendTo(that.$body);
                }
                that.$element.show().scrollTop(0);
                that.adjustDialog();
                if (transition) {
                    that.$element[0].offsetWidth;
                }
                that.$element.addClass("in");
                that.enforceFocus();
                var e = $.Event("shown.bs.modal", {
                    relatedTarget: _relatedTarget
                });
                transition ? that.$dialog.one("bsTransitionEnd", function() {
                    that.$element.trigger("focus").trigger(e);
                }).emulateTransitionEnd(Modal.TRANSITION_DURATION) : that.$element.trigger("focus").trigger(e);
            });
        };
        Modal.prototype.hide = function(e) {
            if (e) e.preventDefault();
            e = $.Event("hide.bs.modal");
            this.$element.trigger(e);
            if (!this.isShown || e.isDefaultPrevented()) return;
            this.isShown = false;
            this.escape();
            this.resize();
            $(document).off("focusin.bs.modal");
            this.$element.removeClass("in").off("click.dismiss.bs.modal").off("mouseup.dismiss.bs.modal");
            this.$dialog.off("mousedown.dismiss.bs.modal");
            $.support.transition && this.$element.hasClass("fade") ? this.$element.one("bsTransitionEnd", $.proxy(this.hideModal, this)).emulateTransitionEnd(Modal.TRANSITION_DURATION) : this.hideModal();
        };
        Modal.prototype.enforceFocus = function() {
            $(document).off("focusin.bs.modal").on("focusin.bs.modal", $.proxy(function(e) {
                if (document !== e.target && this.$element[0] !== e.target && !this.$element.has(e.target).length) {
                    this.$element.trigger("focus");
                }
            }, this));
        };
        Modal.prototype.escape = function() {
            if (this.isShown && this.options.keyboard) {
                this.$element.on("keydown.dismiss.bs.modal", $.proxy(function(e) {
                    e.which == 27 && this.hide();
                }, this));
            } else if (!this.isShown) {
                this.$element.off("keydown.dismiss.bs.modal");
            }
        };
        Modal.prototype.resize = function() {
            if (this.isShown) {
                $(window).on("resize.bs.modal", $.proxy(this.handleUpdate, this));
            } else {
                $(window).off("resize.bs.modal");
            }
        };
        Modal.prototype.hideModal = function() {
            var that = this;
            this.$element.hide();
            this.backdrop(function() {
                that.$body.removeClass("modal-open");
                that.resetAdjustments();
                that.resetScrollbar();
                that.$element.trigger("hidden.bs.modal");
            });
        };
        Modal.prototype.removeBackdrop = function() {
            this.$backdrop && this.$backdrop.remove();
            this.$backdrop = null;
        };
        Modal.prototype.backdrop = function(callback) {
            var that = this;
            var animate = this.$element.hasClass("fade") ? "fade" : "";
            if (this.isShown && this.options.backdrop) {
                var doAnimate = $.support.transition && animate;
                this.$backdrop = $(document.createElement("div")).addClass("modal-backdrop " + animate).appendTo(this.$body);
                this.$element.on("click.dismiss.bs.modal", $.proxy(function(e) {
                    if (this.ignoreBackdropClick) {
                        this.ignoreBackdropClick = false;
                        return;
                    }
                    if (e.target !== e.currentTarget) return;
                    this.options.backdrop == "static" ? this.$element[0].focus() : this.hide();
                }, this));
                if (doAnimate) this.$backdrop[0].offsetWidth;
                this.$backdrop.addClass("in");
                if (!callback) return;
                doAnimate ? this.$backdrop.one("bsTransitionEnd", callback).emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) : callback();
            } else if (!this.isShown && this.$backdrop) {
                this.$backdrop.removeClass("in");
                var callbackRemove = function() {
                    that.removeBackdrop();
                    callback && callback();
                };
                $.support.transition && this.$element.hasClass("fade") ? this.$backdrop.one("bsTransitionEnd", callbackRemove).emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) : callbackRemove();
            } else if (callback) {
                callback();
            }
        };
        Modal.prototype.handleUpdate = function() {
            this.adjustDialog();
        };
        Modal.prototype.adjustDialog = function() {
            var modalIsOverflowing = this.$element[0].scrollHeight > document.documentElement.clientHeight;
            this.$element.css({
                paddingLeft: !this.bodyIsOverflowing && modalIsOverflowing ? this.scrollbarWidth : "",
                paddingRight: this.bodyIsOverflowing && !modalIsOverflowing ? this.scrollbarWidth : ""
            });
        };
        Modal.prototype.resetAdjustments = function() {
            this.$element.css({
                paddingLeft: "",
                paddingRight: ""
            });
        };
        Modal.prototype.checkScrollbar = function() {
            var fullWindowWidth = window.innerWidth;
            if (!fullWindowWidth) {
                var documentElementRect = document.documentElement.getBoundingClientRect();
                fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left);
            }
            this.bodyIsOverflowing = document.body.clientWidth < fullWindowWidth;
            this.scrollbarWidth = this.measureScrollbar();
        };
        Modal.prototype.setScrollbar = function() {
            var bodyPad = parseInt(this.$body.css("padding-right") || 0, 10);
            this.originalBodyPad = document.body.style.paddingRight || "";
            var scrollbarWidth = this.scrollbarWidth;
            if (this.bodyIsOverflowing) {
                this.$body.css("padding-right", bodyPad + scrollbarWidth);
                $(this.fixedContent).each(function(index, element) {
                    var actualPadding = element.style.paddingRight;
                    var calculatedPadding = $(element).css("padding-right");
                    $(element).data("padding-right", actualPadding).css("padding-right", parseFloat(calculatedPadding) + scrollbarWidth + "px");
                });
            }
        };
        Modal.prototype.resetScrollbar = function() {
            this.$body.css("padding-right", this.originalBodyPad);
            $(this.fixedContent).each(function(index, element) {
                var padding = $(element).data("padding-right");
                $(element).removeData("padding-right");
                element.style.paddingRight = padding ? padding : "";
            });
        };
        Modal.prototype.measureScrollbar = function() {
            var scrollDiv = document.createElement("div");
            scrollDiv.className = "modal-scrollbar-measure";
            this.$body.append(scrollDiv);
            var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
            this.$body[0].removeChild(scrollDiv);
            return scrollbarWidth;
        };
        function Plugin(option, _relatedTarget) {
            return this.each(function() {
                var $this = $(this);
                var data = $this.data("bs.modal");
                var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == "object" && option);
                if (!data) $this.data("bs.modal", data = new Modal(this, options));
                if (typeof option == "string") data[option](_relatedTarget); else if (options.show) data.show(_relatedTarget);
            });
        }
        var old = $.fn.modal;
        $.fn.modal = Plugin;
        $.fn.modal.Constructor = Modal;
        $.fn.modal.noConflict = function() {
            $.fn.modal = old;
            return this;
        };
        $(document).on("click.bs.modal.data-api", '[data-toggle="modal"]', function(e) {
            var $this = $(this);
            var href = $this.attr("href");
            var target = $this.attr("data-target") || href && href.replace(/.*(?=#[^\s]+$)/, "");
            var $target = $(document).find(target);
            var option = $target.data("bs.modal") ? "toggle" : $.extend({
                remote: !/#/.test(href) && href
            }, $target.data(), $this.data());
            if ($this.is("a")) e.preventDefault();
            $target.one("show.bs.modal", function(showEvent) {
                if (showEvent.isDefaultPrevented()) return;
                $target.one("hidden.bs.modal", function() {
                    $this.is(":visible") && $this.trigger("focus");
                });
            });
            Plugin.call($target, option, this);
        });
    }(jQuery);
    +function($) {
        "use strict";
        function ScrollSpy(element, options) {
            this.$body = $(document.body);
            this.$scrollElement = $(element).is(document.body) ? $(window) : $(element);
            this.options = $.extend({}, ScrollSpy.DEFAULTS, options);
            this.selector = (this.options.target || "") + " .nav li > a";
            this.offsets = [];
            this.targets = [];
            this.activeTarget = null;
            this.scrollHeight = 0;
            this.$scrollElement.on("scroll.bs.scrollspy", $.proxy(this.process, this));
            this.refresh();
            this.process();
        }
        ScrollSpy.VERSION = "3.4.1";
        ScrollSpy.DEFAULTS = {
            offset: 10
        };
        ScrollSpy.prototype.getScrollHeight = function() {
            return this.$scrollElement[0].scrollHeight || Math.max(this.$body[0].scrollHeight, document.documentElement.scrollHeight);
        };
        ScrollSpy.prototype.refresh = function() {
            var that = this;
            var offsetMethod = "offset";
            var offsetBase = 0;
            this.offsets = [];
            this.targets = [];
            this.scrollHeight = this.getScrollHeight();
            if (!$.isWindow(this.$scrollElement[0])) {
                offsetMethod = "position";
                offsetBase = this.$scrollElement.scrollTop();
            }
            this.$body.find(this.selector).map(function() {
                var $el = $(this);
                var href = $el.data("target") || $el.attr("href");
                var $href = /^#./.test(href) && $(href);
                return $href && $href.length && $href.is(":visible") && [ [ $href[offsetMethod]().top + offsetBase, href ] ] || null;
            }).sort(function(a, b) {
                return a[0] - b[0];
            }).each(function() {
                that.offsets.push(this[0]);
                that.targets.push(this[1]);
            });
        };
        ScrollSpy.prototype.process = function() {
            var scrollTop = this.$scrollElement.scrollTop() + this.options.offset;
            var scrollHeight = this.getScrollHeight();
            var maxScroll = this.options.offset + scrollHeight - this.$scrollElement.height();
            var offsets = this.offsets;
            var targets = this.targets;
            var activeTarget = this.activeTarget;
            var i;
            if (this.scrollHeight != scrollHeight) {
                this.refresh();
            }
            if (scrollTop >= maxScroll) {
                return activeTarget != (i = targets[targets.length - 1]) && this.activate(i);
            }
            if (activeTarget && scrollTop < offsets[0]) {
                this.activeTarget = null;
                return this.clear();
            }
            for (i = offsets.length; i--; ) {
                activeTarget != targets[i] && scrollTop >= offsets[i] && (offsets[i + 1] === undefined || scrollTop < offsets[i + 1]) && this.activate(targets[i]);
            }
        };
        ScrollSpy.prototype.activate = function(target) {
            this.activeTarget = target;
            this.clear();
            var selector = this.selector + '[data-target="' + target + '"],' + this.selector + '[href="' + target + '"]';
            var active = $(selector).parents("li").addClass("active");
            if (active.parent(".dropdown-menu").length) {
                active = active.closest("li.dropdown").addClass("active");
            }
            active.trigger("activate.bs.scrollspy");
        };
        ScrollSpy.prototype.clear = function() {
            $(this.selector).parentsUntil(this.options.target, ".active").removeClass("active");
        };
        function Plugin(option) {
            return this.each(function() {
                var $this = $(this);
                var data = $this.data("bs.scrollspy");
                var options = typeof option == "object" && option;
                if (!data) $this.data("bs.scrollspy", data = new ScrollSpy(this, options));
                if (typeof option == "string") data[option]();
            });
        }
        var old = $.fn.scrollspy;
        $.fn.scrollspy = Plugin;
        $.fn.scrollspy.Constructor = ScrollSpy;
        $.fn.scrollspy.noConflict = function() {
            $.fn.scrollspy = old;
            return this;
        };
        $(window).on("load.bs.scrollspy.data-api", function() {
            $('[data-spy="scroll"]').each(function() {
                var $spy = $(this);
                Plugin.call($spy, $spy.data());
            });
        });
    }(jQuery);
    +function($) {
        "use strict";
        var Affix = function(element, options) {
            this.options = $.extend({}, Affix.DEFAULTS, options);
            var target = this.options.target === Affix.DEFAULTS.target ? $(this.options.target) : $(document).find(this.options.target);
            this.$target = target.on("scroll.bs.affix.data-api", $.proxy(this.checkPosition, this)).on("click.bs.affix.data-api", $.proxy(this.checkPositionWithEventLoop, this));
            this.$element = $(element);
            this.affixed = null;
            this.unpin = null;
            this.pinnedOffset = null;
            this.checkPosition();
        };
        Affix.VERSION = "3.4.1";
        Affix.RESET = "affix affix-top affix-bottom";
        Affix.DEFAULTS = {
            offset: 0,
            target: window
        };
        Affix.prototype.getState = function(scrollHeight, height, offsetTop, offsetBottom) {
            var scrollTop = this.$target.scrollTop();
            var position = this.$element.offset();
            var targetHeight = this.$target.height();
            if (offsetTop != null && this.affixed == "top") return scrollTop < offsetTop ? "top" : false;
            if (this.affixed == "bottom") {
                if (offsetTop != null) return scrollTop + this.unpin <= position.top ? false : "bottom";
                return scrollTop + targetHeight <= scrollHeight - offsetBottom ? false : "bottom";
            }
            var initializing = this.affixed == null;
            var colliderTop = initializing ? scrollTop : position.top;
            var colliderHeight = initializing ? targetHeight : height;
            if (offsetTop != null && scrollTop <= offsetTop) return "top";
            if (offsetBottom != null && colliderTop + colliderHeight >= scrollHeight - offsetBottom) return "bottom";
            return false;
        };
        Affix.prototype.getPinnedOffset = function() {
            if (this.pinnedOffset) return this.pinnedOffset;
            this.$element.removeClass(Affix.RESET).addClass("affix");
            var scrollTop = this.$target.scrollTop();
            var position = this.$element.offset();
            return this.pinnedOffset = position.top - scrollTop;
        };
        Affix.prototype.checkPositionWithEventLoop = function() {
            setTimeout($.proxy(this.checkPosition, this), 1);
        };
        Affix.prototype.checkPosition = function() {
            if (!this.$element.is(":visible")) return;
            var height = this.$element.height();
            var offset = this.options.offset;
            var offsetTop = offset.top;
            var offsetBottom = offset.bottom;
            var scrollHeight = Math.max($(document).height(), $(document.body).height());
            if (typeof offset != "object") offsetBottom = offsetTop = offset;
            if (typeof offsetTop == "function") offsetTop = offset.top(this.$element);
            if (typeof offsetBottom == "function") offsetBottom = offset.bottom(this.$element);
            var affix = this.getState(scrollHeight, height, offsetTop, offsetBottom);
            if (this.affixed != affix) {
                if (this.unpin != null) this.$element.css("top", "");
                var affixType = "affix" + (affix ? "-" + affix : "");
                var e = $.Event(affixType + ".bs.affix");
                this.$element.trigger(e);
                if (e.isDefaultPrevented()) return;
                this.affixed = affix;
                this.unpin = affix == "bottom" ? this.getPinnedOffset() : null;
                this.$element.removeClass(Affix.RESET).addClass(affixType).trigger(affixType.replace("affix", "affixed") + ".bs.affix");
            }
            if (affix == "bottom") {
                this.$element.offset({
                    top: scrollHeight - height - offsetBottom
                });
            }
        };
        function Plugin(option) {
            return this.each(function() {
                var $this = $(this);
                var data = $this.data("bs.affix");
                var options = typeof option == "object" && option;
                if (!data) $this.data("bs.affix", data = new Affix(this, options));
                if (typeof option == "string") data[option]();
            });
        }
        var old = $.fn.affix;
        $.fn.affix = Plugin;
        $.fn.affix.Constructor = Affix;
        $.fn.affix.noConflict = function() {
            $.fn.affix = old;
            return this;
        };
        $(window).on("load", function() {
            $('[data-spy="affix"]').each(function() {
                var $spy = $(this);
                var data = $spy.data();
                data.offset = data.offset || {};
                if (data.offsetBottom != null) data.offset.bottom = data.offsetBottom;
                if (data.offsetTop != null) data.offset.top = data.offsetTop;
                Plugin.call($spy, data);
            });
        });
    }(jQuery);
});