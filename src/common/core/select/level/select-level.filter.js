(function () {
    'use strict';
    angular.module('war.core')
        .filter("selectLevel", SelectLevel);

    SelectLevel.$inject = ['vendors'];

    function SelectLevel(vendors) {
        return function (input, $select) {
            var filter = {id: $select.selected.id};
            return vendors.lodash.filter(input, filter)[0];
        };
    }

})();
