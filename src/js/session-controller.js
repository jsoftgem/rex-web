/**
 * Created by Jerico on 12/15/2014.
 */
angular.module("sessionControllers", ["fluid", "ngResource", "datatables", "flowServices", "truncate",
    "ngCookies"])
    .controller("editProfileCtrl", ["$scope", "userProfile", function (s, u) {
        s.task.page.load = function (data) {
            this.title = u.fullName;
            s.task.password = {};
            s.task.flowUserDetail = data;
            s.task.tempData = {};
            s.task.updatePassword = false;
            angular.copy(data, s.task.tempData);
        }


        s.task.validatePassword = function () {
            if (s.task.password.current) {
                s.http.post("session/password_service/validate/", s.task.password.current, u.username)
                    .success(function (valid) {
                        s.task.showChangePasswordField = valid;
                        s.task.showInvalidPassword = !valid;
                    }).error(function () {
                        s.task.showInvalidPassword = true;
                    });
            }
        };

        s.task.changePassword = function () {
            s.task.updatePassword = !s.task.updatePassword;
            s.task.showChangePasswordField = false;
            s.task.password = {};
        }

        s.task.update = function () {
            console.info("update", s.task.updatePassword);
            if (s.task.updatePassword) {
                if (s.task.password.new) {
                    s.http.post("session/password_service/change_password/", s.task.password.new, u.username).
                        success(function (data) {
                            s.flow.message.success("Password has been changed.");
                            s.task.changePassword();
                        })
                        .error(function (msg) {
                            //TODO: add error
                        });
                }
            }

            if (!angular.equals(s.task.flowUserDetail, s.task.tempData)) {
                s.flow.action("put", s.task.flowUserDetail, s.task.flowUserDetail.id);
            } else {
                if (!s.task.updatePassword) {
                    s.flow.message.info(UI_MESSAGE_NO_CHANGE);
                }
            }


        };

        s.$on(s.flow.event.getSuccessEventId(), function (event, data, method) {
            if (method === "put") {
                u.updateProfile(s.task.flowUserDetail);
                s.task.tempData = {};
            }


        });


    }])
    .controller("notificationCtrl", ["$scope", "userProfile", "fnService", "$rootScope", function (s, u, fs, rs) {
        s.fs = fs;


        s.back = function () {
            rs.$broadcast(s.flow.getEventId('back'));
        }

        s.open = function (alert) {
            s.flow.goTo("notification_view", alert.id);
        }

        s.getMessageTypeGlyph = function (alert) {
            if (alert.messageType === "danger") {
                return "fa fa-exclamation";
            } else if (alert.messageType === "info") {
                return "fa fa-info"
            } else if (alert.messageType === "warning") {
                return "fa fa-warning"
            } else if (alert.messageType === "success") {
                return "fa fa-check"
            }
        };

        s.getLabelScheme = function (alert) {
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

        s.getPanelScheme = function (alert) {
            if (alert.messageType === "danger") {
                return "panel panel-danger";
            } else if (alert.messageType === "info") {
                return "panel panel-info"
            } else if (alert.messageType === "warning") {
                return "panel panel-warning"
            } else if (alert.messageType === "success") {
                return "panel panel-success"
            }
        };


        s.getTypeIcon = function (alert) {
            if (alert.alarmType === "silent") {
                return "fa fa-bell-slash-o";
            } else if (alert.alarmType === "system") {
                return "fa fa-gears";
            } else if (alert.alarmType === "message") {
                return "fa fa-envelope-o";
            } else if (alert.alarmType === "notice") {
                return "fa fa-info-circle";
            } else if (alert.alarmType === "broadcast") {
                return "fa fa-globe";
            }
        };

        s.flow.pageCallBack = function (page, data) {
            if (page === "notification_view") {
                s.data = data;
            }
            else if (page === "notification_center") {
                s.data = data;
            }
        }

    }]);
