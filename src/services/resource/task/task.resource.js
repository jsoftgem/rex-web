(function () {
    'use strict';
    angular.module('war.resource')
        .factory('TaskResource', TaskResource);
    TaskResource.$inject = ['WarResource'];

    function TaskResource(WarResource) {
        var taskResource = WarResource(withHost("services/v2/task/:path"));

        taskResource.getSessionTasks = function (fn, errfn) {
            return taskResource.query({path: "user"}, fn, errfn);
        };

        return taskResource;
    }
})();
