/**
 * Created by Jerico on 26/08/2015.
 */
/**
 * Created by jerico on 4/17/2015.
 */
module.exports = function (grunt) {
    grunt.initConfig({
            pkg: grunt.file.readJSON("package.json"),
            bower: {
                install: {
                    options: {
                        install: true,
                        copy: false,
                        targetDir: './libs',
                        cleanTargetDir: true
                    }
                }
            },
            jshint: {
                all: ['Gruntfile.js', 'src/js/**/*.js', '**/*.js']
            },
            karma: {
                options: {
                    configFile: 'test/config/karma.conf.js'
                },
                unit: {
                    singleRun: true
                },

                continuous: {
                    singleRun: false,
                    autoWatch: true
                }
            },
            html2js: {
                options: {
                    module: 'rexTemplates',
                    htmlmin: {
                        collapseBooleanAttributes: true,
                        collapseWhitespace: true,
                        removeComments: true,
                    }
                },
                dist: {
                    src: ['src/templates/**/*.html'],
                    dest: 'tmp/templates.js'
                }
            },
            concat: {
                options: {
                    separator: ';'
                },
                dist: {
                    src: ['src/js/**/*.js', 'tmp/*.js'],
                    dest: 'dist/js/rex.js'
                }
            },
            uglify: {
                dist: {
                    files: [
                        {
                            'dist/js/rex.min.js': ['dist/js/rex.js'],
                            'js/controller/rex/activity/customer-summary-controller.js': ['src/controller/activity/customer-summary-controller.js'],
                            'js/controller/rex/activity/daily-controller.js': ['src/controller/activity/daily-controller.js'],
                            'js/controller/rex/activity/planner.js': ['src/controller/activity/planner.js'],
                            'js/controller/rex/activity/school-year-controller.js': ['src/controller/activity/school-year-controller.js'],
                            'js/controller/rex/data/level-controller.js': ['src/controller/data/level-controller.js'],
                            'js/controller/rex/data/position-controller.js': ['src/controller/data/position-controller.js'],
                            'js/controller/rex/data/region-controller.js': ['src/controller/data/region-controller.js'],
                            'js/controller/rex/data/school-controller.js': ['src/controller/data/school-controller.js'],
                            'js/controller/rex/management/agent-controller.js': ['src/controller/management/agent-controller.js'],
                            'js/controller/rex/management/customer-controller.js': ['src/controller/management/customer-controller.js'],
                            'js/controller/rex/management/region-manager-controller.js': ['src/controller/management/region-manager-controller.js'],
                            'js/controller/rex/reports/reports-controller.js': ['src/controller/reports/reports-controller.js']
                        }
                    ],
                    options: {
                        mangle: false
                    }
                }
            },
            cssmin: {
                target: {
                    files: [
                        {
                            expand: true,
                            cwd: 'dist/css',
                            src: ['**/*.css'],
                            dest: 'dist/css',
                            ext: '.min.css'
                        }]
                }
            },
            concat_css: {
                options: {},
                all: {
                    src: ["src/css/**/*.css", "css/**/*.min.css"],
                    dest: "dist/css/rex.css"
                }
            }
            , clean: {
                temp: {
                    src: ['tmp', 'dist/css/*.css']
                }
            },
            watch: {
                dev: {
                    files: ['Gruntfile.js', 'src/js/*.js', '*.html'],
                    tasks: ['jshint', 'karma:unit', 'html2js:dist', 'concat:dist', 'clean:temp'],
                    options: {
                        atBegin: true
                    }
                }
                ,
                min: {
                    files: ['Gruntfile.js', 'app/*.js', '*.html'],
                    tasks: ['jshint', 'karma:unit', 'html2js:dist', 'concat:dist', 'clean:temp', 'uglify:dist'],
                    options: {
                        atBegin: true
                    }
                }
            }
            ,
            compress: {
                dist: {
                    options: {
                        archive: 'dist/<%= pkg.name %>-<%= pkg.version %>.zip'
                    }
                    ,
                    files: [{
                        src: ['dist/**'],
                        dest: 'dist/'
                    }]
                }
            },
            strip: {
                main: {
                    src: 'dist/js/rex.js',
                    dest: 'dist/js/rex.js',
                    nodes: ['console', 'debug', 'info', 'log']
                }
            },
            sass: {
                dist: {
                    options: {
                        style: 'expanded'
                    },
                    files: {
                        'src/css/sass.css': 'src/sass/**/*.scss'
                    }
                }
            }

        }
    );

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-concat-css');
    grunt.loadNpmTasks('grunt-html2js');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-strip');
    /*
     grunt.loadNpmTasks('grunt-contrib-sass');*/

    /*
     grunt.registerTask('dev', ['bower', 'connect:server', 'watch:dev']);
     grunt.registerTask('test', ['bower', 'jshint', 'karma:continuous']);
     grunt.registerTask('minified', ['bower', 'connect:server', 'watch:min']);
     grunt.registerTask('package', ['bower', 'jshint', 'karma:unit', 'html2js:dist', 'concat:dist', 'uglify:dist',
     'clean:temp', 'compress:dist']);*/
    grunt.registerTask('package', ['bower', 'html2js:dist', 'concat:dist',/* 'strip',*/ 'uglify:dist',
        'clean:temp', 'compress:dist', 'concat_css', 'cssmin']);
}