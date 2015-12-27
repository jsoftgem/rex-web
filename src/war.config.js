(function () {
    'use strict';
    angular.module('war.app')
        .config(WarConfig);

    WarConfig.$inject = ['$compileProvider', 'uiSelectConfig'];

    function WarConfig($compileProvider, uiSelectConfig) {
        uiSelectConfig.theme = 'bootstrap';
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/);
    }

})();