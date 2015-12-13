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
                    console.debug("session.info", data.info);
                    console.debug("session.encrypted", info);
                    a.setInfo(info);
                    //navigate to home
                }
            });
        }

        function logout() {
            a.removeToken().removeInfo();
            // navigate to login  screen
        }

        function getUser() {
            return a.getInfo();
        }

        function isAuthenticated() {
            return a.getToken() != null;
        }

    }

})();
