module.exports = function( grunt ) {

	"use strict";

	grunt.initConfig({

		jshint: {
			dist: {
				src: [ "dist/iscroll.js" ]
			},
			grunt: {
				src: [ "Gruntfile.js" ]
			},
			modules: {
				src: [ "src/**/*.js" ]
			}
		},

		concat: {
			build: {
				src: ["src/iscroll.js", "src/**/*.js"],
				dest: "dist/iscroll.js",
				options: {
					banner: "/*!\n * iScroll v5.0.0 pre-alpha-use-it-and-kittens-die ~ Copyright (c) 2012 Matteo Spinelli, http://cubiq.org\n * Released under MIT license, http://cubiq.org/license\n */\n"
				}
			}
		},

		uglify: {
			all: {
				files: {
					"dist/iscroll.min.js": [ "<%= concat.build.dest %>" ]
				},
				options: {
					sourceMap: "dist/iscroll.min.map",
					beautify: {
						ascii_only: true
					}
				}
			}
		},

		watch: {
			files: [ "<%= jshint.grunt.src %>", "<%= jshint.modules.src %>" ],
			tasks: "default"
		}
	});

	// Load grunt tasks from NPM packages
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-concat");

	// Default grunt
	grunt.registerTask( "default", [ "concat", "jshint" ] );

	// // Short list as a high frequency watch task
	grunt.registerTask( "build", [ "default", "uglify" ] );
};
