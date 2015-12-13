(function () {
    'use strict';
    angular.module('war.core')
        .directive('fluidIconBack', FluidIconBack);

    function FluidIconBack() {
        return {
            restrict: "A",
            link: function (scope, element) {
                element.addClass("fa fa-step-backward");
            }
        }
    }

})();