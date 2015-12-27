(function () {
    'use strict';
    angular.module('war.management')
        .controller('customerSummaryCtrl', CustomerSummaryCtrl);
    CustomerSummaryCtrl.$inject = ['$scope', 'userProfile', 'imageService', 'resourceApiService', 'commonFactories'];
    function CustomerSummaryCtrl(s, up, is, resourceApiService, commonFactories) {
        activate();


        function activate() {
            s.$on('$destroy', destroy);
            s.task.customerSummary = {};
            s.task.customerSummary.getSchoolYears = getSchoolYears;
            s.task.customerSummary.getMonths = getMonths;
            s.task.customerSummary.getWeeks = getWeeks;
            s.imageService = is;
            s.flow.openTaskBaseUrl = 'services/flow_task_service/getTask?showToolBar=false&size=100&';
            s.editCustomer = function (customerId) {
                s.flow.openTask('customer_task', 'customer_edit', customerId, false);
            };
            s.editActivity = function (activityId) {
                s.flow.openTask('daily_task', 'daily_edit', activityId, false);
            };
            s.task.refresh = function () {
                if (s.task.page.name === s.task.homePage) {
                    s.http.post(this.homeUrl)
                        .success(function (data) {
                            s.task.agent.summary.result = data;
                        });

                    if (s.task.agent.selectedCustomer) {
                        s.flow.action('post', undefined, s.buildQuery());
                    }
                }
            };
            s.$on(s.flow.event.getSuccessEventId(), function (event, data, method) {
                if (s.task.page.name === s.task.homePage) {
                    if (method === 'post') {
                        s.task.agent.activity = data;
                    }
                }
            });
            s.flow.onRefreshed = function () {
                s.task.refresh();
            };
            s.task.page.load = function () {
                s.task.agent = up.agent;
                s.task.agent.schoolYear = undefined;
                s.task.agent.month = undefined;
                s.task.agent.week = 'all';
                s.task.agent.activity = {};
                s.task.agent.summary = {};
                console.info('customerSummaryCtrl', this.name);
                if (this.name === 'customer_agent_home') {
                    this.title = 'assigned to ' + s.task.agent.initials;
                    s.http.post('services/war/customer_light_query/find_by_assigned_agent')
                        .success(function (data) {
                            s.task.agent.summary.result = data;
                        }).then(function () {
                        s.task.agent = up.agent;
                    });
                }
            };
            s.filter = function () {
                s.flow.action('post', undefined, s.buildQuery());
            };
            s.buildQuery = function () {
                var url = "";
                if (s.task.agent.selectedCustomer) {

                    url += '?customerId=' + s.task.agent.selectedCustomer.id

                    if (s.task.agent.schoolYear) {
                        url += '&schoolYearId=' + s.task.agent.schoolYear.id;
                    }

                    if (s.task.agent.month) {
                        url += '&month=' + s.task.agent.month;
                    }

                    if (s.task.agent.week) {
                        url += '&week=' + s.task.agent.week;
                    }
                }
                return url;
            };
            s.clearFilter = function () {
                s.task.agent.schoolYear = undefined;
                s.task.agent.month = undefined;
                s.task.agent.week = 'all';
                s.task.agent.activity = {};
                s.task.refresh();
            };
            s.select = function (school) {
                s.task.agent.selectedCustomer = school;
                if (s.task.agent.schoolYear) {
                    s.filter();
                }
            };
            s.prev = function () {
                if (s.task.agent.activity.hasPrevious) {
                    var url = s.buildQuery() + '&start=' + s.task.agent.activity.previous;
                    s.flow.action('post', undefined, url);
                }

            };
            s.next = function () {
                if (s.task.agent.activity.hasNext) {
                    var url = s.buildQuery() + '&start=' + s.task.agent.activity.next;
                    s.flow.action('post', undefined, url);
                }

            };
            s.goToSummary = function () {
                var param = s.task.agent.selectedCustomer.id;

                if (s.task.agent.schoolYear) {
                    param += '?schoolYear=' + s.task.agent.schoolYear.id;
                }


                s.flow.goTo('customer_agent_summary', param);
            };
        }

        function getSchoolYears() {
            s.task.customerSummary.schoolYearsLoaded = false;
            resourceApiService.SchoolYearResource.getList(function (schoolYears) {
                s.task.customerSummary.schoolYears = schoolYears;
                s.task.customerSummary.schoolYearsLoaded = true;
            }, function () {
                s.task.customerSummary.schoolYears = [];
                s.task.customerSummary.schoolYearsLoaded = true;
            });
        }

        function getMonths() {
            commonFactories.monthService.getMonths(function (months) {
                s.task.customerSummary.months = months;
            }, function () {
                s.task.customerSummary.months = [];
            })
        }

        function getWeeks() {
            s.task.customerSummary.weeks = ['all', '1', '2', '3', '4', '5'];
        }


        function destroy() {
            s.task.customerSummary = undefined;
        }
    }
})();
