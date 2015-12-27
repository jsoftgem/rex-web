(function () {
    'use strict';
    angular.module('war.home')
        .controller('homeCtrl', HomeCtrl);
    HomeCtrl.$inject = ['$scope', 'flowMessageService', 'flowFrameService', 'flowHttpService',
        'userProfile', 'UserFactory', 'userSessionService'];

    function HomeCtrl($scope, flowMessageService, flowFrameService, flowHttpService, userProfile, UserFactory, userSessionService) {
        $scope.userSessionService = userSessionService;
        $scope.userProfile = userProfile;
        $scope.flowFrameService = flowFrameService;
        $scope.taskbar = {};

        $scope.taskbar.getExcessCount = function (limit) {
            return $scope.flowFrameService.taskList.length - limit;
        };

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
        };

        $scope.taskbar.hide = function (task) {
            task.active = false;
            var userTask = {};
            userTask.active = false;
            userTask.flowTaskId = task.id.split("_")[0];
            userTask.flowId = task.flowId;
            flowHttpService.post("services/flow_user_task_crud/save_task_state?field=close", userTask, task);
        };

        $scope.logout = function () {
            flowHttpService.postGlobal("services/logout_service/logoff")
                .success(function () {
                    UserFactory.logout();
                    userProfile.destroyUserProfile();
                });
        };

        $scope.$on("NOT_AUTHENTICATED", function (event, msg) {
            window.location = "signin.html";
            flowMessageService.danger("mainMessage", msg, 2000);
        });

        $scope.editProfile = function () {
            flowFrameService.addTask($scope.userProfile.editTaskUrl);
        }
    }
})();
