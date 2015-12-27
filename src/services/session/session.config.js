(function () {
    'use strict';
    angular.module('war.services')
        .config(SessionConfig);

    SessionConfig.$inject = ['$httpProvider'];

    function SessionConfig(hp) {
        hp.interceptors.push('AuthInterceptor');
    }

})();
