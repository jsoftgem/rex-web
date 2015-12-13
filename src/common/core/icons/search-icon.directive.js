(function () {
    'use strict';
    angular.module('war.core')
        .directive('fluidIconSearch', FluidIconSearch);

    function FluidIconSearch() {
        return {
            restrict: "A",
            link: function (scope, element) {
                element.addClass("fa fa-search");
            }
        }
    }

})();