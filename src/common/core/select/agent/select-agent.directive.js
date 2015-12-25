(function () {
    'use strict';
    angular.module('war.core')
        .directive('warAgentSelect', WarAgentSelect);
    WarAgentSelect.$inject = ['$filter'];
    function WarAgentSelect($filter) {
        return {
            restrict: 'E',
            require: 'ngModel',
            scope: {label: '@', agentModel: '='},
            controller: 'selectAgentCtrl',
            controllerAs: 'selectAgent',
            templateUrl: 'src/common/core/select/agent/select-agent.html',
            link: WarAgentSelectLink
        };
        function WarAgentSelectLink(scope, element, attr, ngModel) {

            activate();

            function activate() {
                scope.$on('$destroy', destroy);
                scope.$watch('selectAgent.agent', setViewModel);
                ngModel.$render = render;
            }

            function render() {
                scope.selectAgent.agent = {id: ngModel.$modelValue};
            }

            function setViewModel(newValue, oldValue) {
                if (oldValue) {
                    if (newValue && (newValue.id !== oldValue.id)) {
                        ngModel.$setViewValue(newValue.id);
                    }
                } else {
                    ngModel.$setViewValue(newValue.id);
                }
                scope.agentModel = newValue
            }

            function destroy() {
                scope.selectAgent.destroy();
            }
        }
    }

})();
