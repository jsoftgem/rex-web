(function () {
    'use strict';
    angular.module('war.core')
        .controller('selectMonthCtrl', SelectMonthCtrl);

    SelectMonthCtrl.$inject = ['monthService'];
    function SelectMonthCtrl(monthService) {
        var selectMonth = this;
        selectMonth.getMonths = getMonths;
        selectMonth.getSearchMonth = monthService.getMonth;
        selectMonth.destroy = destroy;

        function getMonths() {
            monthService.getMonths(function (months) {
                selectMonth.months = months;
            }, function () {
                selectMonth.months = months;
            })
        }

        function destroy() {
            selectMonth.months = undefined;
            selectMonth.month = undefined;
        }
    }


})();
