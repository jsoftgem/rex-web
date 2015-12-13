(function () {
    'use strict';
    angular.module('war.core')
        .directive('fluidIconCheck', FluidIconCheck);

    function FluidIconCheck() {
        return {
            restrict: "A",
            link: function (scope, element) {
                element.addClass("fa fa-check text-success");
            }
        };
    }

})();