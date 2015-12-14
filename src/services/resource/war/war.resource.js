(function () {
    'use strict';
    angular.module('war.resource')
        .factory('WarResource', WarResource);
    WarResource.$inject = ['$resource'];
    function WarResource($resource) {
        return function (options) {
            var rs = $resource(options);
            rs.getAvatarPath = function (fileId) {
                return withHost("services/download_service/getContent/" + fileId);
            };
            return rs;
        };
    }
})();
