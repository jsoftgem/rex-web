(function () {
    'use strict';
    angular.module('war.commons')
        .directive('flowModal', FlowModal);

    FlowModal.$inject = ['flowFrameService', 'flowModalService'];
    function FlowModal(f, fm) {
        return {
            restrict: 'AE',
            templateUrl: 'src/common/fluid/fluid-modal/fluid-modal.html',
            replace: true,
            transclude: true,
            link: function (scope, element, attr) {
                scope.flowFrameService = f;
                scope.style = {};

                if (attr.height) {
                    scope.style.height = attr.height;
                }

                if (attr.width) {
                    scope.style.width = attr.width;
                }

                scope.hide = function () {
                    fm.hide(attr.id);
                }
            }
        }
    }

})();
