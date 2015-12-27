(function () {
    'use strict';
    angular.module('war.resource')
        .factory('ActivityResource', ActivityResource);

    ActivityResource.$inject = ['WarResource'];

    function ActivityResource(WarResource) {
        var activity = WarResource(withHost('services/war/activity_query/:path'), {}, {
            deleteActivity: {
                url: withHost('services/war/activity_crud/delete_activity/:path'),
                method: 'DELETE'
            }
        });

        return {
            deleteActivity: deleteActivity
        };

        function deleteActivity(id, callBack, error) {
            console.debug('deleteActivity.id', id);
            activity.deleteActivity({path: id}, callBack, error);
        }
    }
})();
