(function () {
    'use strict';
    angular.module('war.activity')
        .controller('schoolYearEditCtrl', SchoolYearEditCtrl);
    SchoolYearEditCtrl.$inject = ['$scope', 'flowModalService', 'commonFactories'];
    function SchoolYearEditCtrl(s, fm, commonFactories) {
        activate();

        function activate() {
            s.task.schoolYear = {};
            s.task.schoolYear.getYears = getYears;
            s.task.schoolYear.getMonths = getMonths
            s.task.schoolYear.getMonth = getMonth;
            s.$on('$destroy', destroy);
            s.save = function () {
                if (!angular.equals(s.task.modelEdit, s.task.tempEdit)) {
                    s.flow.action("put", s.task.modelEdit, s.task.modelEdit.id);
                } else {
                    s.flow.message.info(UI_MESSAGE_NO_CHANGE);
                }
            };
            s.$on(s.flow.getEventId("createCustomerEvent"), function (event) {
                fm.show(s.flow.getElementFlowId("customerModal"));
            });
            s.$on(s.flow.getEventId("editCustomerEvent"), function (event) {
                fm.show(s.flow.getElementFlowId("customerModal"));
            });
            s.add = function () {
                s.task.edit.customerMarket = {};
                s.task.modelEdit.warCustomerMarkets.push(s.task.edit.customerMarket);
                s.task.edit.customerIndex = s.task.modelEdit.warCustomerMarkets.length - 1;
            };
            s.saveAndClose = function () {
                fm.hide(s.flow.getElementFlowId("customerModal"), s.flow.getElementFlowId('customerLookUp'));
            };
            s.cancel = function () {
                if (s.task.edit.customerManaged === false) {
                    s.task.modelEdit.warCustomerMarkets.splice(s.task.edit.customerIndex, 1);
                }
                else if (s.task.edit.customerManaged) {
                    s.task.modelEdit.warCustomerMarkets[s.task.edit.customerIndex] = s.task.edit.customerTemp;
                }

                fm.hide(s.flow.getElementFlowId("customerModal"), s.flow.getElementFlowId('customerLookUp'));
            };
            s.$on(s.flow.getEventId("createCustomerEvent"), function (event) {
                if (s.task.modelEdit.warCustomerMarkets === undefined) {
                    s.task.modelEdit.warCustomerMarkets = [];
                }

                s.task.edit.customerMarket = {};
                s.task.edit.customerManaged = false;
                s.task.modelEdit.warCustomerMarkets.push(s.task.edit.customerMarket);
                s.task.edit.customerIndex = s.task.modelEdit.warCustomerMarkets.length - 1;

                fm.show(s.flow.getElementFlowId("customerModal"));
            });
            s.$on(s.flow.getEventId("editCustomerEvent"), function (event, id, index) {

                s.task.edit.customerTemp = {};

                angular.copy(s.task.modelEdit.warCustomerMarkets[index], s.task.edit.customerTemp);

                s.task.edit.customerManaged = true;

                s.task.edit.customerIndex = index;

                fm.show(s.flow.getElementFlowId("customerModal"));
            });
            s.$on(s.flow.event.getSuccessEventId(), function (event, data, method) {
                if (method === "put") {
                    if (s.task.page.name === s.task.edit_name) {
                        s.task.modelEdit = {};
                        angular.copy(s.task.modelEdit, s.task.tempEdit);
                        s.flow.goToHome();
                    }
                }
            });
            s.$on(s.flow.getEventId("createMarketSegmentEvent"), function (event) {
                alert(event);
                fm.show(s.flow.getElementFlowId("marketSegmentModal"));
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

        function getMonth(searchMonth) {
            return commonFactories.monthService.getMonth(searchMonth);
        }
    }
})();
