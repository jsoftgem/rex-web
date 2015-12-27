(function () {
    'use strict';
    angular.module('war.commons')
        .filter('position', Position);
    Position.$inject = ['flowHttpService'];

    function Position(f) {
        return function (input) {
            if (input) {
                return f.getGlobal(s.getPositionName + input, false).success(function (data) {
                    console.log(data);
                    return data;
                }).error(function () {
                    return 'none'
                });
            } else {
                return 'none';
            }
        };
    }
})();