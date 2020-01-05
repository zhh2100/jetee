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
})(this);