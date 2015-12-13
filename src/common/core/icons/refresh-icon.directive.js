(function () {
    'use strict';
    angular.module('war.core')
        .directive('fluidIconRefresh', FluidIconRefresh);

    function FluidIconRefresh() {
        return {
            restrict: "A",
            link: function (scope, element, attr) {
                element.addClass("fa fa-refresh");

                scope.$watch(function () {
                    return attr.loading;
                }, function (loading) {
                    if (loading) {
                        if (loading === 'true') {
                            element.addClass("fa-spin");
                        } else {
                            element.removeClass("fa-spin");
                        }
                    }
                })

            }
        };
    }

})();