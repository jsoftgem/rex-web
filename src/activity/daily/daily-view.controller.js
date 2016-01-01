(function () {
    'use strict';
    angular.module('war.activity')
        .controller('dailyViewCtrl', DailyViewCtrl);

    DailyViewCtrl.$inject = ['$scope', 'resourceApiService'];

    function DailyViewCtrl(scope, resourceApiService) {
        var dailyView = this;
        var activities, isNonCoveraged;
        activate();

        function activate() {
            scope.task.page.load = function (data) {
                initActivity(data, this);
            }
        }

        function initActivity(data, page) {
            isNonCoveraged = false;
            activities = [];
            setDailyView(data, page);
        }

        function setDailyView(data, page) {
            dailyView.actual = data.actual;
            dailyView.schoolYear = data.schoolYearDescription;
            dailyView.type = data.type;
            setAgent(data);
            setDailyViewDetail(data, page);

        }

        function setDailyViewDetail(data, page) {
            switch (dailyView.type) {
                case 'SCHOOL':
                    setSchool(data, page);
                    break;
                case 'LEAVE':
                case 'OFFICE':
                case 'SEMINAR':
                    dailyView.description = data.description;
                    break;
            }
        }


        function setSchool(data, page) {
            setCustomer(data, page);
            setDailyActivity(data);
        }

        function setAgent(data) {
            resourceApiService.WarAgent.getById(data.agentId, function (agent) {
                dailyView.agentFullName = agent.user.flowUserDetail.fullName;
                scope.task.title = agent.user.flowUserDetail.fullName;
            });
        }

        function setCustomer(data, page) {
            resourceApiService.CustomerResource.getById(data.customerMarketId, function (customer) {
                dailyView.customerName = customer.school.name;
                dailyView.customerCode = customer.customerCode;
                page.title = customer.school.name + '(' + customer.customerCode + ')';
            });
        }

        function setDailyActivity(data) {
            dailyView.lastUpdated = data.updatedDt ? data.updatedDt : data.createdDt;
            setDailyActivities(data);
        }

        function setDailyActivities(data) {
            addActivity(createActivity('Exam Copies Distribution', data.ecd));
            addActivity(createActivity('Invitation to Events', data.ite));
            addActivity(createActivity('Confirmation of Events', data.coe));
            addActivity(createActivity('Follow up payment', data.fp));
            addActivity(createActivity('Giveaways / Raffle Items Distribution', data.gd));
            addActivity(createActivity('Delivery of Incentive/Donation', data.doi));
            addActivity(createActivity('Follow-Up / Get PO', data.po));
            addActivity(createActivity('Delivery of Add\'l Order', data.daotrc));
            addActivity(createActivity('Book-list', data.bookList));
            addActivity(createActivity('Updated Customer Info Sheet', data.ucis));
            addActivity(createActivity('Implemented Ex-Sem', data.ies));
            dailyView.customerSpecificActivity = data.customerSpecificActivity;
            dailyView.reasonForNonCoverage = data.reasonForNonCoverage;
            dailyView.planned = data.planned;
            dailyView.activities = activities;
            dailyView.isNonCoveraged = isNonCoveraged;
        }

        function createActivity(label, param) {
            return {label: label, param: param};
        }

        function addActivity(activity) {
            if (activities) {
                activities.push(activity);
                isNonCoveraged = (!activity.param) !== isNonCoveraged;
            }
        }
    }


})();