(function () {
    'use strict';
    angular.module('war.services')
        .constant('ADMIN', {name: 'admin'})
        .constant('AGENT', {name: 'agent'})
        .constant('REGIONAL_MANAGER', {name: 'agent_regional_manager'})
        .constant('GENERAL_MANAGER', {name: 'agent_general_manager'})
        .constant('WAR_ADMIN', {name: 'warAdmin'})
        .factory('userGroupService', UserGroupService);
    UserGroupService.$inject = ['ADMIN', 'AGENT', 'REGIONAL_MANAGER', 'GENERAL_MANAGER', 'WAR_ADMIN'];

    function UserGroupService(ADMIN, AGENT, REGIONAL_MANAGER, GENERAL_MANAGER, WAR_ADMIN) {
        return {
            getAdmin: getAdmin,
            getAgent: getAgent,
            getRegionalManager: getRegionalManager,
            getGeneralManager: getGeneralManager,
            getWarAdmin: getWarAdmin
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

        function getWarAdmin() {
            return WAR_ADMIN;
        }
    }

})();