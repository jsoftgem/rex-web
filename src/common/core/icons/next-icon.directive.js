(function () {
    'use strict';
    angular.module('war.core')
        .directive('fluidIconNext', FluidIconNext);

    function FluidIconNext() {
        return {
            restrict: "A",
            link: function (scope, element) {
                element.addClass("fa fa-step-forward");
            }
        }
    }

})();