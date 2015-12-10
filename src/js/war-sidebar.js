/**
 * Created by rickzx98 on 8/31/15.
 */
angular.module("war.sidebar", [])
    .controller("sidebarCtl", ["$scope", "UserFactory", "userProfile", "userAppSetting", function (scope, UserFactory, up, uas) {
        scope.userProfile = up;
        scope.userFactory = UserFactory;
        scope.appSetting = uas;
    }]);