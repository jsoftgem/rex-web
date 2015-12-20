(function () {
    'use strict';
    angular.module('war.resource')
        .factory('WarResource', WarResource);
    WarResource.$inject = ['$resource'];
    function WarResource($resource) {
        return function (url, param, actions, options) {
            var rs = $resource(url, param, actions, options);
            rs.getAvatarPath = function (fileId) {
                return withHost("services/download_service/getContent/" + fileId);
            };

            rs.getList = function (callBack, error) {
                rs.query({path: "list"}, callBack, error);
            };
            return rs;
        };
    }
})();
