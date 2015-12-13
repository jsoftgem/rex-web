(function () {
    'use strict';
    angular.module('war.dev')
        .controller('menuCtrl', MenuCtrl);

    MenuCtrl.$inject = ['$scope', 'flowFrameService'];

    function MenuCtrl(s, f) {
        s.addModule = function (module) {
            f.addTask(module.task);
        };

        s.view = "list";

        s.switchView = function (view) {
            s.view = view;
        };

        s.flow.pageCallBack = function (page, data) {
            s.resultData = data;
        };
    }

})();
