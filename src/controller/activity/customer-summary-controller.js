/**
 * Created by Jerico on 2/23/2015.
 */
angular.module("customerSummary", ["fluid", "ngResource", "datatables"])
    .controller("customerSummaryCtrl", ["$scope", "DTOptionsBuilder", "DTColumnBuilder", "flowMessageService", "flowModalService", "$compile", "$filter", "sessionService",
        function (s, dto, dtc, ms, fm, c, f, ss) {
        }]);