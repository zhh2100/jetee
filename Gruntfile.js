module.exports = function(grunt){
    var pkg = grunt.file.readJSON('package.json'),
        Jetee="Jetee(requirejs,jquery)",
        banner = '/*!\n * 简单易用加精简,功能仿,先用它做站，功能不够再原版替换\n * https://github.com/qqtxt/jetee\n * Released under the MIT license \n * Jetee version <%= pkg.version %>\n * build: <%= new Date().toLocaleString() %>\n * http://www.ma863.com \n */\n';
    // 1. 初始化插件配置
    grunt.initConfig({
        pkg:pkg,
        //主要编码处
         uglify: {
            options: { //可选项配置
            },
             requirejs: {
                 options: {
                    mangle:false,
                    preserveComments: 'all',
                    compress: false,
                    beautify:true,
                    banner: banner.replace('Jetee','requirejs')
                 },
                 files: {
                     'dist/<%= pkg.version %>/requirejs/requirejs.js': ['src/requirejs/require.js']
                 }
             },
             requirejs_min: {
                 options: {
                     banner: banner.replace('Jetee','requirejs')
                 },
                 files: {
                     'dist/<%= pkg.version %>/requirejs/requirejs.min.js': ['src/requirejs/require.js']
                 }
             },
             jquery: {
                options: {
                    mangle:false,
                    preserveComments: 'all',
                    compress: false,
                    beautify:true,
                    banner: banner.replace('Jetee','jquery')
                },
                files: {
                    'dist/<%= pkg.version %>/jquery/jquery.js': ['src/jquery/*.js']
                }
            },
             jquery_min: {
                 options: {
                     banner: banner.replace('Jetee','jquery')
                 },
                 files: {
                     'dist/<%= pkg.version %>/jquery/jquery.min.js': ['dist/<%= pkg.version %>/jquery/jquery.js']
                 }
             },
             jetee: {
                 options: {
                     mangle:false,
                     preserveComments: 'all',
                     compress: false,
                     beautify:true,
                     banner: banner.replace('Jetee',Jetee)
                 },
                 files: {
                     'dist/<%= pkg.version %>/jetee.js': ['src/requirejs/require.js','src/jquery/jquery.js']
                 }
             },
            jetee_min: {
                options: {
                    banner: banner.replace('Jetee',Jetee)
                },
                files: {
                    'dist/<%= pkg.version %>/jetee.min.js': ['src/requirejs/require.js','src/jquery/jquery.js']
                }
            }
        },
        cssmin: {
            options: {
                banner: banner
            },
            minify: {
                files: {
                    "dist/<%= pkg.version %>/css/jetee.min.css": ['dist/<%= pkg.version %>/css/*.css','!dist/<%= pkg.version %>/css/*.min.css']
                }
            }
        }
    });

    // 2. 加载插件任务
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    // 3. 注册构建任务
    grunt.registerTask('default', ['uglify','cssmin']);
};