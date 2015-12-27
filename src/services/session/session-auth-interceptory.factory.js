(function () {
    'use strict';

    angular.module('war.services')
        .factory('AuthInterceptor', AuthInterceptor);

    AuthInterceptor.$inject = ['AuthFactory', 'APP_KEY'];

    function AuthInterceptor(a, appKey) {
        return {
            "request": function (config) {

                config.headers = config.headers || {};
                config.headers["app_key"] = appKey;

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
        };
    }

})();