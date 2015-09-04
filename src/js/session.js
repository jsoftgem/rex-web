/**
 * Created by rickzx98 on 8/30/15.
 */
/**
 * Created by Jerico on 7/30/2015.
 */
angular.module("war.session", ["fluid"])
    .config(["$httpProvider", function (hp) {
        hp.interceptors.push('AuthInterceptor');
    }])
    .factory("UserFactory", ["$http", "AuthFactory", function (h, a) {

        var userFactory = {
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


        return userFactory;
    }])
    .factory("AuthFactory", ["sessionService", function (ss) {

        var authFactory = {
            setToken: setToken,
            getToken: getToken,
            setInfo: setInfo,
            getInfo: getInfo,
            withTokenUrl: withTokenUrl,
            removeToken: removeToken,
            removeInfo: removeInfo
        };

        function removeToken() {
            ss.removeSessionProperty("token");
            return this;
        }

        function removeInfo() {
            ss.removeSessionProperty("info");
            return this;
        }

        function withTokenUrl(url) {
            var ret = undefined;
            if (url.indexOf("?") === -1) {
                ret = url + "?token=" + this.getToken();
            } else {
                ret = url + "&token=" + this.getToken();
            }
            return ret;
        }

        function setToken(token) {
            ss.addSessionProperty("token", token);
        }

        function getToken() {
            return ss.getSessionProperty("token");
        }

        function setInfo(info) {
            ss.addSessionProperty("info", info);
        }

        function getInfo() {
            var info = window.atob(ss.getSessionProperty("info"));
            var parsed = JSON.parse(info);
            console.debug("session.info.", parsed);
            return parsed;
        }

        return authFactory;
    }])
    .factory("AuthInterceptor", ["AuthFactory", function (a) {
        return {
            "request": function (config) {
                if (a.getToken()) {
                    config.headers = config.headers || {};
                    config.headers.Authorization = "bearer " + a.getToken();
                    console.debug("AuthInterceptor-token", config);
                }

                if (config.url.indexOf("--fInclude") !== -1) {
                    config.headers = [];
                    config.url = config.url.replace("--fInclude", ""); //fix for fluidInclude bad request
                }


                return config;
            }
        }
    }]);



