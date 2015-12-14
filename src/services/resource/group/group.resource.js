(function () {
    'use strict';
    angular.module('war.resource')
        .factory('GroupResource', GroupResource);

    GroupResource.$inject = ['WarResource'];

    function GroupResource(WarResource) {
        var groupResource = WarResource(withHost("services/v2/user/group/:path"));
        groupResource.getByName = function (name, fn, errfn) {
            groupResource.get({path: "by-name", name: name}, fn, errfn);
        };
        return groupResource;
    }
})();
