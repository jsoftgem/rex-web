(function () {
    'use strict';
    angular.module('war.core')
        .directive('warPositionSelect', WarPositionSelect);

    function WarPositionSelect() {
        return {
            restrict: 'E',
            scope: {label: '@'},
            require: 'ngModel',
            controller: 'selectPositionCtrl',
            controllerAs: 'selectPosition',
            link: WarPositionSelectLink,
            templateUrl: 'src/common/core/select/position/select-position.html'
        };

        function WarPositionSelectLink(scope, element, attr, ngModel) {

            activate();

            function activate() {
                scope.$watch('selectPosition.position', setModelValue);
                scope.$on('$destroy', destroy);
                ngModel.$render = render;
            }

            function render() {
                setPosition();
            }

            function setModelValue(newValue, oldValue) {
                if (newValue !== oldValue) {
                    ngModel.$setViewValue(newValue ? newValue.id : newValue);
                }
            }

            function setPosition() {
                scope.selectPosition.position = {
                    id: (ngModel.$modelValue && ngModel.$modelValue.id ? ngModel.$modelValue.id : ngModel.$modelValue)
                };
            }

            function destroy() {
                scope.selectPosition.destroy();
                ngModel.$setViewValue(undefined);
            }
        }
    }
})();
