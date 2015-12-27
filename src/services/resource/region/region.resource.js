(function () {
    'use strict';
    angular.module('war.resource')
        .factory('RegionResource', RegionResource);
    RegionResource.$inject = ['WarResource'];
    function RegionResource(WarResource) {
        var regionResource = WarResource(withHost("services/war/region_query/:path"));
        return {
            getList: regionResource.getList
        };
    }
})();
