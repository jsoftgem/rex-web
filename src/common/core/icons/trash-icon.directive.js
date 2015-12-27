(function () {
    'use strict';
    angular.module('war.core')
        .directive('fluidIconTrash', FluidIconTrash);

    function FluidIconTrash() {
        return {
            restrict: "A",
            link: function (scope, element) {
                element.addClass("fa fa-trash-o");
            }
        }
    }

})();