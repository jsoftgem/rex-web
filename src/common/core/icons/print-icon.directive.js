(function () {
    'use strict';
    angular.module('war.core')
        .directive('fluidIconPrint', FluidIconPrint);

    function FluidIconPrint() {
        return {
            restrict: "A",
            link: function (scope, element) {
                element.addClass("fa fa-print");
            }
        }
    }

})();