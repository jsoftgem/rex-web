(function () {
    'use strict';
    angular.module('war.services')
        .service('hasProfile', HasProfile);

    HasProfile.$inject = ['flowHttpService'];

    function HasProfile(f) {
        this.check = function (profiles, task) {
            return f.post(this.url, profiles, task);
        };
        return this;
    }
})();