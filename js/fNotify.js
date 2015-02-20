angular.module("fNotify", ["fluid", "truncate"])
    .directive("fnBar", ["fnService", "$timeout", "flowHttpProvider", "flowFrameService", function (fs, t, f, frs) {
        return {

            restrict: "AE",

            replace: true,

            templateUrl: "templates/fluid/fluidNotify.html",

            link: function (scope) {
                scope.fs = fs;

                scope.openNotificationCenter = function () {

                    var url = "services/flow_task_service/getTask?name=notification&active=true&size=50&showToolBar=false";

                    frs.addTask(url, undefined, false);
                };

                scope.open = function (alert) {
                    f.putGlobal("session/notification/notify", alert);

                    var url = "services/flow_task_service/getTask?name=notification&active=true&size=50&showToolBar=false&page=notification_view&page-path=" + alert.id;

                    frs.addTask(url, undefined, false);
                };

                scope.getMessageTypeGlyph = function (alert) {
                    if (alert.messageType) {
                        if (alert.messageType === "danger") {
                            return "fa fa-exclamation";
                        } else if (alert.messageType === "info") {
                            return "fa fa-info"
                        } else if (alert.messageType === "warning") {
                            return "fa fa-warning"
                        } else if (alert.messageType === "success") {
                            return "fa fa-check"
                        }
                    }

                };

                scope.getLabelScheme = function (alert) {
                    if (alert.messageType === "danger") {
                        return "label label-danger";
                    } else if (alert.messageType === "info") {
                        return "label label-info"
                    } else if (alert.messageType === "warning") {
                        return "label label-warning"
                    } else if (alert.messageType === "success") {
                        return "label label-success"
                    }
                };


                f.getGlobal(scope.fs.url, false).success(function (alerts) {
                    scope.fs.alerts = alerts;
                });

                f.getGlobal(scope.fs.topUrl, false).success(function (top) {
                    scope.fs.top = top;
                });


                scope.notificationPoll = function () {

                    t(function () {
                        f.getGlobal(scope.fs.url, false).success(function (alerts) {
                            scope.fs.alerts = alerts;
                            scope.notificationPoll();
                        });
                    }, 10000);
                };


                scope.topChecks = function () {
                    t(function () {
                        f.getGlobal(scope.fs.topUrl, false).success(function (top) {
                            scope.fs.top = top;
                            scope.topChecks();
                        });
                    }, 10000);
                };

                scope.topChecks();
                scope.notificationPoll();

            }

        }

    }])
    .service("fnService", ["flowFrameService", function (f) {

        this.alerts = [];
        this.top = [];

        this.limit = 5;

        this.exceed = function () {
            return this.top.length > this.limit;
        };

        this.enabled = true;

        this.interval = function (alert) {
            var today = new Date(alert.startDt);
            return jQuery.timeago(today);
        };

        this.openPage = function (alert) {
            var url = "services/flow_task_service/getTask?group-default=true&active=true&name=" + alert.task;

            if (alert.page) {
                url = url + "&page=" + alert.page;
                if (alert.pageParam) {
                    url = url + "&page-path=" + alert.pageParam;
                }
            }

            f.addTask(url, undefined, false);
        };

        return this;

    }]);