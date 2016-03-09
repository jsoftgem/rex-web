
(function () {
    'use strict';

    angular.module('war.services')
        .factory('UserFactory', UserFactory);

    UserFactory.$inject = ['$http', 'AuthFactory'];

    function UserFactory(h, a) {

        return {
            login: login,
            logout: logout,
            getUser: getUser,
            isAuthenticated: isAuthenticated
        };

        function login(login) {
            var encodedKey = btoa("loginKey:" + login.username + ":" + login.password);
            return h.post(withHost("session/v2/login"), encodedKey).success(function (data) {
                if (data) {
                    a.setToken(data.token);
                    var info = btoa(JSON.stringify(data.info));
                    a.setInfo(info);
                }
            });
        }

        function logout() {
            a.removeToken().removeInfo();
        }

        function getUser() {
            return a.getInfo();
        }

        function isAuthenticated() {
            return a.getToken() != null;
        }

    }

})();
