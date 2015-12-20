(function () {

    'use strict';
    angular.module('war.commons')
        .factory('monthService', MonthService);

    MonthService.$inject = ['$q'];

    function MonthService($q) {

        return {
            getMonths: getMonths,
            getEnumMonths: getEnumMonths,
            getMonth: getMonth
        };

        function getMonths(callBack, error) {
            var deferred = $q.defer();
            try {
                deferred.resolve([
                    createMonth('January', 'JAN', 0),
                    createMonth('February', 'FEB', 1),
                    createMonth('March', 'MAR', 2),
                    createMonth('April', 'APR', 3),
                    createMonth('May', 'MAY', 4),
                    createMonth('June', 'JUN', 5),
                    createMonth('July', 'JUL', 6),
                    createMonth('August', 'AUG', 7),
                    createMonth('September', 'SEP', 8),
                    createMonth('October', 'OCT', 9),
                    createMonth('November', 'NOV', 10),
                    createMonth('December', 'DEC', 11)
                ]);
            } catch (err) {
                deferred.reject(err);
            }
            deferred.promise.then(callBack, error);
        }

        function getEnumMonths() {
            var months = [
                createEnumMonth('January', 'JAN', 0),
                createEnumMonth('February', 'FEB', 1),
                createEnumMonth('March', 'MAR', 2),
                createEnumMonth('April', 'APR', 3),
                createEnumMonth('May', 'MAY', 4),
                createEnumMonth('June', 'JUN', 5),
                createEnumMonth('July', 'JUL', 6),
                createEnumMonth('August', 'AUG', 7),
                createEnumMonth('September', 'SEP', 8),
                createEnumMonth('October', 'OCT', 9),
                createEnumMonth('November', 'NOV', 10),
                createEnumMonth('December', 'DEC', 11)
            ];

            return months;
        }

        function getMonth(searchMonth) {
            var months = getEnumMonths();
            var foundMonth;
            if (searchMonth) {
                if (!searchMonth.label) {
                    for (var i = 0; i < months.length; i++) {
                        if (months[i].enumForm === searchMonth.toUpperCase()) {
                            foundMonth = months[i];
                            break;
                        }
                    }
                } else {
                    foundMonth = searchMonth;
                }
            }
            console.debug('foundMonth', searchMonth);
            console.debug('foundMonth', foundMonth);
            return foundMonth;
        }

    }

    function createMonth(label, shortLabel, calendar) {
        return {
            calendar: calendar,
            label: label,
            shortLabel: shortLabel,
            enumForm: label.toUpperCase()
        };
    }

    function createEnumMonth(label, shortLabel, calendar) {
        return {
            calendar: calendar,
            label: label,
            shortLabel: shortLabel,
            enumForm: label.toUpperCase()
        };
    }

})();
