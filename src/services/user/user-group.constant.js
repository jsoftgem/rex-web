(function () {
    'use strict';
    angular.module('war.services')
        .constant('ADMIN', {name: 'admin'})
        .constant('AGENT', {name: 'agent'})
        .constant('REGIONAL_MANAGER', {name: 'agent_regional_manager'})
        .constant('GENERAL_MANAGER', {name: 'agent_general_manager'})
        .factory('userGroupService', UserGroupService);
    UserGroupService.$inject = ['ADMIN', 'AGENT', 'REGIONAL_MANAGER', 'GENERAL_MANAGER'];

    function UserGroupService(ADMIN, AGENT, REGIONAL_MANAGER, GENERAL_MANAGER) {
        return {
            getAdmin: getAdmin,
            getAgent: getAgent,
            getRegionalManager: getRegionalManager,
            getGeneralManager: getGeneralManager
        };

        function getAdmin() {
            return ADMIN;
        }

        function getAgent() {
            return AGENT;
        }

        function getRegionalManager() {
            return REGIONAL_MANAGER;
        }

        function getGeneralManager() {
            return GENERAL_MANAGER;
        }
    }

})();