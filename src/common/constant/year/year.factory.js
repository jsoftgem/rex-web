(function () {
    'use strict';

    angular.module('war.commons')
        .factory('yearService', YearService);

    YearService.$inject = ['$q', 'YEAR_START', 'YEAR_PERIOD'];

    function YearService($q, YEAR_START, YEAR_PERIOD) {

        return {
            getYears: getYears
        };

        function getYears(callback, error) {
            var deferred = $q.defer();
            try {
                var from = YEAR_START;
                var to = new Date().getFullYear() + YEAR_PERIOD;
                var years = [];
                for (var i = from; i < to; i++) {
                    years.push(i);
                }
                console.debug('years', years);
                deferred.resolve(years);
            } catch (err) {
                deferred.reject(err);
            }
            return deferred.promise.then(callback, error);
        }
    }

})();
