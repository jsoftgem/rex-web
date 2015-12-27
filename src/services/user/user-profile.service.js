(function () {
    'use strict';
    angular.module('war.services')
        .service('userProfile', UserProfile);

    UserProfile.$inject = ['userGroupService'];

    function UserProfile(userGroupService) {
        this.createUserProfile = function (userDetail) {
            console.debug("createUserProfile", userDetail);
            this.fullName = userDetail.fullName;
            this.detailId = userDetail.id;
            this.avatar = withHost("services/download_service/getContent/" + userDetail.avatar);
            this.groupOwner = userDetail.groupOwner;
            this.profiles = userDetail.profiles;
            this.editTaskUrl = "services/flow_task_service/getTask?name=edit_profile&active=true&size=50&showToolBar=false&page=edit_profile&page-path=" + userDetail.id + "&newTask=false";
        };

        this.destroyUserProfile = function () {
            this.fullName = undefined;
            this.username = undefined;
            this.email = undefined;
            this.detailId = undefined;
            this.avatar = undefined;
            this.group = undefined;
            this.groupOwner = undefined;
            this.profiles = undefined;
            this.agent = undefined;
        };

        this.updateProfile = function (userDetail) {
            this.fullName = userDetail.fullName;
            this.avatar = withHost("services/download_service/getContent/" + userDetail.avatar);
        };

        this.isAgent = function () {
            return this.agent && this.agent.id;
        };

        this.isManager = function () {
            return this.isAgent() && this.agent.isManager;
        };

        this.getRegionCode = function () {
            return this.isAgent() ? this.agent.region : null;
        };

        this.isGeneralManager = function () {
            return this.group.groupName == userGroupService.getGeneralManager().name;
        };
        this.isAdmin = function () {
            return this.group.groupName === userGroupService.getAdmin().name;
        };

        return this;
    }

})();
