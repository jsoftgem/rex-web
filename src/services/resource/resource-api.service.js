(function () {
    'use strict';
    angular.module('war.resource').factory('resourceApiService', ResourceApiService);
    ResourceApiService.$inject = ['WarAgent', 'FlowUserDetail', 'GroupResource', 'SchoolYearResource', 'RegionResource', 'TaskResource', 'PositionResource', 'LevelResource', 'ActivityResource', 'CustomerResource'];
    function ResourceApiService(WarAgent, FlowUserDetail, GroupResource, SchoolYearResource, RegionResource, TaskResource, PositionResource, LevelResource, ActivityResource, CustomerResource) {
        return {
            WarAgent: WarAgent,
            FlowUserDetail: FlowUserDetail,
            GroupResource: GroupResource,
            SchoolYearResource: SchoolYearResource,
            RegionResource: RegionResource,
            TaskResource: TaskResource,
            PositionResource: PositionResource,
            LevelResource: LevelResource,
            ActivityResource: ActivityResource,
            CustomerResource: CustomerResource
        };
    }
})();

