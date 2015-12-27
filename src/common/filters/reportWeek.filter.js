(function () {
    'use strict';
    angular.module('war.commons')
        .filter('reportWeek', ReportWeek);

    function ReportWeek() {
        return function (input) {
            var week = {};
            if (input > 0) {
                week.selectedWeek = input;
            }
            return week;
        }
    }

})();
