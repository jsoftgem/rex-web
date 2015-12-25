(function () {
    'use strict';
    angular.module('war.core')
        .filter("selectAgent", SelectAgent);

    SelectAgent.$inject = ['vendors'];

    function SelectAgent(vendors) {

        return function (input, $select) {
            var filter = {id: $select.selected.id};
            var result = vendors.lodash.filter(input, filter)[0];
            return result;
        };
    }


})();
