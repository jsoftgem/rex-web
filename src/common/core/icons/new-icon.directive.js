(function () {
    'use strict';
    angular.module('war.core')
        .directive('fluidIconNew', FluidIconNew);

    function FluidIconNew() {
        return {
            restrict: "A",
            link: function (scope, element) {
                element.addClass("fa fa-plus");
            }
        }
    }

})();