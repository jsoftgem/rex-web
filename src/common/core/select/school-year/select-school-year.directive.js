(function () {
    'use strict';
    angular.module('war.core')
        .directive('warSchoolyearSelect', WarSchoolyearSelect);

    function WarSchoolyearSelect() {
        return {
            restrict: 'E',
            scope: {label: '@', schoolyearModel: '='},
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
            }

            function render() {
                scope.selectSchoolYear.schoolYear = {id: ngModel.$modelValue};
            }

            function setModelValue(newValue, oldValue) {
                if (oldValue) {
                    if (newValue && (newValue.id !== oldValue.id)) {
                        ngModel.$setViewValue(newValue.id);
                    }
                } else {
                    ngModel.$setViewValue(newValue.id);
                }

                setSchoolYearModel(newValue);
            }

            function setSchoolYearModel(schoolYear) {
                scope.schoolyearModel = schoolYear;
                console.debug('setSchoolYearModel', schoolYear);
            }

            function destroy() {
                scope.selectSchoolYear.destroy();
                ngModel.$setViewValue(undefined);
            }
        }
    }
})();
