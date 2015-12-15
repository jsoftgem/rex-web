(function () {
    'use strict';
    angular.module('war.reports')
        .controller('reportsCtrl', ReportsCtrl);
    ReportsCtrl.$inject = ['$scope', '$timeout', 'userProfile',
        '$http'];
    function ReportsCtrl(s, t, up, $h) {

        s.task.csvDownloadUrl = undefined;
        s.task.csvDownloadName = undefined;
        s.totalProductivity = function (planned, unplanned, target) {

            var total = ((100 * (planned + unplanned)) / target);

            if (total > 125) {
                total = 125;
            }

            return total;
        };

        s.task.pageAgent = 'report_weekly_agent';

        s.task.service = 'services/war/report_weekly_service'

        s.task.serviceCustomer = s.task.service + '/agent_customer';

        s.task.hideAgentFilter = false;

        s.task.getCustomers = function (report) {
            report.view = !report.view;
            if (report.view) {
                report.loaded = false;
                var url = s.task.serviceCustomer;

                var count = 0;

                if (report.year) {
                    url += '?year=' + report.year;
                    count++;
                }

                if (report.reportMonth) {
                    if (count > 0) {
                        url += '&'
                    } else {
                        count++;
                    }

                    url += 'month=' + report.reportMonth.label.toUpperCase();
                }


                if (report.week) {
                    if (count > 0) {
                        url += '&';
                    } else {
                        count++;
                    }

                    url += 'week=' + report.week;
                }


                if (report.agentId) {
                    if (count > 0) {
                        url += '&';
                    }
                    url += 'agent=' + report.agentId;
                }

                if (report.region) {
                    if (count > 0) {
                        url += '&';
                    }
                    url += 'region=' + report.region;
                }


                s.http.get(url).success(function (data) {
                    report.customers = data;
                    report.loaded = true;
                });

            }

        };

        s.task.getDayName = function (dayOfWeek) {
            return getDayName(dayOfWeek);
        };

        s.task.reportTable = $('#' + s.flow.getElementFlowId('reportTable'));

        s.task.print = {};

        s.task.print.current = function () {
            s.task.reportTable.print({
                globalStyles: true,
                iframe: true,
                noPrintSelector: '.no-print',
                manuallyCopyFormValues: true,
                deferred: $.Deferred()
            })
        };

        s.flow.onRefreshed = function () {
            s.task.query();
        };
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
        s.task.report = s.task.newReport();

        if (up.agent.id) {
            s.task.hideAgentFilter = true;
            s.task.report.isAgent = true;
            s.task.report.agent = up.agent;
            console.info('profileAgent', up);
        }

        s.task.change = function () {
            if (!s.task.report.isYear) {
                s.task.report.year = undefined;
            }
            if (!s.task.report.isMonth) {
                s.task.report.month = undefined;
            }
            if (!s.task.report.isAgent) {
                s.task.report.agent = undefined;
            }
            if (!s.task.report.isRegion) {
                s.task.report.region = undefined;
            }

        };

        s.task.query = function () {
            var url = 'services/war/report_weekly_service/agents?';

            var agentId = (s.task.report.agent !== undefined ? s.task.report.agent.id : undefined);

            var count = 0;

            if (s.task.report.isYear) {
                url += 'isYear=true&year=' + s.task.report.year;
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
                url += 'isAgent=true&agentId=' + agentId;
            }

            if (s.task.report.isRegion) {
                if (count > 0) {
                    url += '&'
                } else {
                    count++;
                }
                url += 'isRegion=true&region=' + s.task.report.region;
            }


            if (s.task.valid() && s.task.report.closed === false) {
                if (count > 0) {
                    url += '&'
                }
                if (s.task.report.size) {
                    url += 'size=' + s.task.report.size;
                }
                if (s.task.report.tag) {
                    url += '&tag=' + s.task.report.tag;
                }

                if (s.task.report.start) {
                    url += '&start=' + s.task.report.start;
                }

                s.http.get(url).success(function (data) {
                    s.task.report.size = data.size;
                    s.task.report.tag = data.tag;
                    s.task.report.weeklyReports = data.weeklyReports;
                })
            }
        };
        s.task.export = function (type) {
            s.task.exporting = true;
            s.task.csvDownloadUrl = undefined;
            t(function () {
                s.$apply();
                var url = 'services/war/report_weekly_service/agents_' + type + '?';

                var agentId = (s.task.report.agent !== undefined ? s.task.report.agent.id : undefined);

                var count = 0;

                if (s.task.report.isYear) {
                    url += 'isYear=true&year=' + s.task.report.year;
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
                    url += 'isAgent=true&agentId=' + agentId;
                }

                if (s.task.report.isRegion) {
                    if (count > 0) {
                        url += '&'
                    } else {
                        count++;
                    }
                    url += 'isRegion=true&region=' + s.task.report.region;
                }


                if (s.task.valid() && s.task.report.closed === false) {
                    if (count > 0) {
                        url += '&'
                    }
                    if (s.task.report.size) {
                        url += 'size=' + s.task.report.size;
                    }
                    if (s.task.report.tag) {
                        url += '&tag=' + s.task.report.tag;
                    }

                    if (s.task.report.start) {
                        url += '&start=' + s.task.report.start;
                    }

                    $h({
                        url: withHost(url), method: 'get',
                        transformResponse: function (value) {
                            if (type === 'html') {
                                $(value).print({
                                    globalStyles: true,
                                    iframe: true,
                                    noPrintSelector: '.no-print',
                                    manuallyCopyFormValues: true,
                                    deferred: $.Deferred()
                                });
                            }
                            else if (type === 'csv') {
                                var blob = new Blob([value], {type: 'text/csv'});
                                s.task.csvDownloadUrl = (window.URL || window.webkitURL).createObjectURL(blob);
                                s.task.csvDownloadName = new Date() + '.csv';
                            }
                            return undefined;
                        }
                    }).success(function () {
                        s.task.exporting = false;

                    }).error(function (err) {
                        s.task.exporting = false;
                        s.flow.message.danger(err);
                    });
                }
            });
        };

        s.task.valid = function () {
            var valid = true;

            if (s.task.report.isYear) {
                if (s.task.report.year === undefined) {
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
                if (s.task.report.agent === undefined) {
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

            return valid;
        };

        s.$watch(function (scope) {
            return scope.task.report.isYear
        }, function (newValue, oldValue) {
            if (newValue !== oldValue) {
                s.task.change();
            }
        });

        s.$watch(function (scope) {
            return scope.task.report.isMonth
        }, function (newValue, oldValue) {
            if (newValue !== oldValue) {
                s.task.change();
            }
        });

        s.$watch(function (scope) {
            return scope.task.report.isAgent
        }, function (newValue, oldValue) {
            if (newValue !== oldValue) {
                s.task.change();
            }
        });

        s.$watch(function (scope) {
            return scope.task.report.isRegion
        }, function (newValue, oldValue) {
            if (newValue !== oldValue) {
                s.task.change();
            }
        });

        s.$watch(function (scope) {
            return scope.task.report.year
        }, function (newValue, oldValue) {
            if (newValue !== oldValue) {
                s.task.report.closed = false;
                s.task.query();
            }
        });

        s.$watch(function (scope) {
            return scope.task.report.month
        }, function (newValue, oldValue) {
            if (newValue !== oldValue) {
                s.task.report.closed = false;
                s.task.query();
            }
        });

        s.$watch(function (scope) {
            return scope.task.report.agent
        }, function (newValue, oldValue) {
            if (newValue !== oldValue) {
                s.task.report.closed = false;
                s.task.query();
            }
        });

        s.$watch(function (scope) {
            return scope.task.report.region
        }, function (newValue, oldValue) {
            if (newValue !== oldValue) {
                s.task.report.closed = false;
                s.task.query();
            }
        });


        s.task.page.load = function () {

        };
    }
})();
