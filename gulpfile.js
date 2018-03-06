var gulp = require('gulp');
var fs = require('fs');
var psi = require('psi');
var webpagetest = require('gulp-webpagetest');
var site = 'https://uat01.murad.com';
var key = '';

Object.defineProperty(Date.prototype, 'YYYYMMDDHHMMSS', {
    value: function() {
        function pad2(n) {  // always returns a string
            return (n < 10 ? '0' : '') + n;
        }

        return this.getFullYear() +
               pad2(this.getMonth() + 1) + 
               pad2(this.getDate()) +
               pad2(this.getHours()) +
               pad2(this.getMinutes()) +
               pad2(this.getSeconds());
    }
});

var timestamp = new Date().YYYYMMDDHHMMSS();

// Please feel free to use the `nokey` option to try out PageSpeed
// Insights as part of your build process. For more frequent use,
// we recommend registering for your own API key. For more info:
// https://developers.google.com/speed/docs/insights/v2/getting-started

gulp.task('mobile', ['wpt_uat01'], function () {
    return psi(site, {
        // key: key
        nokey: 'true',
        strategy: 'mobile',
    }).then(function (data) {
        var result = {
            "type": "mobile",
            "speed_score": data.ruleGroups.SPEED.score,
            "usability_score": data.ruleGroups.USABILITY.score
        };

        var content = JSON.parse(fs.readFileSync('output/wpt-results-uat01-'+timestamp+'.json',"utf-8").toString());

        var performance = {
            "wpt": content,
            "psi": {
                "mobile": "",
                "desktop": ""
            }
        };

        performance.psi.mobile = result;

        fs.writeFile('output/murad-perf-results-uat01-'+timestamp+'.json',JSON.stringify(performance),function(data){});
        // gulp.dest('output/psi-results-uat01-'+timestamp+'.json');
        // console.log('Speed score: ' + data.ruleGroups.SPEED.score);
        // console.log('Usability score: ' + data.ruleGroups.USABILITY.score);
    });
});

gulp.task('desktop', ['mobile'], function () {
    return psi(site, {
        nokey: 'true',
        // key: key,
        strategy: 'desktop',
    }).then(function (data) {
        var result = {
            "type": "desktop",
            "speed_score": data.ruleGroups.SPEED.score
            
        };

        // 1. read from wpt-result file and assign to wpt object
        // 2. create psi object and create a child object for mobile
        // 3. create desktop object and assign to psi

        /*
            {
                "wpt":{}
                "psi":{
                    "mobile":{},
                    "desktop":{}
                }
            }
        */

        
        var content = JSON.parse(fs.readFileSync('output/psi-results-uat01-'+timestamp+'.json',"utf-8").toString());

        content.psi.desktop = result;
        // content += "\n"+JSON.stringify(result);
        fs.writeFile('output/murad-perf-results-uat01-'+timestamp+'.json',JSON.stringify(content),function(data){});
        // console.log('Speed score: ' + data.ruleGroups.SPEED.score);
        
    });
});

gulp.task('wpt_uat01', webpagetest({
    url: 'https://uat01.murad.com',
    key: 'A.8da8f989626192b7d45d16725bac6c68',
    location: 'Dulles:Chrome',
    firstViewOnly: true,
    output: 'output/wpt-results-uat01-'+timestamp+'.json',
    budget: {
      SpeedIndex: 1000,
      visualComplete: 1000
    },
    callback: function() {
      console.log('WPT uat01test done !');
    }
  }));

gulp.task('mobile_prod', ['wpt_prod'], function () {
    return psi('https://www.murad.com', {
        // key: key
        nokey: 'true',
        strategy: 'mobile',
    }).then(function (data) {
        var result = {
            "speed_score": data.ruleGroups.SPEED.score,
            "usability_score": data.ruleGroups.USABILITY.score
        };
        
        var content = JSON.parse(fs.readFileSync('output/wpt-results-uat01-'+timestamp+'.json',"utf-8").toString());

        var performance = {
            "wpt": content,
            "psi": {
                "mobile": "",
                "desktop": ""
            }
        };

        performance.psi.mobile = result;

        fs.writeFile('output/murad-perf-results-uat01-'+timestamp+'.json',JSON.stringify(performance),function(data){});        
        
        // console.log('Speed score: ' + data.ruleGroups.SPEED.score);
        // console.log('Usability score: ' + data.ruleGroups.USABILITY.score);
    });
});

gulp.task('desktop_prod', function () {
    return psi('https://www.murad.com', {
        nokey: 'true',
        // key: key,
        strategy: 'desktop',
    }).then(function (data) {
        var result = {
            "speed_score": data.ruleGroups.SPEED.score

        };
        fs.writeFile('output/murad-perf-results-prod-'+timestamp+'.json',JSON.stringify(result),function(data){});
        
        // console.log('Speed score: ' + data.ruleGroups.SPEED.score);
        
    });
});

gulp.task('wpt_prod', webpagetest({
    url: 'https://www.murad.com',
    key: 'A.8da8f989626192b7d45d16725bac6c68',
    location: 'Dulles:Chrome',
    firstViewOnly: true,
    output: 'output/wpt-results-prod-'+timestamp+'.json',
    budget: {
      SpeedIndex: 1000,
      visualComplete: 1000
    },
    callback: function() {
      console.log('WPT Prod test done !');
    }
  }));


gulp.task('default', ['desktop']);
// gulp.task('default', ['mobile', 'desktop', 'wpt_uat01']);
gulp.task('prod', ['mobile_prod', 'desktop_prod', 'wpt_prod']);


