/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


angular.module("home", ["flowServices", "ngCookies", "fluid", "ui.bootstrap","flowFactories"])
    .controller("homeCtrl", function ($scope, $cookies, $http, flowMessageService, flowFrameService, flowHttpProvider, $timeout, userProfile) {
        $scope.userProfile = userProfile;
        $scope.flowFrameService = flowFrameService;
        $scope.taskbar = {};
    
        $scope.taskbar.getExcessCount = function(limit){
                return $scope.flowFrameService.taskList.length - limit;
        }
        
        $scope.taskbar.open = function (task) {

                    if (task.active === true) {

                        $(".frame-content").scrollTo($("#_id_fp_" + task.id),800);

                    } else {

                        task.active = true;
                        if (task.id.indexOf("gen") === -1) {
                            $scope.userTask = {};
                            $scope.userTask.flowTaskId = task.id.split("_")[0];
                            $scope.userTask.active = task.active;
                            $scope.userTask.flowId = task.flowId;
                            flowHttpProvider.post("services/flow_user_task_crud/save_task_state?field=active", $scope.userTask, task);

                }
            }
        };

        $scope.taskbar.close = function(task,index){
                var userTask={};
                userTask.closed = true;
                userTask.flowTaskId = task.id.split("_")[0];
                userTask.flowId = task.flowId;
                flowHttpProvider.post("services/flow_user_task_crud/save_task_state?field=close",  userTask,  task);
                flowFrameService.taskList.splice(index,1);
        }

        $scope.taskbar.hide = function(task){
                task.active = false;
                var userTask={};
                userTask.active = false;
                userTask.flowTaskId = task.id.split("_")[0];
                userTask.flowId = task.flowId;
                flowHttpProvider.post("services/flow_user_task_crud/save_task_state?field=close",  userTask,  task);
        }

        $scope.logout = function () {
            
            flowHttpProvider.postGlobal("services/logout_service/logoff")
            .success(function (config) {
                $cookies.authorization = undefined;
                $cookies.remember= false;
                window.location = "signin.html";
            });
        };

        $scope.$on("NOT_AUTHENTICATED", function (event, msg) {
            window.location = "signin.html";
            flowMessageService.danger("mainMessage", msg, 2000);
        });

        $scope.editProfile = function () {
            flowFrameService.addTask($scope.userProfile.editProfileTask,undefined,false);
        }

    })
    .controller("signinCtrl", function ($scope, $http, $cookies, flowMessageService, userSessionService,HOST) {
        $scope.login = function (user) {

        var base64 = window.btoa(user.username+":"+user.password); 


        var request = $http({
            method: "post",
            headers: {'Content-Type': 'application/x-www-form-urlencoded','Authorization':"base64 "+base64},
            data: {username: user.username, password: user.password},
            transformRequest: function (obj) {
                var str = [];
                for (var p in obj)
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            url: HOST+"services/login_service/auth"
        });

        request.success(function (data, status, headers, config) {
            if (data) {
                $cookies.authorization = data.bs64auth;
                $cookies.remember = $scope.user.remember;
                 window.location = "home.html";
            }
        });

        request.error(function (data) {
            if (data) {
                flowMessageService.warning("signinMessage", data.msg, 2000);
            } else {

                if(data && data.msg){
                    flowMessageService.warning("signinMessage", data.msg, 2000);
                }else{

                    flowMessageService.warning("signinMessage", "Invalid username or password", 2000);
                }
            }
            flowMessageService.open();
        });

      }
    })
    .controller("indexCtrl", function($cookies, $location){
            console.log($cookies);
            if($cookies.remember===true){
                if($cookies.authorization){
                   window.location = "home.html";
                }else{
                    window.location = "signin.html";
                }
            }else{
                window.location = "signin.html";
            }
    });

