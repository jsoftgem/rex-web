'use strict';
angular.module("app", ["MAdmin", "war.resources", "war.session", "war.sidebar", "datatables", "datatables.bootstrap", "datatables.tabletools", "datatables.colvis", "flowServices", "flowFactories", "home", "fluid", "devControllers", "adminControllers", "flowAppDirectives", "sessionControllers", "infinite-scroll", "ngDragDrop", "rexTemplates"])
    .run(["flowFrameService", "flowHttpService", "userProfile", "responseEvent", "userAppSetting", "HOST", "hasProfile", "$rootScope", "sessionService", "UserFactory", "FlowUserDetail", "WarAgent", "TaskResource", "GroupResource", "userSessionService",
        function (f, fhp, up, re, uas, h, hp, rs, ss, uf, FlowUserDetail, WarAgent, TaskResource, GroupResource, uss) {
            fhp.host = h;
            fhp.permissionUrl = "services/flow_permission/has_permission";
          /*  rs.$watch(function () {
                return uf.isAuthenticated();
            }, function (session) {
                if (session) {
                    console.debug("session-opened", session);
                    console.debug("getUser", uf.getUser());

                    FlowUserDetail.currentDetail(uf.getUser().flowUserDetailId, function (userDetail) {
                        up.createUserProfile(userDetail);
                        uss.profileLoaded = true;
                    }, function () {
                        uss.profileLoaded = false;
                    });

                    WarAgent.current(function (agent) {
                        up.agent = agent;
                        uss.agentLoaded = true;
                    }, function () {
                        uss.agentLoaded = false;
                    });

                    TaskResource.getSessionTasks(function (tasks) {
                        angular.forEach(tasks, function (task, $index) {
                            f.addTask(task);
                            if ((tasks.length - 1) === $index) {
                                uss.userTasksLoaded = true;
                            }
                        });
                    }, function () {
                        uss.userTasksLoaded = false;
                    });

                    GroupResource.getByName(uf.getUser().group, function (group) {
                        up.group = group;
                        up.group.emblemPath = GroupResource.getAvatarPath(up.group.emblemId);
                        console.debug("created-group", group);
                        uss.groupLoaded = true;
                    }, function () {
                        uss.groupLoaded = false;
                    });

                } else {
                    window.location = "signin.html";
                }
            });*/
            re.addResponse(undefined, 401, true, "signin.html");
            re.addResponse("NOT_AUTHENTICATED", 401);
            /*   fns.url = "session/notification/alerts";
             fns.topUrl = "session/notification/top?limit=5";*/
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

 

