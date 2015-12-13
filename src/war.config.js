(function () {
    'use strict';
    angular.module('war.app')
        .config(WarConfig);

    WarConfig.$inject = ['$compileProvider'];

    function WarConfig($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/);
    }

})();