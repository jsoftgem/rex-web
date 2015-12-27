(function () {
    'use strict';
    angular.module('war.core')
        .directive("offset", Offset);

    function Offset() {
        return {
            restrict: "A",
            link: function (scope, element, attr) {
                if (attr.offset) {
                    scope.offset = attr.offset;
                }
                if (scope.offset) {
                    element.addClass("col-lg-offset-" + scope.offset)
                        .addClass("col-md-offset-" + scope.offset)
                        .addClass("col-sm-offset-" + scope.offset)
                        .addClass("col-xs-offset-" + scope.offset)
                }
            }
        }
    }
})();
