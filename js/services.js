/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


angular.module("flowServices", ["fluid"])
    .service("userSessionService", [function () {

        this.createUserSession = function (username, bs64auth) {
            this.username = username;
            this.authorization = bs64auth;
        }
        this.destroyUserSession = function () {
            this.username = undefined;
            this.authorization = undefined;
        }

        return this;
    }])
    .service("userProfile", ["flowHttpService", function (f) {

        this.createUserProfile = function (userDetail) {
            this.fullName = userDetail.fullName;
            this.username = userDetail.username;
            this.email = userDetail.email;
            this.detailId = userDetail.detailId;
            this.avatar = f.host + "services/download_service/getContent/" + userDetail.avatar;
            this.group = userDetail.group;
            this.groupEmblem = f.host + userDetail.groupEmblem;
            this.groupOwner = userDetail.groupOwner;
            this.profiles = userDetail.profiles;
            this.editProfileTask = userDetail.editProfileTask;
            this.agent = userDetail.agent;

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
            this.avatar = f.host + "services/download_service/getContent/" + userDetail.avatar;
        };

        return this;
    }])
    .service("notificationService", ["flowHttpService", function (f) {
        this.queueUrl = "session/notification/queue";


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
        }


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
        }

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
            return f.host + this.url + id;
        }

        return this;
    }]);
