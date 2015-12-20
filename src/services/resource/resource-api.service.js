(function () {
    'use strict';
    angular.module('war.resource').factory('resourceApiService', ResourceApiService);
    ResourceApiService.$inject = ['WarAgent', 'FlowUserDetail', 'GroupResource', 'SchoolYearResource', 'RegionResource', 'TaskResource'];
    function ResourceApiService(WarAgent, FlowUserDetail, GroupResource, SchoolYearResource, RegionResource, TaskResource) {
        return {
            WarAgent: WarAgent,
            FlowUserDetail: FlowUserDetail,
            GroupResource: GroupResource,
            SchoolYearResource: SchoolYearResource,
            RegionResource: RegionResource,
            TaskResource: TaskResource
        };
    }
})();

