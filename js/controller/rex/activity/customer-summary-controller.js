/**
 * Created by Jerico on 2/23/2015.
 */
angular.module("customerSummary", ["fluid", "ngResource", "datatables", "ngCookies"])
    .controller("customerSummaryCtrl", ["$scope", "DTOptionsBuilder", "DTColumnBuilder", "flowMessageService", "flowModalService", "$compile", "$filter", "$cookies",
        function (s, dto, dtc, ms, fm, c, f, co) {
        }]);