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
            dailyView.lastUpdated = data.updatedDt ? data.updatedDt : data.createdDt;
            dailyView.ecd = data.ecd;
            dailyView.ite = data.ite;
            dailyView.coe = data.coe;
            dailyView.coe = data.coe;
            dailyView.fp = data.fp;
            dailyView.gd = data.gd;
            dailyView.doi = data.doi;
            dailyView.po = data.po;
            dailyView.daotrc = data.daotrc;
            dailyView.bookList = data.bookList;
            dailyView.ucis = data.ucis;
            dailyView.ies = data.ies;
            dailyView.customerSpecificActivity=data.customerSpecificActivity;
            dailyView.reasonForNonCoverage=data.reasonForNonCoverage;
            dailyView.planned = data.planned;
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