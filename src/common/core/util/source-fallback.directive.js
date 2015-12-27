(function () {
    'use strict';
    angular.module('war.core')
        .directive('fallbackSrc', FallBackSrc);

    function FallBackSrc() {
        return {
            link: function postLink(scope, iElement, iAttrs) {
                iElement.bind('error', function () {
                    angular.element(this).attr("src", iAttrs.fallbackSrc);
                });
            }
        };
    }

})();