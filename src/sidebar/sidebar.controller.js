(function () {
    'use strict';
    angular.module('war.sidebar')
        .controller('sidebarCtl', SidebarCtrl);

    SidebarCtrl.$inject = ['$scope', 'UserFactory', 'userProfile', 'userAppSetting'];

    function SidebarCtrl(scope, UserFactory, up, uas) {
        scope.userProfile = up;
        scope.userFactory = UserFactory;
        scope.appSetting = uas;
    }

})();
