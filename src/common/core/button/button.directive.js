(function () {
    'use strict';
    angular.module('war.core')
        .directive('button', Button);

    function Button() {
        return {
            restrict: 'A',
            link: function (scope, iElement, iAttrs) {
                if (iAttrs.sizeClass) {
                    iElement.addClass(iAttrs.sizeClass);
                }
                iElement.addClass("btn");
                if (iAttrs.info) {
                    iElement.attr("type", iAttrs.info);
                    iElement.addClass("btn-info");
                } else if (iAttrs.warning) {
                    iElement.attr("type", iAttrs.warning);
                    iElement.addClass("btn-warning");
                } else if (iAttrs.danger) {
                    iElement.attr("type", iAttrs.danger);
                    iElement.addClass("btn-danger");
                } else if (iAttrs.primary) {
                    iElement.attr("type", iAttrs.primary);
                    iElement.addClass("btn-primary");
                } else {
                    iElement.attr("type", "button");
                    iElement.addClass("btn-default");
                }

                iElement.addClass("btn-lg");

            }
        };
    }
})();

