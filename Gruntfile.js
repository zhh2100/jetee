module.exports = function(grunt){
    var pkg = grunt.file.readJSON('package.json'),
        banner = '/*!\n * jetee <%= pkg.version %>\n * build: <%= new Date().toLocaleString() %>\n * http://www.ma863.com \n */\n';
    // 1. 初始化插件配置
    grunt.initConfig({
        pkg:pkg,
        //主要编码处
        concat: {
            jquery:{
                options: { //可选项配置
                    banner: banner,
                    separator: ';'   //使用;连接合并
                },
                src:  ["src/jquery/1.12.4/*.js"],  //合并哪些js文件
                dest: "dist/jquery/1.12.4/jquery.js" //输出的js文件
            },
            js:{
                options: { //可选项配置
                    banner: banner,
                    separator: ';'   //使用;连接合并
                },
                src:  ["src/jquery/1.12.4/*.js","src/bootstrap/*.js"],  //合并哪些js文件
                dest: "dist/jetee.js" //输出的js文件
            },
            css:{
                src:  ["src/jquery/1.12.4/css/*.css"],  //合并哪些js文件
                dest: "dist/css/jetee.css" //输出的js文件
            }
        },
        uglify: {
            options: { //可选项配置
                banner: banner
            },
            my_target: {
                files: {
                    'dist/jetee.min.js': ['dist/jetee.js'],
                    'dist/jquery/1.12.4/jquery.min.js': ['dist/jquery/1.12.4/jquery.js']
                }
            }
        },
        cssmin: {
            options: {
                banner: banner
            },
            minify: {
                files: {
                    "dist/css/jetee.min.css": ['dist/css/*.css','!dist/css/*.min.css']
                }
            }
        }
    });

    // 2. 加载插件任务
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    // 3. 注册构建任务
    grunt.registerTask('default', ['concat','uglify','cssmin']);
};