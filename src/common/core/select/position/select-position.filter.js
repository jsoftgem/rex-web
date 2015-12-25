(function () {
    'use strict';
    angular.module('war.core')
        .filter("selectPosition", SelectPosition);

    SelectPosition.$inject = ['vendors'];

    function SelectPosition(vendors) {

        return function (input, $select) {
            var filter = {id: $select.selected.id};
            var result = vendors.lodash.filter(input, filter)[0];
            return result;
        };
    }


})();
