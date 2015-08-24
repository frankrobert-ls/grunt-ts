/// <reference path="../defs/tsd.d.ts" />

import * as nodeunit from 'nodeunit';
import * as or from '../tasks/modules/optionsResolver';
import * as utils from '../tasks/modules/utils';


let grunt: IGrunt = require('grunt');

const config : {[name: string]: IGruntTargetOptions} = {
  "minimalist": <any>{
    src: ["**/*.ts", "!node_modules/**/*.ts"]
  },
  "has ES3 and sourceMap": <any>{
    options: {
      target: 'es3',
      sourceMap: true
    }
  },
  "bad sourceMap capitalization": <any>{
    options: {
      target: 'es3',
      sourcemap: true
    }
  },
  "sourceMap in wrong place": <any>{
    options: {
      target: 'es3'
    },
    sourceMap: true
  },
  "bad sourceMap capitalization in wrong place": <any>{
    options: {
      target: 'es3'
    },
    sourcemap: true
  },
  "has ES6 and no sourceMap": <any>{
    options: {
      target: 'es6',
      sourceMap: false
    }
  },
  "has outDir set to ./built": <any>{
    outDir: './built',
    options: {
      target: 'es6',
      sourceMap: false
    }
  },
  "has outDir set to ./myOutDir": <any>{
    outDir: './myOutDir'
  },
  "has outDir set to null": <any>{
    outDir: null
  },
  "has outDir set to undefined": <any>{
    outDir: undefined
  },
  "out has spaces": <any>{
    out: "my folder/out has spaces.js"
  },
  "outDir has spaces": <any>{
    outDir: "./my folder"
  },
  "reference set to ref1.ts": <any>{
    reference: "ref1.ts"
  },
  "reference set to ref2.ts": <any>{
    reference: "ref2.ts"
  },
  "reference set to null": <any>{
    reference: null
  },
  "reference set to undefined": <any>{
    reference: undefined
  },
  "vs minimalist": <any>{
    vs: "test/vsproj/testproject.csproj",
    options: {}
  },
  "vs ignoreSettings Release": <any>{
    vs: {
      project: "test/vsproj/testproject.csproj",
      config: "Release",
      ignoreSettings: true
    },
    options: {}
  }
};

function getConfig(name: string, asCopy = false) : IGruntTargetOptions {
  if (asCopy) {
    // JSON serialize/deserialize is an easy way to copy rather than reference, but it will
    // omit undefined properties.
    return JSON.parse(JSON.stringify(config[name]));
  }
  return config[name];
}

