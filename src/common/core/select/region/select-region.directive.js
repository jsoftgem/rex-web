(function () {
    'use strict';
    angular.module('war.core')
        .directive('warRegionSelect', WarRegionSelect);
    
    function WarRegionSelect() {
        return {
            restrict: 'E',
            require: 'ngModel',
            scope: {label: '@'},
            controller: 'selectRegionCtrl',
            controllerAs: 'selectRegion',
            templateUrl: 'src/common/core/select/region/select-region.html',
            link: WarRegionSelectLink
        };
        function WarRegionSelectLink(scope, element, attr, ngModel) {

            activate();

            function activate() {
                scope.$on('$destroy', destroy);
                scope.$watch('selectRegion.region', setViewModel);
                ngModel.$render = render;
            }

            function render() {
                scope.selectRegion.region = {regionCode: ngModel.$modelValue};
            }

            function setViewModel(newValue, oldValue) {
                if (oldValue) {
                    if (newValue && (newValue.regionCode !== oldValue.regionCode)) {
                        ngModel.$setViewValue(newValue.regionCode);
                    }
                } else {
                    ngModel.$setViewValue(newValue.regionCode);
                }
            }

            function destroy() {
                scope.selectRegion.destroy();
            }
        }
    }

})();
