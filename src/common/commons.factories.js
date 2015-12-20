(function () {
    'use strict';
    angular.module('war.commons')
        .factory('commonFactories', CommonFactories);
    CommonFactories.$inject = ['yearService', 'monthService', 'educationLevelService'];
    function CommonFactories(yearService, monthService, educationLevelService) {
        return {
            yearService: yearService,
            monthService: monthService,
            educationLevelService: educationLevelService
        };
    }

})();