export var tests : nodeunit.ITestGroup = {

  // "Templates Tests": {
  //   "Processed on Task Properties": (test) => {
  //       test.ok(false);
  //       test.done();
  //   },
  //   "Processed on Task Options": (test) => {
  //       test.ok(false);
  //       test.done();
  //   },
  //   "Processed on Target Properties": (test) => {
  //       test.ok(false);
  //       test.done();
  //   },
  //   "Processed on Target Options": (test) => {
  //       test.ok(false);
  //       test.done();
  //   }
  // },

  "Warnings and Errors Tests": {
    "Bad capitalization detected and fixed": (test: nodeunit.Test) => {
        test.expect(2);
        const result = or.resolveAsync(null, getConfig("bad sourceMap capitalization")).then((result) => {
          let allWarnings = result.warnings.join('\n');
          test.ok(allWarnings.indexOf('Property "sourcemap" in target "" options is incorrectly cased; it should be "sourceMap"') > -1);
          test.strictEqual((<any>result).sourcemap, undefined);
          test.done();
        }).catch((err) => {test.ifError(err); test.done();});
    },
    "Option in wrong place detected": (test: nodeunit.Test) => {
        test.expect(1);
        const result = or.resolveAsync(null, getConfig("sourceMap in wrong place")).then((result) => {
          let allWarnings = result.warnings.join('\n');
          test.ok(allWarnings.indexOf('Property "sourceMap" in target "" is possibly in the wrong place and will be ignored.  It is expected on the options object.') > -1);
          test.done();
        }).catch((err) => {test.ifError(err); test.done();});

    },
    "Option in wrong place and wrong case detected": (test: nodeunit.Test) => {
        test.expect(2);
        const result = or.resolveAsync(null, getConfig("bad sourceMap capitalization in wrong place")).then((result) => {
          let allWarnings = result.warnings.join('\n');
          test.ok(allWarnings.indexOf('Property "sourcemap" in target "" is possibly in the wrong place and will be ignored.  It is expected on the options object.') > -1);
          test.ok(allWarnings.indexOf('It is also the wrong case and should be sourceMap') > -1);
          test.done();
        }).catch((err) => {test.ifError(err); test.done();});
    }
  },

  "Special processing Tests": {
    "path with spaces gets enclosed in double-quotes": (test: nodeunit.Test) => {
        test.expect(1);
        const result = utils.escapePathIfRequired("this is a path/path.txt");
        test.strictEqual(result, "\"this is a path/path.txt\"");
        test.done();
    },
    "path that is already enclosed in double-quotes is unchanged": (test: nodeunit.Test) => {
      test.expect(1);
      const result = utils.escapePathIfRequired("\"this is a path/path.txt\"");
      test.strictEqual(result, "\"this is a path/path.txt\"");
      test.done();
    },
    "path without spaces is unchanged": (test: nodeunit.Test) => {
      test.expect(1);
      const result = utils.escapePathIfRequired("thisIsAPath/path.txt");
      test.strictEqual(result, "thisIsAPath/path.txt");
      test.done();
    },
    "out with spaces gets escaped with double-quotes": (test: nodeunit.Test) => {
        test.expect(1);
        const files = [getConfig("out has spaces")];
        const result = or.resolveAsync(null, getConfig("out has spaces"), null, files).then((result) => {
          test.strictEqual(result.CompilationTasks[0].out, "\"my folder/out has spaces.js\"");
          test.done();
        }).catch((err) => {test.ifError(err); test.done();});

    },
    "outDir with spaces gets escaped with double-quotes": (test: nodeunit.Test) => {
        test.expect(1);
        const files = [getConfig("outDir has spaces")];
        const result = or.resolveAsync(null, getConfig("outDir has spaces"), null, files).then((result) => {
          test.strictEqual(result.CompilationTasks[0].outDir, "\"./my folder\"");
          test.done();
        }).catch((err) => {test.ifError(err); test.done();});
    }
  },



  "Precedence and defaults override Tests": {
    "The grunt-ts defaults come through when not specified": (test: nodeunit.Test) => {
        test.expect(2);
        const result = or.resolveAsync(null, getConfig("minimalist")).then((result) => {
          test.strictEqual(result.target, "es5");
          test.strictEqual(result.fast, "watch");
          test.done();
        }).catch((err) => {test.ifError(err); test.done();});
    },
    "Task properties should override grunt-ts defaults if not specified on the target": (test: nodeunit.Test) => {
        test.expect(2);
        const result = or.resolveAsync(getConfig("reference set to ref1.ts"), getConfig("minimalist")).then((result) => {
          test.strictEqual(getConfig("minimalist").outDir, undefined);
          test.strictEqual(result.reference, 'ref1.ts');
          test.done();
        }).catch((err) => {test.ifError(err); test.done();});
    },
    "Target name is set if specified": (test: nodeunit.Test) => {
        test.expect(1);
        const result = or.resolveAsync(null, getConfig("minimalist"), "MyTarget").then((result) => {
          test.strictEqual(result.targetName, "MyTarget");
          test.done();
        }).catch((err) => {test.ifError(err); test.done();});
    },
    "Target name is default if not specified": (test: nodeunit.Test) => {
        test.expect(1);
        const result = or.resolveAsync(null, getConfig("minimalist")).then((result) => {
          test.strictEqual(result.targetName, '');
          test.done();
        }).catch((err) => {test.ifError(err); test.done();});
    },
    "Task options should override grunt-ts defaults if not specified in the target options": (test: nodeunit.Test) => {
        test.expect(2);
        const result = or.resolveAsync(getConfig("has ES6 and no sourceMap"), getConfig("minimalist")).then((result) => {
          test.strictEqual(result.target, "es6");
          test.strictEqual(result.sourceMap, false);
          test.done();
        }).catch((err) => {test.ifError(err); test.done();});
    },
    "Properties specified on the target should override anything specified in the task and the grunt-ts defaults": (test: nodeunit.Test) => {
        test.expect(1);
        const result = or.resolveAsync(getConfig("reference set to ref1.ts"), getConfig("reference set to ref2.ts")).then((result) => {
          test.strictEqual(result.reference, "ref2.ts");
          test.done();
        }).catch((err) => {test.ifError(err); test.done();});
    },
    "Explicit null specified on the target should override anything specified in the task and the grunt-ts defaults": (test: nodeunit.Test) => {
        test.expect(1);
        const result = or.resolveAsync(getConfig("reference set to ref1.ts"), getConfig("reference set to null")).then((result) => {
          test.strictEqual(result.reference, null);
          test.done();
        }).catch((err) => {test.ifError(err); test.done();});
    },
    "Explicit undefined specified on the target should override anything specified in the task and the grunt-ts defaults": (test: nodeunit.Test) => {
        test.expect(1);
        const files = [getConfig("has outDir set to undefined")];
        const result = or.resolveAsync(getConfig("reference set to ref1.ts"), getConfig("reference set to undefined")).then((result) => {
          test.strictEqual(result.reference, undefined);
          test.done();
        }).catch((err) => {test.ifError(err); test.done();});
    },
    "Properties on target `options` should override the task options `options` object and the grunt-ts defaults": (test: nodeunit.Test) => {
        test.expect(2);
        const result = or.resolveAsync(getConfig("has ES6 and no sourceMap"), getConfig("has ES3 and sourceMap")).then((result) => {
          test.strictEqual(result.target, "es3");
          test.strictEqual(result.sourceMap, true);
          test.done();
        }).catch((err) => {test.ifError(err); test.done();});
    }
  },


  "Visual Studio `vs` Integration Tests": {
    "Visual Studio properties should override the grunt-ts defaults ONLY": (test) => {
      test.expect(4);
      const cfg = getConfig("vs minimalist", true);
      cfg.options.sourceMap = false;
      const result = or.resolveAsync(null, cfg).then((result) => {
        test.strictEqual(result.removeComments, false);
        test.strictEqual(result.sourceMap, false);
        test.strictEqual(result.module, 'commonjs');
        test.strictEqual(result.CompilationTasks[0].outDir, 'vsproj_test');
        test.done();
      }).catch((err) => {test.ifError(err); test.done();});
    },
    "If a particular grunt-ts setting is not specified in the gruntfile, and `ignoreSettings` is true, the grunt-ts defaults should be used for that setting": (test) => {
      test.expect(1);
      const result = or.resolveAsync(null, getConfig("vs ignoreSettings Release")).then((result) => {
        test.strictEqual(result.sourceMap, true, 'Since this csproj file\'s Release config sets sourceMap as false, if the setting is ignored, the grunt-ts default of true should come through.');
        test.done();
      }).catch((err) => {test.ifError(err); test.done();});
    },
    "Any options specified on the task should override the Visual Studio settings": (test) => {
      test.expect(1);
      const cfg = getConfig("vs ignoreSettings Release", true);
      cfg.outDir = "this is the test outDir";
      const result = or.resolveAsync(null, cfg).then((result) => {
        test.strictEqual(result.CompilationTasks[0].outDir, "this is the test outDir");
        test.done();
      }).catch((err) => {test.ifError(err); test.done();});
    },
    // "Any 'options' options specified on the task should override the Visual Studio settings": (test) => {
    //   const cfg = getConfig("vs ignoreSettings Release");
    //   test.strictEqual(cfg.outDir,"");
    //     test.done();
    // },
    // "Any properties specified on the target should override the Visual Studio settings": (test) => {
    //     test.ok(false);
    //     test.done();
    // },
    // "Any options specified on the target should override the Visual Studio settings": (test) => {
    //     test.ok(false);
    //     test.done();
    // }
  },

  // "tsconfig.json Integration Tests": {
  //   "todo": (test) => {
  //       test.ok(false);
  //       test.done();
  //   }
  // }

};
