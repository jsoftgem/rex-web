(function () {
    'use strict';
    angular.module('war.services')
        .factory('AuthFactory', AuthFactory);

    AuthFactory.$inject = ['sessionService'];

    function AuthFactory() {

        return {
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
    }

})();