(function () {
    'use strict';

    angular.module('war.commons')
        .filter('setDecimal', SetDecimal);

    function SetDecimal() {
        return function (input, places) {
            if (isNaN(input)) return input;
            var factor = '1' + Array(+(places > 0 && places + 1)).join('0');
            return Math.round(input * factor) / factor;
        };
    }

})();