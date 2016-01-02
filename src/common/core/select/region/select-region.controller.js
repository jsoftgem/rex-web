(function () {
    'use strict';
    angular.module('war.core')
        .controller('selectRegionCtrl', SelectRegionCtrl);

    SelectRegionCtrl.$inject = ['RegionResource', 'userProfile', '$q'];

    function SelectRegionCtrl(RegionResource, userProfile, $q) {

        var selectRegion = this;
        selectRegion.getRegions = getRegions;
        selectRegion.destroy = destroy;

        function getRegions() {
            var deferred = $q.defer();
            selectRegion.regionLoaded = false;
            RegionResource.getList(function (regions) {
                selectRegion.regions = regions;
                selectRegion.regionLoaded = true;
                deferred.resolve(regions);
            }, function (err) {
                selectRegion.regions = [];
                selectRegion.regionLoaded = true;
                deferred.reject(err);
            });

            return deferred.promise;
        }

        function destroy() {
            selectRegion.region = undefined;
            selectRegion.regions = undefined;
        }

    }

})();