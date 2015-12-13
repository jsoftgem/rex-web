(function () {
    'use strict';
    angular.module('war.services')
        .service('userSessionService', UserSessionService);

    function UserSessionService() {
        this.isReady = function () {
            return this.profileLoaded && this.agentLoaded && this.userTasksLoaded && this.groupLoaded && this.userAppSettingLoaded;
        };

        this.isNotConnected = function () {
            return (this.profileLoaded !== undefined && this.profileLoaded === false) ||
                (this.agentLoaded !== undefined && this.agentLoaded === false) ||
                (this.userTasksLoaded !== undefined && this.userTasksLoaded === false) ||
                (this.groupLoaded !== undefined && this.groupLoaded === false) ||
                (this.userAppSettingLoaded !== undefined && this.userAppSettingLoaded === false);
        };

        this.reload = function () {
            window.location = "home.html";
        };

        return this;
    }

})();