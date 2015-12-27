(function () {
    'use strict';
    angular.module('war.core')
        .service("fnService", FnService);

    FnService.$inject = ['flowFrameService'];
    function FnService(f) {
        this.alerts = [];
        this.top = [];
        this.limit = 5;
        this.exceed = function () {
            return this.top.length > this.limit;
        };
        this.enabled = true;
        this.interval = function (alert) {
            var today = new Date(alert.startDt);
            return jQuery.timeago(today);
        };
        this.openPage = function (alert) {
            var url = "services/flow_task_service/getTask?group-default=true&active=true&name=" + alert.task;

            if (alert.page) {
                url = url + "&page=" + alert.page;
                if (alert.pageParam) {
                    url = url + "&page-path=" + alert.pageParam;
                }
            }

            f.addTask(url, undefined, false);
        };
        return this;
    }

})();
