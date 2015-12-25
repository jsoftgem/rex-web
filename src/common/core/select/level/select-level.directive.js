(function () {
    'use strict';
    angular.module('war.core')
        .directive('warLevelSelect', WarLevelSelect);

    function WarLevelSelect() {
        return {
            restrict: 'E',
            scope: {
                label: '@'
            },
            require: 'ngModel',
            controller: 'selectLevelCtrl',
            controllerAs: 'selectLevel',
            link: WarLevelSelectLink,
            templateUrl: 'src/common/core/select/level/select-level.html'
        };

        function WarLevelSelectLink(scope, element, attr, ngModel) {
            activate();

            function activate() {
                scope.$on('$destroy', destroy);
                scope.$watch('selectLevel.level', setModelValue);
                ngModel.$render = render;
            }

            function render() {
                scope.selectLevel.level = {id: ngModel.$modelValue};
            }

            function setModelValue(newValue, oldValue) {
                if (oldValue) {
                    if (newValue && (newValue.id !== oldValue.id)) {
                        ngModel.$setViewValue(newValue.id);
                    }
                } else {
                    ngModel.$setViewValue(newValue.id);
                }
            }

            function destroy() {
                scope.selectLevel.destroy();
            }
        }
    }
})();
