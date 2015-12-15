(function () {
    'use strict';
    angular.module('war.activity')
        .controller('schoolYearCreateCtrl', SchoolYearCreateCtrl);

    SchoolYearCreateCtrl.$inject = ['$scope', 'flowModalService'];

    function SchoolYearCreateCtrl(s, fm) {
        s.task.create = {};
        s.save = function () {
            s.flow.action("put", s.task.modelCreate);
        };
        s.$watch(function (scope) {
            return scope.task.create.customerLookUp;
        }, function (newValue) {
            if (newValue === undefined) {
                /*s.task.modelCreate.warCustomerMarkets[s.task.create.customerIndex].customerId = undefined;
                 s.task.modelCreate.warCustomerMarkets[s.task.create.customerIndex].customerCode = undefined;
                 s.task.modelCreate.warCustomerMarkets[s.task.create.customerIndex].customerName = undefined;*/
            } else {

                s.task.modelCreate.warCustomerMarkets[s.task.create.customerIndex].customerId = newValue.id;
                s.task.modelCreate.warCustomerMarkets[s.task.create.customerIndex].customerCode = newValue.customerCode;
                s.task.modelCreate.warCustomerMarkets[s.task.create.customerIndex].customerName = newValue.school.name;
            }

        });
        s.saveAndClose = function () {
            fm.hide(s.flow.getElementFlowId("customerModal"), s.flow.getElementFlowId('customerLookUp'));
        };
        s.cancel = function () {
            if (s.task.create.customerManaged === false) {
                s.task.modelCreate.warCustomerMarkets.splice(s.task.create.customerIndex, 1);
            }
            else if (s.task.create.customerManaged) {
                s.task.modelCreate.warCustomerMarkets[s.task.create.customerIndex] = s.task.create.customerTemp;
            }

            fm.hide(s.flow.getElementFlowId("customerModal"), s.flow.getElementFlowId('customerLookUp'));
        };
        s.$on(s.flow.event.getSuccessEventId(), function (event, data, method) {

            if (method === "put") {
                if (s.task.page.name === s.task.create_name) {
                    s.task.modelCreate = {};
                    s.flow.goToHome();
                }
            }
        });
    }
})();
