(function () {
    'use strict';
    angular.module('war.resource')
        .factory('WarAgent', WarAgent);
    WarAgent.$inject = ['WarResource'];
    function WarAgent(WarResource) {
        var warAgent = WarResource(withHost("services/v2/war/agent/:path"));
        warAgent.current = function (fn, errfn) {
            return warAgent.get({path: "current-agent"}, fn, errfn);
        };
        return warAgent;
    }
})();