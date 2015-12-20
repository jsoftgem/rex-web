(function () {
    'use strict';
    angular.module('war.core')
        .directive('warSelectMonths', WarSelectMonths);

    function WarSelectMonths() {
        return {
            restrict: 'E',
            scope: true,
            require: 'ngModel',
            controller: 'selectMonthCtrl',
            controllerAs: 'selectMonth',
            link: WarSelectMonthsLink,
            templateUrl: 'src/common/core/select/months/select-months.html'
        };

        function WarSelectMonthsLink(scope, element, attr, ngModel) {
            if (attr.label) {
                element.find('.select-month-label').text(attr.label);
            }
            scope.$watch('selectMonth.month', setModelValue);
            scope.selectMonth.getMonth = getMonth;
            function setModelValue(newValue) {
                ngModel.$setViewValue(newValue ? newValue.enumForm : newValue);
            }

            function getMonth(selected) {
                if (!selected) {
                    scope.selectMonth.month = scope.selectMonth.getSearchMonth(ngModel.$viewValue);
                } else {
                    return selected;
                }
            }
        }

    }
})();
