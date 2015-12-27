(function () {
    'use strict';
    angular.module('war.core')
        .directive('fluidIconAttach', FluidIconAttach);

    function FluidIconAttach() {
        return {
            restrict: "A",
            link: function (scope, element) {
                element.addClass("fa fa-paperclip");
            }
        }
    }

})();