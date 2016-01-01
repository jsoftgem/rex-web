(function () {
    'use strict';
    angular.module('war.reports')
        .controller('reportsCtrl', ReportsCtrl);
    ReportsCtrl.$inject = ['$scope', '$timeout', 'userProfile',
        '$http', 'commonFactories', 'resourceApiService'];
    function ReportsCtrl(s, t, up, $h, commonFactories, resourceApiService) {
        activate();
        function activate() {
            s.$on('$destroy', destroy);
            s.task.report = newReport();
            s.task.agentReport = {};
            s.task.agentReport.updateActivity = updateActivity;
            s.task.agentReport.isUpdateActivity = isUpdateActivity;
            s.task.agentReport.clearFilter = clearFilter;
            s.task.agentReport.isAgent = up.isAgent();
            s.task.agentReport.isManager = up.isManager();
            s.task.agentReport.getYears = getYears;
            s.task.agentReport.getMonths = getMonths;
            s.task.agentReport.getAgents = getAgents;
            s.task.agentReport.getRegions = getRegions;
            s.task.agentReport.agentFilterChange = agentFilterChange;
            s.task.agentReport.regionFilterChange = regionFilterChange;
            s.task.agentReport.yearFilterChange = yearFilterChange;
            s.task.agentReport.monthFilterChange = monthFilterChange;
            s.task.agentReport.query = query;
            if (up.isAgent()) {
                s.task.agentReport.disableAgentFilter = !(up.isManager() || up.isAdmin() || up.isGeneralManager());
                s.task.agentReport.agentFilter = up.agent;
                s.task.agentReport.regionFilter = {regionCode: up.getRegionCode()};
                s.task.report.agent = up.agent;
                s.task.report.region = s.task.agentReport.regionFilter.regionCode;
            }
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
                query();
            };
            s.task.export = function (type) {
                s.task.exporting = true;
                s.task.csvDownloadUrl = undefined;
                t(function () {
                    s.$apply();
                    var url = 'services/war/report_weekly_service/agents_' + type + '?';

                    var agentId = (s.task.report.agent !== undefined ? s.task.report.agent.id : undefined);

                    var count = 0;

                    if (s.task.agentReport.yearFilter) {
                        url += 'isYear=true&year=' + s.task.report.year;
                        count++;
                    }

                    if (s.task.agentReport.monthFilter) {
                        if (count > 0) {
                            url += '&';
                        } else {
                            count++;
                        }
                        url += 'isMonth=true&month=' + s.task.report.month;
                    }

                    if (s.task.agentReport.agentFilter) {
                        if (count > 0) {
                            url += '&'
                        } else {
                            count++;
                        }
                        url += 'isAgent=true&agentId=' + agentId;
                    }

                    if (s.task.agentReport.regionFilter) {
                        if (count > 0) {
                            url += '&'
                        } else {
                            count++;
                        }
                        url += 'isRegion=true&region=' + s.task.report.region;
                    }

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

                });
            };
        }

        function query() {
            var url = 'services/war/report_weekly_service/agents?';

            var agentId = (s.task.report.agent !== undefined ? s.task.report.agent.id : undefined);

            var count = 0;

            if (s.task.agentReport.yearFilter) {
                url += 'isYear=true&year=' + s.task.report.year;
                count++;
            }

            if (s.task.agentReport.monthFilter) {
                if (count > 0) {
                    url += '&';
                } else {
                    count++;
                }
                url += 'isMonth=true&month=' + s.task.report.month;
            }

            if (s.task.agentReport.agentFilter) {
                if (count > 0) {
                    url += '&'
                } else {
                    count++;
                }
                url += 'isAgent=true&agentId=' + agentId;
            }

            if (s.task.agentReport.regionFilter) {
                if (count > 0) {
                    url += '&'
                } else {
                    count++;
                }
                url += 'isRegion=true&region=' + s.task.report.region;
            }


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
            });

        }

        function newReport() {
            var report = {};
            report.tag = 'all';
            report.size = 25;
            report.start = 0;
            report.isAgent = false;
            report.isYear = false;
            report.isMonth = false;
            report.isRegion = false;
            return report;
        }

        function getYears() {
            commonFactories.yearService.getYears(function (years) {
                s.task.agentReport.years = years;
            }, function () {
                s.task.agentReport.years = [];
            });
        }

        function getMonths() {
            commonFactories.monthService.getMonths(function (months) {
                s.task.agentReport.months = months;
            }, function () {
                s.task.agentReport.months = [];
            });
        }

        function getAgents() {
            s.task.loadAgent = false;
            resourceApiService.WarAgent.getList(function (agents) {
                s.task.agentReport.agents = agents;
                s.task.loadAgent = true;
            }, function () {
                s.task.agentReport.agents = [];
                s.task.loadAgent = true;
            });
        }

        function getRegions() {
            s.task.loadRegion = false;
            resourceApiService.RegionResource.getList(function (regions) {
                s.task.agentReport.regions = regions;
                s.task.loadRegion = true;
            }, function () {
                s.task.agentReport.regions = [];
                s.task.loadRegion = true;
            });
        }

        function getAgentsByRegionCode(regionCode) {
            s.task.loadAgent = false;
            resourceApiService.WarAgent.getByRegionCode(regionCode, function (agents) {
                s.task.agentReport.agents = agents;
                s.task.loadAgent = true;
            }, function () {
                s.task.agentReport.agents = [];
                s.task.loadAgent = true;
            });
        }

        function regionFilterChange(region) {
            s.task.report.region = region.regionCode;
            if (s.task.agentReport.agentFilter && s.task.agentReport.agentFilter.region !== region.regionCode) {
                s.task.agentReport.agentFilter = undefined;
            }
            getAgentsByRegionCode(region.regionCode);
            console.debug('regionFilterChange', region);
        }

        function agentFilterChange(agent) {
            s.task.agentReport.regionFilter = {regionCode: agent.region};
            s.task.report.agent = agent;
            s.task.report.region = agent.region;
        }

        function yearFilterChange(year) {
            s.task.report.year = year;
        }

        function monthFilterChange(month) {
            s.task.report.month = month.enumForm;
            console.debug('monthFilterChange', month);
        }

        function clearFilter() {
            if (up.isAgent() && !(up.isManager() || up.isAdmin() || up.isGeneralManager())) {
                s.task.agentReport.yearFilter = undefined;
                s.task.agentReport.monthFilter = undefined;
            } else {
                s.task.agentReport.agentFilter = undefined;
                s.task.agentReport.regionFilter = undefined;
                s.task.agentReport.yearFilter = undefined;
                s.task.agentReport.monthFilter = undefined;
            }
        }

        function updateActivity(activityId) {
            s.flow.openTask('daily_task', 'daily_edit', activityId, false, undefined, 100, {toolbar: false});
        }

        function isUpdateActivity() {
            return up.isAgent() || up.isManager();
        }

        function destroy() {
            s.task.report = undefined;
            s.task.agentReport = undefined;
        }
    }
})();
