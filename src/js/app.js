'use strict';
angular.module("app", ["MAdmin", "fluid.webComponents", "war.resources", "war.session", "war.sidebar", "datatables", "datatables.bootstrap", "datatables.tabletools", "datatables.colvis", "flowServices", "flowFactories", "home", "fluid", "devControllers", "adminControllers", "flowAppDirectives", "sessionControllers", "infinite-scroll", "ngDragDrop", "rexTemplates"])

    .config(function ($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/);
    })
    .run(["flowFrameService", "flowHttpService", "userProfile", "responseEvent", "userAppSetting", "HOST",
        function (f, fhp, up, re, uas, h) {
            fhp.host = h;
            re.addResponse(undefined, 401, true, "signin.html");
            re.addResponse("NOT_AUTHENTICATED", 401);

        }])
    .filter('setDecimal', function () {
        return function (input, places) {
            if (isNaN(input)) return input;
            // If we want 1 decimal place, we want to mult/div by 10
            // If we want 2 decimal places, we want to mult/div by 100, etc
            // So use the following to create that factor
            var factor = "1" + Array(+(places > 0 && places + 1)).join("0");
            return Math.round(input * factor) / factor;
        };
    })
    .filter("reportWeek", function () {
        return function (input) {
            var week = {};
            if (input > 0) {
                week.selectedWeek = input;
            }
            return week;
        }
    })
    .filter("totalFrequency", function () {
        return function (items, userAccessLevel) {
            var filtered = [];
            var $totalFrequency = {value: 0};
            angular.forEach(items, function (item) {
                this.value += item.customerFrequency;
            }, $totalFrequency);
            filtered.push({frequency: $totalFrequency.value});
            return filtered;
        }
    });

 

