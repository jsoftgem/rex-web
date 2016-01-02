(function () {
    'use strict';
    angular.module('war.reports')
        .controller('reportsMCtrl', ReportsMCtrl);
    ReportsMCtrl.$inject = ['$scope', 'hasProfile', 'userProfile'];
    function ReportsMCtrl(s, hp, up) {

        s.task.hideAgentFilter = false;
        s.task.pageCustomer = 'report_monthly_customer';

        s.task.newReport = function () {
            var report = {};
            report.tag = 'all';
            report.size = 25;
            report.start = 0;
            report.isAgent = false;
            report.isYear = false;
            report.isMonth = false;
            report.isRegion = false;

            return report;
        };

        s.$on(s.flow.event.getRefreshId(), function () {
            s.task.query();
        });

        hp.check('agent', s.task)
            .success(function (valid) {
                s.task.hideAgentFilter = valid;
                s.task.report.isAgent = valid;
                s.task.agent = up.agent;
            });

        s.task.change = function () {
            s.task.report.start = 0;
            s.task.report.size = 25;

            if (!s.task.report.isYear) {
                s.task.report.schoolYear = undefined;
            }
            if (!s.task.report.isMonth) {
                s.task.report.month = undefined;
            }
            if (!s.task.report.isAgent) {
                s.task.agent = undefined;
            }
            if (!s.task.report.isRegion) {
                s.task.report.region = undefined;
            }
            if (!s.task.report.isCustomer) {
                s.task.customer = undefined;
            }
        };
        s.task.query = function () {
            var url = 'services/war/report_monthly_service/customers?';

            var count = 0;

            if (s.task.report.isYear) {
                url += 'isYear=true&schoolYear=' + s.task.report.schoolYear;
                count++;
            }

            if (s.task.report.isMonth) {
                if (count > 0) {
                    url += '&';
                } else {
                    count++;
                }
                url += 'isMonth=true&month=' + s.task.report.month;
            }

            if (s.task.report.isAgent) {
                if (count > 0) {
                    url += '&'
                } else {
                    count++;
                }
                url += 'isAgent=true&agentId=' + s.task.agent.id;
            }

            if (s.task.report.isRegion) {
                if (count > 0) {
                    url += '&'
                } else {
                    count++;
                }
                url += 'isRegion=true&region=' + s.task.report.region;
            }

            if (s.task.report.isCustomer) {
                if (count > 0) {
                    url += '&';
                } else {
                    count++;
                }
                url += 'isCustomer=true&customerId=' + s.task.customer.id;
            }


            if (s.task.valid()) {
                if (count > 0) {
                    url += '&'
                }
                url += 'size=' + s.task.report.size;
                url += '&tag=' + s.task.report.tag;
                url += '&start=' + s.task.report.start;
                s.http.get(url).success(function (data) {
                    s.task.report = data;
                })
            }
        };

        s.task.valid = function () {
            var valid = true;

            if (s.task.report.isYear) {
                if (s.task.report.schoolYear === undefined) {
                    s.flow.message.danger('Please select a year.');
                    valid = false;
                }
            }


            if (s.task.report.isMonth) {
                if (s.task.report.month === undefined) {
                    s.flow.message.danger('Please select a month.');
                    valid = false;
                }
            }

            if (s.task.report.isAgent) {
                if (s.task.agent === undefined) {
                    s.flow.message.danger('Please select an agent.');
                    valid = false;
                }
            }

            if (s.task.report.isRegion) {
                if (s.task.report.region === undefined) {
                    s.flow.message.danger('Please select a region.');
                    valid = false;
                }
            }

            if (s.task.report.isCustomer) {
                if (s.task.customer === undefined) {
                    s.flow.message.danger('Please select a customer');
                    valid = false;
                }
            }

            return valid;

        };
        s.task.changeTag = function (filter, tag) {
            if (tag === 'all') {
                filter.limitTo = {};
            } else if (tag === '20') {
                filter.limitTo = 20;
            } else if (tag === '50') {
                filter.limitTo = 50;
            }
        };

        s.$watch(function (scope) {
            return scope.task.report.isYear
        }, function () {
            s.task.change();
        });

        s.$watch(function (scope) {
            return scope.task.report.isMonth
        }, function () {
            s.task.change();
        });

        s.$watch(function (scope) {
            return scope.task.report.isAgent
        }, function () {
            s.task.change();
        });

        s.$watch(function (scope) {
            return scope.task.report.isRegion
        }, function () {
            s.task.change();
        });

        s.$watch(function (scope) {
            return scope.task.report.isCustomer
        }, function () {
            s.task.change();
        });

        s.$watch(function (scope) {
            return scope.task.report.schoolYear
        }, function () {
            s.task.query();
        });

        s.$watch(function (scope) {
            return scope.task.report.month
        }, function () {
            s.task.query();
        });

        s.$watch(function (scope) {
            return scope.task.agent
        }, function () {
            s.task.query();
        });

        s.$watch(function (scope) {
            return scope.task.report.region
        }, function () {
            s.task.query();
        });

        s.$watch(function (scope) {
            return scope.task.customer
        }, function () {
            s.task.query();
        });

        s.task.page.load = function () {
            if (this.name === s.task.pageAgent) {
                s.task.report = s.task.newReport();
                s.task.query();
            }
        };
    }
})();