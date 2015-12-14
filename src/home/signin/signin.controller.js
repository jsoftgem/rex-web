(function () {
    'use strict';
    angular.module('war.home')
        .controller('signinCtrl', SigninCtrl);

    SigninCtrl.$inject = ['$scope', 'flowMessageService', 'REX_VERSION', 'UserFactory'];

    function SigninCtrl($scope, flowMessageService, REX_VERSION, UserFactory) {

        $scope.ver = REX_VERSION;

        $scope.login = function (user) {

            UserFactory.login(user)
                .success(function (data) {
                    window.location = "home.html";
                }).error(function (data) {
                flowMessageService.danger("loginMessage", data, 3000).open();
            });
        }
    }
})();
