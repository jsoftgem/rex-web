var vendorsJS = ['bower_components/jquery/dist/jquery.js', 'bower_components/angular/angular.js',
    'bower_components/ng-file-upload/ng-file-upload.js', 'bower_components/oclazyload/dist/ocLazyLoad.js',
    'bower_components/angular-local-storage/dist/angular-local-storage.js', 'bower_components/Chart.js/Chart.js',
    'bower_components/moment/moment.js', 'bower_components/fullcalendar/dist/fullcalendar.js',
    'bower_components/fullcalendar/dist/gcal.js', 'bower_components/bootstrap/dist/js/bootstrap.js',
    'bower_components/angular-cookies/angular-cookies.js', 'bower_components/angular-resource/angular-resource.js',
    'bower_components/angular-filter/dist/angular-filter.js', 'bower_components/jQuery.print/jQuery.print.js',
    'bower_components/slimScroll/jquery.slimscroll.js', 'bower_components/angular-truncate/src/truncate.js',
    'bower_components/ngInfiniteScroll/build/ng-infinite-scroll.js', 'bower_components/datatables/media/js/jquery.dataTables.js',
    'bower_components/datatables/media/js/dataTables.bootstrap.js', 'bower_components/datatables.net-responsive/js/dataTables.responsive.js',
    'bower_components/angular-datatables/dist/angular-datatables.js', 'bower_components/angular-datatables/dist/plugins/bootstrap/angular-datatables.bootstrap.js',
    'bower_components/angular-bootstrap/ui-bootstrap.js',
    'bower_components/jquery-ui/jquery-ui.js', 'bower_components/eonasdan-bootstrap-datetimepicker/src/js/bootstrap-datetimepicker.js',
    'bower_components/jqueryui-touch-punch/jquery.ui.touch-punch.js', 'bower_components/metisMenu/dist/metisMenu.js',
    'bower_components/jquery.scrollTo/jquery.scrollTo.js', 'bower_components/qtip2/jquery.qtip.js',
    'bower_components/angular-dragdrop/src/angular-dragdrop.js'];

var vendorCSS = ['bower_components/bootstrap/dist/css/bootstrap.css',
    'bower_components/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.css',
    'bower_components/font-awesome/css/font-awesome.css', 'bower_components/octicons/octicons/octicons.css',
    'bower_components/datatables/media/css/dataTables.bootstrap.css',
    'bower_components/fullcalendar/dist/fullcalendar.css', 'bower_components/qtip2/jquery.qtip.css'
];

var vendorFonts = ['bower_components/bootstrap/fonts/*', 'bower_components/font-awesome/fonts/*'];
var vendorCSSResource = ['bower_components/octicons/octicons/*.woff', 'bower_components/octicons/octicons/*.ttf'];
var appJS = ['src/js/rex-template.module.js', 'src/js/app.js',
    'src/js/**/*.js', 'tmp/*.js'];
var appCSS = ['src/css/**/*.css'];

// HTML Build section config
var sections = {
    layout: {
        content: 'html-build/sections/content.html',
        signin_content: 'html-build/sections/signin-content.html'
    }
};

