(function () {
    'use strict';
    angular.module('war.session')
        .controller("editProfileCtrl", EditProfileCtrl);

    EditProfileCtrl.$inject = ['$scope', 'userProfile', 'UserFactory'];

    function EditProfileCtrl(s, u, uf) {
        s.task.page.load = function (data) {
            console.debug("editProfile-page.data", data);
            this.title = u.fullName;
            s.task.password = {};
            s.task.flowUserDetail = data;
            s.task.tempData = {};
            s.task.updatePassword = false;
            angular.copy(data, s.task.tempData);
        };

        s.task.validatePassword = function () {
            if (s.task.password.current) {
                s.http.post("session/password_service/validate/", s.task.password.current, uf.getUser().username)
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
        };

        s.task.update = function () {
            console.info("update", s.task.updatePassword);
            if (s.task.updatePassword) {
                if (s.task.password.new) {
                    s.http.post("session/password_service/change_password/", s.task.password.new, uf.getUser().username).
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
    }

})();
