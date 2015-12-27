(function () {
    'use strict';
    angular.module('war.core')
        .directive('fluidIconClear', FluidIconClear);

    function FluidIconClear() {
        return {
            restrict: "A",
            link: function (scope, element) {
                element.addClass("fa fa-eraser");
            }
        }
    }

})();