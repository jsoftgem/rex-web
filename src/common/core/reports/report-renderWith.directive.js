(function () {
    'use strict';
    angular.module('war.core')
        .directive("fluidRenderWidth", FluidRenderWidth);
    function FluidRenderWidth() {
        return {
            restrict: "A",
            scope: {tableId: "@", headerName: "@"},
            link: FluidRenderWidthLink
        };
        function FluidRenderWidthLink(scope, element) {
            scope.$watch(function () {
                var table = $("#" + scope.tableId);
                return table.find("th:contains('" + scope.headerName + "')").width();
            }, function (newValue) {
                var value = newValue + 10;
                element.width(value);
            });
        }
    }

})();