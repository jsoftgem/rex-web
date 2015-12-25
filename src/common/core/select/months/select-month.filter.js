(function () {
    'use strict';
    angular.module('war.core')
        .filter("selectMonth", SelectMonth);

    SelectMonth.$inject = ['vendors'];

    function SelectMonth(vendors) {

        return function (input, $select) {
            var filter = {enumForm: $select.selected.enumForm};
            var result = vendors.lodash.filter(input, filter)[0];
            return result;
        };
    }


})();
