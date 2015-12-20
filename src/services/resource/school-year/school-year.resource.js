(function () {
    'use strict';
    angular.module('war.resource')
        .factory('SchoolYearResource', SchoolYearResource);

    SchoolYearResource.$inject = ['WarResource'];

    function SchoolYearResource(WarResource) {
        var schoolYearResource = WarResource(withHost("services/war/school_year_query/:path"));
        return {
            getList: getList
        };

        function getList(callBack, error) {
            schoolYearResource.getList(callBack, error);
        }
    }

})();
