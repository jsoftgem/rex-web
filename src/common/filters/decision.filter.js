(function () {
    'use strict';
    angular.module('war.commons')
        .filter('decision', Decision);

    function Decision() {
        return function (input) {
            if (input) {
                return input ? 'yes' : 'no';
            }
            return 'no';
        }
    }
})();
