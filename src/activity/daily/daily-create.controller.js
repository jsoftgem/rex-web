(function () {
    'use strict';
    angular.module('war.activity')
        .controller('dailyCreateCtl', DailyCreateCtl);
    DailyCreateCtl.$inject = ['$scope'];
    function DailyCreateCtl(s) {
        s.save = function () {
            s.flow.action('put', s.task.modelCreate);
        }
    }
})();
