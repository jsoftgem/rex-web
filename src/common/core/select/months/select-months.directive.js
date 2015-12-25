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
                ngModel.$render = render;
            }


            function render() {
                scope.selectMonth.month = {enumForm: ngModel.$modelValue};
            }

            function setModelValue(newValue, oldValue) {
                if (newValue !== oldValue) {
                    ngModel.$setViewValue(newValue && newValue.enumForm ? newValue.enumForm : newValue);
                }
            }

            function destroy() {
                scope.selectMonth.destroy();
            }
        }

    }
})();
