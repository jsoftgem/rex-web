(function () {
    'use strict';
    angular.module('war.resource')
        .factory('LevelResource', LevelResource);
    LevelResource.$inject = ['WarResource'];
    function LevelResource(WarResource) {
        var levelResource = WarResource(withHost("services/war/level_query/:path"));
        return {
            getList: levelResource.getList
        };
    }
})();
