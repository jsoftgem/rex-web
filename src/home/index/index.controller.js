(function () {
    'use strict';
    angular.module('war.home')
        .controller("indexCtrl", IndexCtrl);
    IndexCtrl.$inject = ['UserFactory'];
    function IndexCtrl(UserFactory) {
        if (UserFactory.isAuthenticated()) {
            window.location = "home.html";
        } else {
            window.location = "signin.html";
        }
    }
})();
