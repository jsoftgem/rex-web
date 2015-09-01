/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


angular.module("flowServices", ["fluid"])
    .service("userSessionService", [function () {

        this.isReady = function () {
            return this.profileLoaded && this.agentLoaded && this.userTasksLoaded && this.groupLoaded;
        };

        this.isNotConnected = function () {
            return this.profileLoaded === false || this.agentLoaded === false || this.userTasksLoaded === false || this.groupLoaded === false;
        };


        this.reload = function () {
            window.location = "home.html";
        };

        return this;
    }])
    .service("userProfile", ["flowHttpService", function (f) {

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

        return this;
    }])
    .service("userAppSetting", ["flowHttpService", function (f) {

        this.menu = "sidebar-default";

        this.style = "style1";

        this.theme = "yellow-blue";

        this.bgColor = "#FF6A6A";

        this.url = "session/flow_user_app_setting_session";

        this.hideMenu = false;

        this.layout = "FLUIDSCREEN";

        this.createAppSetting = function () {
            return f.getGlobal(this.url + "/setting");
        };


        this.updateSetting = function (query) {

            var appSetting = {};
            var value = undefined;
            if (query === "menu") {
                value = this.menu;
            } else if (query === "theme") {
                value = this.theme;
            } else if (query === "style") {
                value = this.style;
            } else if (query === "hideMenu") {
                value = this.hideMenu;
            } else if (query === "layout") {
                value = this.layout;
            }

            var url = this.url + "/update?" + query + "=" + value;

            f.putGlobal(url, appSetting)
                .success(function (data) {

                });
        };

        return this;

    }])
    .service("hasProfile", ["flowHttpService", function (f) {

        this.check = function (profiles, task) {
            return f.post(this.url, profiles, task);
        }
        return this;
    }])
    .service("imageService", ["flowHttpService", function (f) {

        this.url = "services/download_service/getContent/";

        this.getAvatar = function (id) {
            return id ? f.host + this.url + id : '../images/gallery/profile_default.png';
        };

        return this;
    }]);
