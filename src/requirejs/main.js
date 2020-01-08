require.config({
	paths : {
		"home":'js/home',
		"jquery" : ["https://bootcdn.ma863.com//jquery/3.4.1/jquery.min"], 
		"vue" : ["../nogit/vue"]
	}
})


require(['home','jquery','vue',"css!http://a.cc/Public/no_min/bootstrap/3.3.7/css/bootstrap.css"], function(home,$,Vue){
	new Vue({
	  el: '#app',
	  data: {
		message: 'Hello Vue.js!'
	  }
	})
});
/*
require(['home']);
*/

