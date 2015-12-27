(function () {
    'use strict';
    angular.module('war.core')
        .directive('fluidIconDownload', FluidIconDownload);

    function FluidIconDownload() {
        return {
            restrict: "A",
            link: function (scope, element) {
                element.addClass("fa fa-download");
            }
        }
    }

})();