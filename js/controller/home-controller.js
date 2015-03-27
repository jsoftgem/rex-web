/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


angular.module("home", ["flowServices", "fluid", "flowFactories"])
    .controller("homeCtrl", function ($scope, sessionService, $http, flowMessageService, flowFrameService, flowHttpService, $timeout, userProfile) {
        $scope.userProfile = userProfile;
        $scope.flowFrameService = flowFrameService;
        $scope.taskbar = {};

        $scope.taskbar.getExcessCount = function (limit) {
            return $scope.flowFrameService.taskList.length - limit;
        }

        $scope.taskbar.open = function (task) {
            console.info("open", task);
            console.info("open-frame-service", flowFrameService);
            if (flowFrameService.fullScreen) {
                flowFrameService.fullScreenTask = task;
            } else {
                if (task.active === true) {

                    $(".frame-content").scrollTo($("#_id_fp_" + task.id), 800);

                } else {
                    task.active = true;
                    if (task.id.indexOf("gen") === -1) {
                        $scope.userTask = {};
                        $scope.userTask.flowTaskId = task.id.split("_")[0];
                        $scope.userTask.active = task.active;
                        $scope.userTask.flowId = task.flowId;
                        flowHttpService.post("services/flow_user_task_crud/save_task_state?field=active", $scope.userTask, task);

                    }
                }
            }


        };

        $scope.taskbar.close = function (task, index) {
            var userTask = {};
            userTask.closed = true;
            userTask.flowTaskId = task.id.split("_")[0];
            userTask.flowId = task.flowId;
            flowHttpService.post("services/flow_user_task_crud/save_task_state?field=close", userTask, task);
            flowFrameService.taskList.splice(index, 1);
        }

        $scope.taskbar.hide = function (task) {
            task.active = false;
            var userTask = {};
            userTask.active = false;
            userTask.flowTaskId = task.id.split("_")[0];
            userTask.flowId = task.flowId;
            flowHttpService.post("services/flow_user_task_crud/save_task_state?field=close", userTask, task);
        }

        $scope.logout = function () {

            flowHttpService.postGlobal("services/logout_service/logoff")
                .success(function (config) {
                    sessionService.logout();
                    window.location = "signin.html";
                });
        };

        $scope.$on("NOT_AUTHENTICATED", function (event, msg) {
            window.location = "signin.html";
            flowMessageService.danger("mainMessage", msg, 2000);
        });

        $scope.editProfile = function () {
            console.info("edit_profile", $scope.userProfile.editProfileTask + "&newTask=false");
            flowFrameService.addTask($scope.userProfile.editProfileTask + "&newTask=false");
        }

    })
    .controller("signinCtrl", function ($scope, $http, sessionService, flowMessageService, userSessionService, HOST, REX_VERSION) {

        $scope.ver = REX_VERSION;

        $scope.login = function (user) {

            var request = $http({
                method: "post",
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                data: {username: user.username, password: user.password, remember: user.remember},
                transformRequest: function (obj) {
                    var str = [];
                    for (var p in obj)
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    return str.join("&");
                },
                url: HOST + "services/login_service/auth"
            });

            request.success(function (data, status, headers, config) {
                if (data) {
                    sessionService.createSession(data.bs64auth);
                    window.location = "home.html";
                }
            });

            request.error(function (data) {
                if (data) {
                    flowMessageService.warning("signinMessage", data.msg, 2000);
                } else {

                    if (data && data.msg) {
                        flowMessageService.warning("signinMessage", data.msg, 2000);
                    } else {

                        flowMessageService.warning("signinMessage", "Invalid username or password", 2000);
                    }
                }
                flowMessageService.open();
            });

        }
    })
    .controller("indexCtrl", function (sessionService, $location) {
        if (sessionService.isSessionOpened()) {
            window.location = "home.html";
        } else {
            window.location = "signin.html";
        }

    });

