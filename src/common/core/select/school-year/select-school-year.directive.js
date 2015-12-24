(function () {
    'use strict';
    angular.module('war.core')
        .directive('warSchoolyearSelect', WarSchoolyearSelect);

    function WarSchoolyearSelect() {
        return {
            restrict: 'E',
            scope: true,
            require: 'ngModel',
            controller: 'selectSchoolYearCtrl',
            controllerAs: 'selectSchoolYear',
            link: WarSchoolyearSelectLink,
            templateUrl: 'src/common/core/select/school-year/select-school-year.html'
        };

        function WarSchoolyearSelectLink(scope, element, attr, ngModel) {

            activate();

            function activate() {
                scope.$watch('selectSchoolYear.schoolYear', setModelValue);
                scope.$on('$destroy', destroy);
                ngModel.$render = render;
                if (attr.label) {
                    element.find('.select-schoolYear-label').text(attr.label);
                }
            }

            function render() {
                setSchoolYear();
            }

            function setModelValue(newValue, oldValue) {
                if (newValue !== oldValue) {
                    ngModel.$setViewValue(newValue);
                }
            }
            function setSchoolYear() {
                scope.selectSchoolYear.schoolYear = ngModel.$modelValue;
            }

            function destroy() {
                scope.selectSchoolYear.destroy();
                ngModel.$setViewValue(undefined);
            }
        }
    }
})();
