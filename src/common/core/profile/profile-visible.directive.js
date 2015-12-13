(function () {
    'use strict';
    angular.module('war.core')
        .directive('flowProfileVisible', FlowProfileVisible);

    FlowProfileVisible.$inject = ['flowHttpService'];
    function FlowProfileVisible(f) {
        return {
            restrict: 'A',
            scope: {task: "=", profiles: "="},
            link: function (scope, iElement) {
                f.post("services/flow_permission/has_profile", scope.profiles, scope.task).
                success(function (data) {
                    if (data) {
                        iElement.removeClass("hidden");
                    } else {
                        iElement.addClass("hidden");
                    }
                });
            }
        };
    }

})();
