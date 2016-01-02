(function () {
    'use strict';
    angular.module('war.core')
        .filter("selectRegion", SelectRegion);

    SelectRegion.$inject = ['vendors'];

    function SelectRegion(vendors) {

        return function (input, $select) {
            var filter = {regionCode: $select.selected.regionCode};
            var result = vendors.lodash.filter(input, filter)[0];
            return result;
        };
    }


})();
