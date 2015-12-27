(function () {
    'use strict';
    angular.module('war.core')
        .directive('fluidIconEdit', FluidIconEdit);

    function FluidIconEdit() {
        return {
            restrict: "A",
            link: function (scope, element) {
                element.addClass("fa fa-edit");
            }
        }
    }

})();