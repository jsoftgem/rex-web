(function () {
    'use strict';
    angular.module('war.core')
        .directive('fluidIconSave', FluidSaveIcon);

    function FluidSaveIcon() {
        return {
            restrict: "A",
            link: function (scope, element) {
                element.addClass("fa fa-save");
            }
        }
    }

})();