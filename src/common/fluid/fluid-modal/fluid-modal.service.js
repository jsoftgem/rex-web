(function () {
    'use strict';
    angular.module('war.commons')
        .service("flowModalService", FlowModalService);

    FlowModalService.$inject = ['$timeout'];

    function FlowModalService($timeout) {
        var flowModalService = {};
        flowModalService.show = function (id, onShown, backdrop) {
            if (!backdrop) {
                backdrop = false;
            }
            $("#" + id).modal({show: true, backdrop: backdrop});
            if (onShown) {
                $("#" + id).on('shown.bs.modal', $timeout(onShown));
            }
        };
        flowModalService.hide = function (id, sourceId, onHidden) {
            $("#" + id).modal("toggle");
            if (onHidden) {
                $("#" + id).on('hidden.bs.modal', $timeout(onHidden));
            }
        };
        return flowModalService;
    }

})();
