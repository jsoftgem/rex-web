(function () {
    'use strict';
    angular.module('war.activity')
        .controller('schoolYearCreateCtrl', SchoolYearCreateCtrl);

    SchoolYearCreateCtrl.$inject = ['$scope', 'flowModalService', 'commonFactories'];

    function SchoolYearCreateCtrl(s, fm, commonFactories) {
        activate();

        function activate() {
            s.$on('$destroy', destroy);
            s.task.schoolYear = {};
            s.task.schoolYear.getYears = getYears;
            s.task.schoolYear.getMonths = getMonths;
            s.task.create = {};
            s.save = function () {
                s.flow.action("put", s.task.modelCreate);
            };
            s.$watch(function (scope) {
                return scope.task.create.customerLookUp;
            }, function (newValue) {
                if (newValue === undefined) {
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

        function destroy() {
            s.task.schoolYear = undefined;
        }

        function getYears() {
            s.task.schoolYear.yearLoaded = false;
            commonFactories.yearService.getYears(function (years) {
                s.task.schoolYear.yearLoaded = true;
                s.task.schoolYear.years = years;
            }, function () {
                s.task.schoolYear.years = [];
                s.task.schoolYear.yearLoaded = true;
            });
        }

        function getMonths() {
            s.task.schoolYear.monthLoaded = false;
            commonFactories.monthService.getMonths(function (months) {
                s.task.schoolYear.months = months;
                s.task.schoolYear.monthLoaded = true;
            }, function () {
                s.task.schoolYear.months = [];
                s.task.schoolYear.monthLoaded = true;
            });
        }
    }
})();
