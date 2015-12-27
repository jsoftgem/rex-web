(function () {
    'use strict';
    angular.module('war.management')
        .controller('customerInfoCtrl', CustomerInfoCtrl);
    CustomerInfoCtrl.$inject = ['$scope', 'userProfile', 'resourceApiService'];
    function CustomerInfoCtrl(s, up, resourceApiService) {
        activate();

        function activate() {
            s.task.customerInfo = {};
            s.task.customerInfo.getSchoolYears = getSchoolYears;
            s.task.page.load = function (data) {
                s.task.summaryPage = 'customer_agent_summary';
                s.task.summaryUrl = 'services/war/agent_customer_summary_query/customer_summary';
                s.task.chartId = s.flow.getElementFlowId('agentMonthlyBarChart');
                console.info(this.name, data);
                if (this.name === s.task.summaryPage) {
                    if (s.task.origin) {
                        s.task.agent = s.task.origin.agent;
                        s.task.agent.schoolYear = s.task.origin.schoolYear;
                    } else {
                        s.task.agent.schoolYear = data.schoolYear;
                    }

                    if (up.isAgent() && !up.isManager()) {
                        s.task.agent = up.agent;
                    }

                    s.task.summary = data;
                    s.task.title = s.task.summary.customer.school.name;
                    this.title = s.task.agent.fullName;
                    s.task.createChart();
                }
            };
            s.task.refresh = function () {
                s.task.querySummary();
            };
            s.flow.onRefreshed = function () {
                s.task.refresh();
            };
            s.task.querySummary = function () {
                console.info('query_summary', s.task.summary);
                if (s.task.summary) {
                    var param = s.task.summary.customer.id;
                    if (s.task.agent.schoolYear) {
                        param += '?schoolYear=' + s.task.agent.schoolYear.id;
                    }
                    s.flow.action('get', undefined, param);
                }

            };
            s.task.createChart = function () {
                var ctx = document.getElementById(s.task.chartId).getContext('2d');
                new Chart(ctx).Bar(s.task.summary.chart);
            };
            s.$on(s.flow.event.getSuccessEventId(), function (event, data, method) {
                if (s.task.page.name === s.task.summaryPage) {
                    if (method === 'get') {
                        s.task.summary = data;
                        s.task.createChart();
                    }
                }
            });
            s.$on('$destroy', destroy);
        }

        function destroy() {
            s.task.customerInfo = undefined;
        }

        function getSchoolYears() {
            s.task.customerInfo.schoolYearLoaded = false;
            resourceApiService.SchoolYearResource.getList(function (schoolYears) {
                s.task.customerInfo.schoolYears = schoolYears;
                s.task.customerInfo.schoolYearLoaded = true;
            }, function () {
                s.task.customerInfo.schoolYearLoaded = true;
            });
        }

    }
})();
