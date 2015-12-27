(function () {
    'use strict';
    angular.module('war.resource')
        .factory('PositionResource', PositionResource);
    PositionResource.$inject = ['WarResource'];
    function PositionResource(WarResource) {
        var positionResource = WarResource(withHost("services/war/position_query/:path"));
        return {
            getList: positionResource.getList
        };
    }
})();
