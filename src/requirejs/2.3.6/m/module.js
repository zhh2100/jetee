/**
 * modulejs 1.0.1
 * author:kpxu\jimyan\wowowang
 * description:
 *   modulejs是一款比seajs、commonjs更加简洁、小巧的javascript模块化开发管理工具。
 *   思路更加精巧优雅，包含注释在内只有222行，同时也吸收了seajs和requirejs的一些优点
 * see：https://github.com/eccued/modulejs
 */
var modulejs, require, define;
(function(global) {
  var mod, cfg, _modulejs, _define, _require;
  var version = "1.0.1";
  var cfg = {
    alisa: {}, //模块的所在文件路径定义
    uris: {}, //加载文件列表 文件URL作为下标，true为已加载  false为未加载
    modules: {}, //模块列表 模块id作为下标
    callback: [], //入口回调方法的数组,所有modulejs所定义的方法都压入这个数组
    deps: {}, //记录运行中需要用到的依赖队列
    events: {}, //消息队列
  };
  //读取预配置
  _modulejs.config = config;
  config(global["_moduleConfig"] ? global._moduleConfig : cfg);
  global["_moduleConfig"] = cfg;
  //输出api
  require = _require; //引用
  define = _define; //定义
  modulejs = _modulejs; //入口
  //监听模块准备就绪的事件,并检查需要回调module的相关依赖是否全部就绪
  on("module_ready", function(id) {
    var init = cfg.callback;
    //倒序扫描所有的回调方法，检查要回调的module是否完成依赖加载
    for (var i = init.length - 1; i >= 0; i--) {
      //如果依赖满足则开始执行并删除回调
      if (init[i] && checkDeps(init[i].dependencies)) {
        var fc = init[i].factory;
        init.splice(i, 1);
        fc();
      }
    }
  });
  //模块定义api，有三个参数的时候第2个参数为依赖array，2个参数时，第2个为回调

  function _define(id, deps, factory) {
    //只有两个参数的时候，表示忽略了deps
    if (arguments.length === 2) {
      factory = deps;
      deps = null;
    }
    //保证deps一定是个array
    deps = isType("Array", deps) ? deps : (deps ? [deps] : []);
    //静态分析内容中的依赖
    if (isType("Function", factory)) {
      var _deps = parseDependencies(factory.toString());
    }
    //合并明文依赖和分析依赖
    for (var i = 0; i < _deps.length; i++) {
      (("," + deps + ",").indexOf("," + _deps[i] + ",") < 0) && deps.push(_deps[i]);
    }
    //构造一个model压入mod仓库
    var mod = new Module(id);
    mod.dependencies = deps || [];
    mod.factory = factory;
    //如果是_init的话，则放入回调模块数组，否则放入module序列
    if (id == "_init") {
      cfg.callback.push(mod);
    } else {
      //非_init则为普通模块，放入module序列
      cfg.modules[id] = mod;
    }
    //广播消息处理
    emit("module_ready", id);
  }
  //模块实例化或返回实例

  function _require(id) {
    var module = cfg.modules[id];
    // 如果module不存在则返回null
    if (!module) {
      return null
    }
    //如果module的exports不为null，则说明已经实例化了。
    if (module.exports) {
      return module.exports;
    }
    //走到这里则说明module还没有被实例化
    var factory = module.factory;
    //判断factory类型，function则执行，obj的直接返回
    //为function的时候将被直接执行，执行时将会接收到3个参数factory(require,exports,module)
    var exports = isType("Function", factory) ? factory(require, module.exports = {}, module) : factory;
    module.exports = exports === undefined ? module.exports : exports;
    return module.exports; //require一个模块的结果是返回该module的exports
  }
  //入口方法

  function _modulejs(deps, factory) {
    //把入口回调作为一个回调模块定义，当有多个入口的时候，都放在数组里面
    _define("_init", deps, factory);
    //加载入口回调模块的依赖方法
    //todo:这里随便加载那个都可以，后面可以考虑一下更好的顺序
    deps = cfg.callback.length > 0 ? cfg.callback[cfg.callback.length - 1].dependencies : [];
    for (var i = 0; i < deps.length; i++) {
      loadModule(deps[i]);
    }
  }
  //递归检查深层依赖环境是否完成

  function checkDeps(deps) {
    var list = cfg.deps;
    //构造当前依赖的递归依赖
    getDesps(deps, list);
    //依次检查依赖，发现有module遗失则返回flase。进入加载流程
    for (var i in list) {
      //检查该依赖模块是否遗失，如果遗失则中断检查去加载
      if (!cfg.modules[i]) {
        loadModule(i);
        return false;
      }
    }
    return true;
    //获取深层依赖关系队列

    function getDesps(deps, list) {
      for (var i = 0; i < deps.length; i++) {
        if (!list[deps[i]]) {
          list[deps[i]] = 1;
        }
        //防止循环依赖
        if (cfg.modules[deps[i]] && list[deps[i]] != 2) {
          list[deps[i]] = 2;
          getDesps(cfg.modules[deps[i]].dependencies, list);
        }
      }
    }
  }

  //配置方法

  function config(obj) {
    for (var k in obj) {
      cfg[k] = obj[k];
    }
    return mod;
  }
  //module原型

  function Module(id) {
    this.id = id;
    this.dependencies = [];
    this.exports = null;
    this.uri = "";
  }
  //加载模块的对应文件

  function loadModule(id) {
    //如果module存在则直接返回
    if (cfg.modules[id]) {
      emit("module_ready", id);
      return;
    }
    //查找module所对应的文件
    //todo:这里可以考虑支持把没有alisa配置的module按照某些规则生成一条url进行加载。
    var url = cfg.alisa[id] ? cfg.alisa[id] : "";
    if (!url) {
      emit("module_loss_alisa", id);
      return;
    }
    //检查是否已经加载该文件，如果文件已经在加载队列，则返回，等待后续代码的执行
    if (cfg.uris[url]) {
      return;
    }
    //开始加载
    cfg.uris[url] = 1;
    var head = document.getElementsByTagName("head")[0] || document.documentElement;
    var baseElement = head.getElementsByTagName("base")[0];
    var node = document.createElement("script");
    node.charset = "utf-8";
    node.async = true;
    node.src = url;
    //todo:这里可以考虑监控一下文件加载失败的情况，方便报错和监控等后续的健壮性功能
    baseElement ? head.insertBefore(node, baseElement) : head.appendChild(node);
    emit("file_loading", url);
  }



  //事件监听

  function on(name, cb) {
    var cbs = cfg.events[name];
    if (!cbs) {
      cbs = cfg.events[name] = [];
    }
    cbs.push(cb);
  }

  //事件广播

  function emit(name, evt) {
    console.log(name, evt);
    for (var i in cfg.events[name]) {
      cfg.events[name][i](evt);
    }
    if (name === 'error') {
      delete cfg.events[name];
    }
  }

  //对象类型判断

  function isType(type, obj) {
    return Object.prototype.toString.call(obj) === "[object " + type + "]"
  }
  //分析module的依赖关系

  function parseDependencies(code) {
    var commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg;
    var cjsRequireRegExp = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g;
    var ret = [];
    code.replace(commentRegExp, "").replace(cjsRequireRegExp, function(match, dep) {
      dep && ret.push(dep);
    })
    return ret;
  }
}(this));