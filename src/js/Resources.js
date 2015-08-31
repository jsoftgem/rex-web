/**
 * Created by rickzx98 on 8/30/15.
 */

angular.module("war.resources", ["war.session"])
    .factory("WarResource", ["$resource", function (resource) {
        var warResource = function (options) {
            var rs = resource(options);

            rs.getAvatarPath = function (fileId) {
                return withHost("services/download_service/getContent/" + fileId);
            };

            return rs;
        };
        return warResource;
    }])
    .factory("FlowUserDetail", ["WarResource", function (resource) {
        var flowUserDetail = resource(withHost("services/v2/user/detail/:path"));

        flowUserDetail.currentDetail = function (flowUserId, fn) {
            return flowUserDetail.get({path: flowUserId}, fn);
        };


        return flowUserDetail;
    }])
    .factory("WarAgent", ["WarResource", function (resource) {
        var warAgent = resource(withHost("services/v2/war/agent/:path"));

        warAgent.current = function (fn) {
            return warAgent.get({path: "current-agent"}, fn);
        };

        return warAgent;
    }])
    .factory("TaskResource", ["WarResource", function (resource) {

        var taskResource = resource(withHost("services/v2/task/:path"));

        taskResource.getSessionTasks = function (fn) {
            return taskResource.query({path: "user"}, fn);
        };


        return taskResource;

    }])
    .factory("GroupResource", ["WarResource", function (resource) {


        var groupResource = resource(withHost("services/v2/user/group/:path"));

        groupResource.getByName = function (name, fn) {
            groupResource.get({path: "by-name", name: name}, fn);
        };

        return groupResource;

    }]);