(function () {
    'use strict';
    angular.module('war.services')
        .service('userAppSetting', UserAppSetting);

    UserAppSetting.$inject = ['flowHttpService'];

    function UserAppSetting(f) {

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
    }

})();
