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
            activate();

            function activate() {
                if (attr.label) {
                    element.find('.select-month-label').text(attr.label);
                }
                scope.$on('$destroy', destroy);
                scope.$watch('selectMonth.month', setModelValue);
                scope.selectMonth.getMonth = getMonth;
                ngModel.$render = render;
            }


            function render() {
                scope.selectMonth.month = ngModel.$modelValue;
            }

            function setModelValue(newValue, oldValue) {
                if (newValue !== oldValue) {
                    ngModel.$setViewValue(newValue ? newValue.enumForm : newValue);
                }
            }

            function getMonth(selected) {
                if (!selected) {
                    scope.selectMonth.month = scope.selectMonth.getSearchMonth(ngModel.$viewValue);
                } else {
                    return selected;
                }
            }

            function destroy() {
                scope.selectMonth.destroy();
            }
        }

    }
})();
