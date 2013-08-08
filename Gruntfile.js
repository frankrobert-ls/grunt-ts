module.exports = function (grunt) {
    "use strict";

    grunt.initConfig({

        clean: {
            test: [
                "test/**/*.js",
                "test/**/*.html.ts",
            ]
        },

        watch: {
            files:['test/**/*.ts'],
            tasks: ['test'],
            options:{
                spawn:false,                
            }
        },

        ts: {
            options: {                    // use to override the default options, See : http://gruntjs.com/configuring-tasks#options
                target: 'es3',            // es3 (default) / or es5
                module: 'commonjs',       // amd , commonjs (default)
                sourcemap: true,          // true  (default) | false
                declaration: false,       // true | false  (default)
                nolib: false,             // true | false (default)
                comments: false           // true | false (default)
            },
            dev: {                          // a particular target   
                src: ["test/work/**/*.ts"], // The source typescript files, See : http://gruntjs.com/configuring-tasks#files                
                out: 'test/work/out.js',    // If specified, generate an out.js file which is the merged js file                     
                options: {                  // override the main options, See : http://gruntjs.com/configuring-tasks#options
                    sourcemap: true,
                    declaration: true
                },
            },
            fail: {                        // another target 
                src: ["test/fail/**/*.ts"],
                options: {                  // overide the main options for this target 
                    sourcemap: false,
                }
            },
            abtest: {
                src: ['test/abtest/**/*.ts'],
                reference: 'test/abtest/reference.ts',
                out: 'test/abtest/out.js',                
            },
            amdtest: {
                src: ['test/amdtest/**/*.ts'],                
                options: {
                    module: 'amd'
                }
            },
            htmltest: {
                src: ['test/html/**/*.ts'],
                html: ['test/html/**/*.tpl.html'],
                reference: 'test/html/reference.ts'
            }
        },
    });

    // Loading it for testing since I have in a local "tasks" folder 
    grunt.loadTasks("tasks");
    // in your configuration you would load this like: 
    //grunt.loadNpmTasks("grunt-ts")

    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-watch");

    grunt.registerTask("test", ["clean", "ts:htmltest"]);
    grunt.registerTask("default", ["test","watch"]);

};
