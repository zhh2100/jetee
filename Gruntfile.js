module.exports = function(grunt){
	var pkg = grunt.file.readJSON('package.json'),
		configBridge = grunt.file.readJSON('./grunt/configBridge.json', { encoding: 'utf8' });
		Jetee="Jetee(requirejs,jquery,bootstrap)",
		banner = '/*!\n * 简单易用加精简,功能仿,先用它做站，功能不够再原版替换\n * https://github.com/qqtxt/jetee\n * Released under the MIT license \n * Jetee version <%= pkg.version %>\n * build: <%= new Date().toLocaleString() %>\n * http://www.ma863.com \n */\n';
	// 1. 初始化插件配置
	grunt.initConfig({
		pkg:pkg,
		//主要编码处
		clean: {
			dist: 'dist/<%= pkg.version %>'
		},
		jshint: {
			options: {
				jshintrc: 'src/bootstrap/js/.jshintrc'
			},
			core: {
				src: 'src/bootstrap/js/*.js'
			}		  
		},
		jscs: {
			options: {
				config: 'src/bootstrap/js/.jscsrc'
			},
			core: {
				src: '<%= jshint.core.src %>'
			},  	
		},
		uglify: {
			myconcat: {
				options: {
					mangle:false,
					compress: false,
					beautify:true,
					banner: banner.replace('Jetee',Jetee)
				},
				files: {
					'dist/<%= pkg.version %>/requirejs/require.js': ['src/requirejs/require.js'],
					'dist/<%= pkg.version %>/jquery/jquery.js': ['src/jquery/jquery.js'],
					'dist/<%= pkg.version %>/bootstrap/bootstrap.js': [
																	'src/bootstrap/js/transition.js',
																	'src/bootstrap/js/alert.js',
																	'src/bootstrap/js/button.js',
																	'src/bootstrap/js/carousel.js',
																	'src/bootstrap/js/collapse.js',
																	'src/bootstrap/js/dropdown.js',
																	'src/bootstrap/js/modal.js',
																	//'src/bootstrap/js/tooltip.js',
																	'src/bootstrap/js/popover.js',
																	'src/bootstrap/js/scrollspy.js',
																	'src/bootstrap/js/tab.js',
																	'src/bootstrap/js/affix.js'
																],
					'dist/<%= pkg.version %>/jetee.js': ['src/requirejs/require.js','src/jquery/jquery.js']
				}
			},    	
			requirejs: {
				options: {
					banner: banner.replace('Jetee','requirejs')
				},
				files: {
					'dist/<%= pkg.version %>/requirejs/require.min.js': ['src/requirejs/require.js']
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
			bootstrap: {
				options: {
					banner: banner.replace('Jetee','bootstrap')
				},
				files: {
					'dist/<%= pkg.version %>/bootstrap/bootstrap.min.js': ['dist/<%= pkg.version %>/bootstrap/bootstrap.js']
				}
			},		
			jetee: {
				options: {
					banner: banner.replace('Jetee',Jetee)
				},
				files: {
					'dist/<%= pkg.version %>/jetee.min.js': ['src/requirejs/require.js','src/jquery/jquery.js']
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
	grunt.registerTask('default', ['clean','jshint','jscs','uglify','less','postcss','cssmin']);
	grunt.registerTask('bootstrap', ['clean','less','postcss','cssmin']);
	grunt.registerTask('stylelint', ['stylelint']);
};