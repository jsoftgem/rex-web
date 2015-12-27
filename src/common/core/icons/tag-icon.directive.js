(function () {
    'use strict';
    angular.module('war.core')
        .directive('fluidIconTag', FluidIconTag);

    function FluidIconTag() {
        return {
            restrict: "A",
            link: function (scope, element) {
                element.addClass("fa fa-tag");
            }
        };
    }

})();