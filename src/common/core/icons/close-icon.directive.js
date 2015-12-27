(function () {
    'use strict';
    angular.module('war.core')
        .directive('fluidIconClose', FluidIconClose);

    function FluidIconClose() {
        return {
            restrict: "A",
            link: function (scope, element) {
                element.addClass("fa fa-close");
            }
        }
    }

})();