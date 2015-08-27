/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

'use strict';
angular.module("app", ["MAdmin", "flowServices", "flowFactories", "home", "fluid", "devControllers", "adminControllers", "flowAppDirectives", "sessionControllers", "fNotify", "infinite-scroll", "ngDragDrop", "rexTemplates"])
    .run(["flowFrameService", "flowHttpService", "userProfile", "responseEvent", "fnService", "userAppSetting", "HOST", "hasProfile", "$rootScope", "sessionService",
        function (f, fhp, up, re, fns, uas, h, hp, rs, ss) {

            fhp.host = h;
            fhp.permissionUrl = "services/flow_permission/has_permission";
            rs.$watch(function (scope) {
                return ss.isSessionOpened();
            }, function (session) {
                if (session) {
                    console.info("session-opened", session);
                    fhp.getLocal("session/profile/user_detail").success(function (data) {
                        up.createUserProfile(data);

                        console.info("user_detail", data);
                    });

                    fhp.postGlobal("services/flow_module_service/user_tasks").success(function (tasks) {
                        angular.forEach(tasks, function (task) {
                            f.addTask(task);
                        });


                        console.info("flow_user_tasks", tasks);
                    });
                } else {
                    window.location = "signin.html";
                }
            })
            re.addResponse(undefined, 401, true, "signin.html");
            re.addResponse("NOT_AUTHENTICATED", 401);
            fns.url = "session/notification/alerts";
            fns.topUrl = "session/notification/top?limit=5";
            hp.url = "services/flow_permission/has_profile";

        }])
    .filter('setDecimal', function ($filter) {
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
;
 

