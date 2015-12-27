(function () {
    'use strict';
    angular.module('war.core')
        .controller('selectAgentCtrl', SelectAgentCtrl);

    SelectAgentCtrl.$inject = ['WarAgent', 'userProfile', '$q'];

    function SelectAgentCtrl(WarAgent, userProfile, $q) {

        var selectAgent = this;
        selectAgent.getAgents = getAgents;
        selectAgent.destroy = destroy;
        selectAgent.disabled = disabled;

        function getAgents() {
            var deferred = $q.defer();
            selectAgent.agentLoaded = false;
            if (userProfile.isManager()) {
                WarAgent.getByRegionCode(userProfile.getRegionCode(), function (agents) {
                    selectAgent.agents = agents;
                    selectAgent.agentLoaded = true;
                    deferred.resolve(agents);
                }, function (err) {
                    selectAgent.agents = [];
                    selectAgent.agentLoaded = true;
                    deferred.reject(err);
                });
            } else if (userProfile.isAgent() && !userProfile.isManager()) {
                selectAgent.agents = [];
                deferred.resolve([]);
            } else {
                WarAgent.getList(function (agents) {
                    selectAgent.agents = agents;
                    selectAgent.agentLoaded = true;
                    deferred.resolve(agents);
                }, function (err) {
                    selectAgent.agents = [];
                    selectAgent.agentLoaded = true;
                    deferred.reject(err);
                });
            }

            return deferred.promise;
        }

        function disabled() {
            return !(userProfile.isGeneralManager() || userProfile.isManager() || userProfile.isAdmin());
        }

        function destroy() {
            selectAgent.agent = undefined;
            selectAgent.agents = undefined;
        }

    }

})();