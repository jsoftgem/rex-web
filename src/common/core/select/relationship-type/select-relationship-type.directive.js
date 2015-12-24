(function () {
    'use strict';
    angular.module('war.core')
        .directive('warRelationshiptypeSelect', WarRelationshipTypeSelect);

    function WarRelationshipTypeSelect() {
        return {
            restrict: 'E',
            scope: {label: '@'},
            require: 'ngModel',
            controller: 'selectRelationshipTypeCtrl',
            controllerAs: 'selectRelationshipType',
            link: WarRelationshipTypeSelectLink,
            templateUrl: 'src/common/core/select/relationship-type/select-relationship-type.html'
        };

        function WarRelationshipTypeSelectLink(scope, element, attr, ngModel) {

            activate();

            function activate() {
                scope.$watch('selectRelationshipType.relationshipType', setModelValue);
                scope.$on('$destroy', destroy);
                ngModel.$render = render;
            }

            function render() {
                setRelationshipType();
            }

            function setModelValue(newValue, oldValue) {
                if (newValue !== oldValue) {
                    ngModel.$setViewValue(newValue);
                }
            }

            function setRelationshipType() {
                scope.selectRelationshipType.relationshipType = ngModel.$modelValue;
            }

            function destroy() {
                scope.selectRelationshipType.destroy();
                ngModel.$setViewValue(undefined);
            }
        }
    }
})();
