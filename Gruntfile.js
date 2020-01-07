module.exports = function(grunt){
	var pkg = grunt.file.readJSON('package.json'),
		configBridge = grunt.file.readJSON('./grunt/configBridge.json', { encoding: 'utf8' });
		Jetee="Jetee(requirejs,jquery)",
		banner = '/*!\n * 简单易用加精简,功能仿,先用它做站，功能不够再原版替换\n * https://github.com/qqtxt/jetee\n * Released under the MIT license \n * Jetee version <%= pkg.version %>\n * build: <%= new Date().toLocaleString() %>\n * http://www.ma863.com \n */\n';
	// 1. 初始化插件配置
	grunt.initConfig({
		pkg:pkg,
		//主要编码处
		clean: {
			dist: 'dist/<%= pkg.version %>'
		},
		concat: {
            requirejs:{
                options: {
					banner: banner.replace('Jetee','requirejs')
                },
                src:  ["src/requirejs/require.js"],  //合并哪些js文件
                dest: "dist/<%= pkg.version %>/requirejs/requirejs.js" //输出的js文件
            },
            jquery:{
                options: {
                    banner: banner.replace('Jetee','jquery')
                },
                src:  ["src/jquery/*.js"],  //合并哪些js文件
                dest: "dist/<%= pkg.version %>/jquery/jquery.js" //输出的js文件
            },
            jetee:{
                options: {
					 banner: banner.replace('Jetee',Jetee)
                },
                src:  ["dist/<%= pkg.version %>/requirejs/requirejs.js","dist/<%= pkg.version %>/jquery/jquery.js",],  //合并哪些js文件
                dest: "dist/<%= pkg.version %>/jetee.js" //输出的js文件
            }
        },
        uglify: {
            requirejs: {
                options: {
                    banner: banner.replace('Jetee','requirejs')
                },
                files: {
                    'dist/<%= pkg.version %>/requirejs/requirejs.min.js': ['src/requirejs/requirejs.js']
                }
            },
            jquery: {
                options: {
                    banner: banner.replace('Jetee','jquery')
                },
                files: {
                    'dist/<%= pkg.version %>/jquery/jquery.min.js': ['src/jquery/jquery.js']
                }
            },
            jetee: {
                options: {
                    banner: banner.replace('Jetee',Jetee)
                },
                files: {
                    'dist/<%= pkg.version %>/jetee.min.js': ['src/requirejs/requirejs.js','src/jquery/jquery.js']
                }
            }
        },
		less: {
			options: {
				ieCompat: true,
				strictMath: true,
				sourceMap: true,
				outputSourceFiles: true
			},
			bootstrap: {
				options: {
					sourceMapURL: 'bootstrap.css.map',
					sourceMapFilename: 'dist/<%= pkg.version %>/bootstrap/css/bootstrap.css.map'
				},
				src: 'src/bootstrap/less/bootstrap.less',
				dest: 'dist/<%= pkg.version %>/bootstrap/css/bootstrap.css'
			},
		},
		postcss: {
		  options: {
			map: {
			  inline: false,
			  sourcesContent: true
			},
			processors: [
			  require('autoprefixer')(configBridge.config.autoprefixer)
			]
		  },
		  core: {
			src: 'dist/<%= pkg.version %>/bootstrap/css/bootstrap.css'
		  }
		},
		stylelint: {
		  options: {
			configFile: 'grunt/.stylelintrc',
			reportNeedlessDisables: false
		  },
		  dist: [
			'src/bootstrap/less/**/*.less'
		  ]
		},
		cssmin: {
			options: {
				compatibility: 'ie8',
				sourceMap: true,
				sourceMapInlineSources: true,
				level: {
					1: {
						specialComments: 'all'
					}
				}
			},
			minify: {
				files: {
					"dist/<%= pkg.version %>/bootstrap/css/bootstrap.min.css": ['dist/<%= pkg.version %>/bootstrap/css/bootstrap.css','!dist/<%= pkg.version %>/bootstrap/css/*.min.css']
				}
			}
		}
	});

	// 2. 加载插件任务
	require('load-grunt-tasks')(grunt, { scope: 'devDependencies' });
	// 3. 注册构建任务
	grunt.registerTask('default', ['clean','uglify','less','postcss','cssmin']);
	grunt.registerTask('bootstrap', ['clean','less','postcss','cssmin']);
	grunt.registerTask('stylelint', ['stylelint']);
};