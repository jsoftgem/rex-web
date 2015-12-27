(function () {
    'use strict';
    angular.module('war.commons')
        .filter('Month', MonthFilter);
    MonthFilter.$inject = ['$filter', 'monthService'];
    function MonthFilter($filter, monthService) {
        return function (input) {
            var result;
            if (input) {
                var search = input.toUpperCase();
                result = $filter('filter')(monthService.getEnumMonths(), {enumForm: search});
            }
            return result;
        };
    }

})();
