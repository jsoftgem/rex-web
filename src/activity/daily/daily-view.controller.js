(function () {
    'use strict';
    angular.module('war.activity')
        .controller('dailyViewCtrl', DailyViewCtrl);

    DailyViewCtrl.$inject = ['$scope', 'resourceApiService'];

    function DailyViewCtrl(scope, resourceApiService) {
        var dailyView = this;
        activate();

        function activate() {
            scope.task.page.load = function (data) {
                setDailyView(data);
            }
        }

        function setDailyView(data) {
            dailyView.schoolYear = data.schoolYearDescription;
            dailyView.type = data.type;
            setAgent(data);
            setDailyViewDetail(data);
            setDailyActivity(data);

        }

        function setDailyActivity(data) {

        }

        function setDailyViewDetail(data) {
            switch (dailyView.type) {
                case 'SCHOOL':
                    setCustomer(data);
                    break;
                case 'LEAVE':
                    break;
                case 'OFFICE':
                    break;
                case 'SEMINAR':
                    break;
            }
        }

        function setAgent(data) {
            resourceApiService.WarAgent.getById(data.agentId, function (agent) {
                dailyView.agentFullName = agent.user.flowUserDetail.fullName;
            });
        }

        function setCustomer(data) {
            resourceApiService.CustomerResource.getById(data.customerMarketId, function (customer) {
                dailyView.customerName = customer.school.name;
                dailyView.customerCode = customer.customerCode;
            });
        }

    }


})();