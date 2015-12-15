(function () {
    'use strict';
    angular.module('war.activty')
        .controller('customerSummaryCtrl', CustomerSummaryCtrl)
    CustomerSummaryCtrl.$inject = ['$scope', 'DTOptionsBuilder', 'DTColumnBuilder', 'flowMessageService', 'flowModalService', '$compile', '$filter', 'sessionService'];
    function CustomerSummaryCtrl(s, dto, dtc, ms, fm, c, f, ss) {

    }
})();
