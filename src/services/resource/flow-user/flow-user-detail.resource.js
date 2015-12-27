(function () {
    'use strict';
    angular.module('war.resource')
        .factory('FlowUserDetail', FlowUserDetail);

    FlowUserDetail.$inject = ['WarResource'];

    function FlowUserDetail(WarResource) {
        var flowUserDetail = WarResource(withHost("services/v2/user/detail/:path"));

        flowUserDetail.currentDetail = function (flowUserId, fn, errfn) {
            return flowUserDetail.get({path: flowUserId}, fn, errfn);
        };

        return flowUserDetail;
    }
})();
