(function () {
    'use strict';
    angular.module('war.core')
        .directive('warEducationlevelSelect', WarEducationLevelSelect);

    function WarEducationLevelSelect() {
        return {
            restrict: 'E',
            scope: {
                label: '@'
            },
            require: 'ngModel',
            controller: 'selectEducationLevelCtrl',
            controllerAs: 'selectEducationLevel',
            link: WarEducationLevelSelectLink,
            templateUrl: 'src/common/core/select/education-level/select-education-level.html'
        };

        function WarEducationLevelSelectLink(scope, element, attr, ngModel) {
            activate();

            function activate() {
                scope.$on('$destroy', destroy);
                scope.$watch('selectEducationLevel.educationLevel', setModelValue);
                ngModel.$render = render;
            }

            function render() {
                scope.selectEducationLevel.educationLevel = ngModel.$modelValue;
            }

            function setModelValue(newValue, oldValue) {
                if (newValue !== oldValue) {
                    ngModel.$setViewValue(newValue);
                }
            }

            function destroy() {
                scope.selectEducationLevel.destroy();
            }
        }
    }
})();
