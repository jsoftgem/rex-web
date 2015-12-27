(function () {
    'use strict';
    angular.module('war.core')
        .directive('fnBar', FnBar);
    FnBar.$inject = ['fnService', '$timeout', 'flowHttpService', 'flowFrameService'];
    function FnBar(fs, t, f, frs) {
        return {
            restrict: 'AE',
            replace: true,
            templateUrl: 'src/common/core/notify/fluidNotify.html',
            link: function (scope) {
                scope.fs = fs;
                scope.openNotificationCenter = function () {
                    var url = 'services/flow_task_service/getTask?name=notification&active=true&size=50&showToolBar=false';
                    frs.addTask(url, undefined, false);
                };

                scope.open = function (alert) {
                    f.putGlobal('session/notification/notify', alert);

                    var url = 'services/flow_task_service/getTask?name=notification&active=true&size=50&showToolBar=false&page=notification_view&page-path=' + alert.id;

                    frs.addTask(url, undefined, false);
                };

                scope.getMessageTypeGlyph = function (alert) {
                    if (alert.messageType) {
                        if (alert.messageType === 'danger') {
                            return 'fa fa-exclamation';
                        } else if (alert.messageType === 'info') {
                            return 'fa fa-info'
                        } else if (alert.messageType === 'warning') {
                            return 'fa fa-warning'
                        } else if (alert.messageType === 'success') {
                            return 'fa fa-check'
                        }
                    }

                };

                scope.getLabelScheme = function (alert) {
                    if (alert.messageType === 'danger') {
                        return 'label label-danger';
                    } else if (alert.messageType === 'info') {
                        return 'label label-info'
                    } else if (alert.messageType === 'warning') {
                        return 'label label-warning'
                    } else if (alert.messageType === 'success') {
                        return 'label label-success'
                    }
                };


                f.getGlobal(scope.fs.url, false).success(function (alerts) {
                    scope.fs.alerts = alerts;
                });

                f.getGlobal(scope.fs.topUrl, false).success(function (top) {
                    scope.fs.top = top;
                });


                scope.notificationPoll = function () {

                    f.getGlobal(scope.fs.url, false).success(function (alerts) {
                        scope.fs.alerts = alerts;
                        t(scope.notificationPoll, 10000);
                    });
                };


                scope.topChecks = function () {
                    f.getGlobal(scope.fs.topUrl, false).success(function (top) {
                        scope.fs.top = top;
                        t(scope.topChecks, 10000);
                    });
                };
                /*
                 scope.topChecks();
                 scope.notificationPoll();*/

            }

        }
    }
})();
