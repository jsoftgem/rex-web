(function () {
    'use strict';
    angular.module('war.resource')
        .factory('WarAgent', WarAgent);
    WarAgent.$inject = ['WarResource'];
    function WarAgent(WarResource) {

        var resource = WarResource(withHost("services/v2/war/agent/:path"), [], {
            getByRegionCode: {
                url: withHost('services/war/agent_query/find_by_region/:regionCode'),
                method: 'get',
                isArray: true
            },
            getByCurrentLevel: {
                url: withHost('services/war/agent_query/find_agent_by_current_user_level'),
                method: 'get',
                isArray: true
            }
        });

        return {
            current: current,
            getByRegionCode: getByRegionCode,
            getList: getList,
            getByCurrentLevel: getByCurrentLevel
        };

        function current(fn, errfn) {
            return resource.get({path: "current-agent"}, fn, errfn);
        }

        function getByRegionCode(regionCode, callback, error) {
            resource.getByRegionCode({regionCode: regionCode}, callback, error);
        }

        function getList(callBack, errFn) {
            resource.query(callBack, errFn);
        }

        function getByCurrentLevel(callBack, errFn) {
            resource.getByCurrentLevel(callBack, errFn);
        }
    }
})();