var devSections = {
    layout: {
        content: 'html-build/sections/dev-content.html',
        signin_content: 'html-build/sections/signin-content.html'
    }
};
var homeBuildFile = 'html-build/home.html';
var homeBuildFileDest = 'home.html';
var indexBuildFile = 'html-build/index.html';
var indexBuildFileDest = 'index.html';
var signinBuildFile = 'html-build/signin.html';
var signinBuildFileDest = 'signin.html';
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
                singleModule: true,
                module: 'rexTemplates',
                htmlmin: {
                    collapseBooleanAttributes: true,
                    collapseWhitespace: true,
                    removeComments: true
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
            app: {
                src: appJS,
                dest: 'dist/js/app.js'
            },
            vendor: {
                src: vendorsJS,
                dest: 'dist/js/vendor.js'
            }
        },
        uglify: {
            dist: {
                files: [
                    {
                        'dist/js/app.min.js': ['dist/js/app.js'],
                        'dist/js/vendor.min.js': ['dist/js/vendor.js'],
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
            app: {
                src: appCSS,
                dest: "dist/css/app.css"
            },
            vendor: {
                src: vendorCSS,
                dest: 'dist/css/vendor.css'
            }
        },
        clean: {
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
        },
        compress: {
            dist: {
                options: {
                    mangle: false
                },
                files: [{
                    src: ['dist/**'],
                    dest: 'dist/'
                }]
            }
        },
        strip: {
            main: {
                src: 'dist/js/app.js',
                dest: 'dist/js/app.js',
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
        },
        htmlbuild: {
            prod_home: {
                src: homeBuildFile,
                dest: homeBuildFileDest,
                options: {
                    beautify: true,
                    scripts: {
                        libs: 'dist/js/vendor.min.js',
                        app: 'dist/js/app.min.js'
                    },
                    styles: {
                        libs: 'dist/css/vendor.min.css',
                        app: 'dist/css/app.min.css'
                    },
                    sections: sections
                }
            },
            dev_home: {
                src: homeBuildFile,
                dest: homeBuildFileDest,
                options: {
                    beautify: true,
                    scripts: {
                        libs: 'dist/js/vendor.js',
                        app: appJS
                    },
                    styles: {
                        libs: 'dist/css/vendor.css',
                        app: appCSS
                    },
                    sections: devSections
                }
            },
            dev_index: {
                src: indexBuildFile,
                dest: indexBuildFileDest,
                options: {
                    beautify: true,
                    scripts: {
                        libs: 'dist/js/vendor.js',
                        app: appJS
                    },
                    styles: {
                        libs: 'dist/css/vendor.css',
                        app: appCSS
                    }
                }
            },
            prod_index: {
                src: indexBuildFile,
                dest: indexBuildFileDest,
                options: {
                    beautify: true,
                    scripts: {
                        libs: 'dist/js/vendor.min.js',
                        app: 'dist/js/app.min.js'
                    },
                    styles: {
                        libs: 'dist/css/vendor.min.css',
                        app: 'dist/css/app.min.css'
                    }
                }
            },
            dev_signin: {
                src: signinBuildFile,
                dest: signinBuildFileDest,
                options: {
                    beautify: true,
                    scripts: {
                        libs: 'dist/js/vendor.js',
                        app: appJS
                    },
                    styles: {
                        libs: 'dist/css/vendor.css',
                        app: appCSS
                    },
                    sections: sections
                }
            },
            prod_signin: {
                src: signinBuildFile,
                dest: signinBuildFileDest,
                options: {
                    beautify: true,
                    scripts: {
                        libs: 'dist/js/vendor.min.js',
                        app: 'dist/js/app.min.js'
                    },
                    styles: {
                        libs: 'dist/css/vendor.min.css',
                        app: 'dist/css/app.min.css'
                    },
                    sections: sections
                }
            }
        },
        copy: {
            main: {
                files: [
                    {
                        expand: true, flatten: true,
                        src: vendorFonts,
                        dest: 'dist/fonts/',
                        filter: 'isFile'
                    }
                ]
            },
            css: {
                files: [{
                    expand: true, flatten: true,
                    src: vendorCSSResource,
                    dest: 'dist/css',
                    filter: 'isFile'
                }]
            }
        }
    });
    require('load-grunt-tasks')(grunt);
    grunt.registerTask('dev-html', ['htmlbuild:dev_home', 'htmlbuild:dev_index', 'htmlbuild:dev_signin']);
    grunt.registerTask('prod-html', ['htmlbuild:prod_home', 'htmlbuild:prod_index', 'htmlbuild:prod_signin']);
    grunt.registerTask('build-copy', ['copy:main', 'copy:css']);
    grunt.registerTask('build-prod', ['clean:temp', 'html2js:dist', 'concat:app', 'strip:main', 'concat:vendor', 'uglify',
        'concat_css:app', 'concat_css:vendor', 'cssmin', 'build-copy', 'prod-html']);
    grunt.registerTask('build-dev', ['html2js:dist', 'concat:vendor', 'concat_css:vendor', 'build-copy', 'dev-html']);


}