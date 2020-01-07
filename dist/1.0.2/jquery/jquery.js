/*!
 * 简单易用加精简,功能仿,先用它做站，功能不够再原版替换
 * https://github.com/qqtxt/jetee
 * Released under the MIT license 
 * Jetee(requirejs,jquery,bootstrap) version 1.0.2
 * build: 2020-1-7 22:11:13
 * http://www.ma863.com 
 */

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