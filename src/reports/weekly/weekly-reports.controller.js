(function () {
    'use strict';
    angular.module('war.reports')
        .controller('reportsCtrl', ReportsCtrl);
    ReportsCtrl.$inject = ['$scope', '$timeout', 'userProfile',
        '$http', 'commonFactories', 'resourceApiService', 'flowModalService', 'UserFactory'];
    function ReportsCtrl(s, t, up, $h, commonFactories, resourceApiService, flowModalService, UserFactory) {
        s.task.toolbars = [];
        s.task.page.load = activate();
        function activate() {
            initToolbars();
            s.$on('$destroy', destroy);
            s.task.showToolBar = true;
            s.task.table = tableOptions();
            s.task.table.closeToggleColumn = closeToggleColumn;
            s.task.report = newReport();
            s.task.agentReport = {};
            s.task.agentReport.updateActivity = updateActivity;
            s.task.agentReport.isUpdateActivity = isUpdateActivity;
            s.task.agentReport.clearFilter = clearFilter;
            s.task.agentReport.isAgent = isAgent;
            s.task.agentReport.isManager = isManager;
            s.task.agentReport.isGeneralManager = isGeneralManager;
            s.task.agentReport.getYears = getYears;
            s.task.agentReport.getMonths = getMonths;
            s.task.agentReport.getAgents = getAgents;
            s.task.agentReport.getRegions = getRegions;
            s.task.agentReport.agentFilterChange = agentFilterChange;
            s.task.agentReport.regionFilterChange = regionFilterChange;
            s.task.agentReport.yearFilterChange = yearFilterChange;
            s.task.agentReport.monthFilterChange = monthFilterChange;
            s.task.agentReport.setMyWorkplan = setMyWorkplan;
            s.task.agentReport.query = query;
            if (up.isAgent()) {
                s.task.agentReport.disableAgentFilter = !(up.isManager() || up.isAdmin() || up.isGeneralManager());
                if (!up.isManager()) {
                    s.task.agentReport.agentFilter = up.agent;
                    s.task.report.agent = up.agent;
                }
                s.task.agentReport.regionFilter = {regionCode: up.getRegionCode()};
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
            s.task.service = 'services/war/report_weekly_service';
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
                s.flow.reloadTask();
            };
        }

        function query() {
            var url = buildQuery('services/war/report_weekly_service/agents?');
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
            report.myWorkPlan = false;
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
            resourceApiService.WarAgent.getByCurrentLevel(function (agents) {
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
                s.task.agentReport.myWorkPlan = undefined;
            } else {
                s.task.agentReport.agentFilter = undefined;
                s.task.agentReport.regionFilter = undefined;
                s.task.agentReport.yearFilter = undefined;
                s.task.agentReport.monthFilter = undefined;
                s.task.agentReport.myWorkPlan = undefined;
            }
            s.flow.reloadTask();
        }

        function updateActivity(activityId) {
            s.flow.openTask('daily_task', 'daily_edit', activityId, false, undefined, 100, {toolbar: false});
        }

        function isUpdateActivity() {
            return up.isAgent() || up.isManager();
        }

        function isManager() {
            return up.isManager();
        }

        function isGeneralManager() {
            return up.isGeneralManager();
        }

        function isAgent() {
            return up.isAgent();
        }

        function destroy() {
            s.task.report = undefined;
            s.task.agentReport = undefined;
        }

        function initToolbars() {
            var goControl = new Control();
            goControl.id = 'go';
            goControl.label = 'Go';
            goControl.disabled = false;
            goControl.useLabel = true;
            goControl.action = query;
            goControl.uiType = 'primary';

            var clearControl = new Control();
            clearControl.id = 'clear';
            clearControl.label = 'Clear';
            clearControl.disabled = false;
            clearControl.useLabel = true;
            clearControl.action = clearFilter;
            clearControl.uiType = 'warning';

            var columnControl = new Control();
            columnControl.id = 'columns';
            columnControl.label = 'Columns';
            columnControl.disabled = false;
            columnControl.useLabel = true;
            columnControl.uiType = 'info';
            columnControl.action = function () {
                flowModalService.show(s.flow.getElementFlowId('toggleColumnsModal'));
            };

            var printControl = new Control();
            printControl.id = 'print';
            printControl.label = 'Print';
            printControl.isLoading = isLoadingExport;
            printControl.action = exportPrint;
            printControl.glyph = 'fa fa-print';

            var csvControl = new Control();
            csvControl.id = 'csv';
            csvControl.label = 'csv';
            csvControl.isLoading = isLoadingExport;
            csvControl.action = exportCSV;
            csvControl.glyph = 'fa fa-file-excel-o';
            csvControl.uiType = 'success';

            s.task.toolbars = [goControl, clearControl, columnControl, printControl, csvControl];
        }

        function exportPrint() {
            if (!s.task.exporting) {
                exportData('html');
            }
        }

        function exportCSV() {
            if (!s.task.exporting) {
                exportData('csv');
            }
        }

        function isLoadingExport() {
            return s.task.exporting;
        }

        function exportData(type) {
            s.task.loaded = false;
            s.task.exporting = true;
            var downloadBlob, filename;
            t(function () {
                s.$apply();
                var url = buildQuery('services/war/report_weekly_service/agents_' + type + '?');
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
                            downloadBlob = new File([value], new Date() + '.csv', {type: 'text/csv'});
                            filename = 'AGENT_WEEKLY_REPORT ' + new Date().toLocaleDateString() + '.csv';
                        }
                        return undefined;
                    }
                }).success(function () {
                    s.task.loaded = true;
                    s.task.exporting = false;
                    if (type === 'csv') {
                        saveAs(downloadBlob, filename);
                    }
                }).error(function (err) {
                    s.task.loaded = true;
                    s.task.exporting = false;
                    s.flow.message.danger(err);
                });

            });
        }

        function tableOptions() {
            var tableOption = {};
            tableOption.isMaterialsAdvisor = true;
            tableOption.isWorkedWith = true;
            tableOption.isWeek = true;
            tableOption.isYear = true;
            tableOption.isPlannedTarget = true;
            tableOption.isPlannedActual = true;
            tableOption.isUnplannedActual = true;
            tableOption.isTotalCallProd = true;
            tableOption.isTotalActual = true;
            tableOption.isEcd = false;
            tableOption.isIte = false;
            tableOption.isCoe = false;
            tableOption.isFp = false;
            tableOption.isGd = false;
            tableOption.isDoi = false;
            tableOption.isPo = false;
            tableOption.isDaotrc = false;
            tableOption.isBooklist = false;
            tableOption.isUcis = false;
            tableOption.isIes = false;
            tableOption.isCustomerSpecific = false;
            tableOption.isBootcamp = false;
            tableOption.isAecon = false;
            tableOption.isCeap = false;
            tableOption.isCollectionAndPr = false;
            return tableOption;
        }

        function closeToggleColumn() {
            flowModalService.hide(s.flow.getElementFlowId('toggleColumnsModal'));
        }

        function setMyWorkplan() {
            s.task.agentReport.myWorkPlan = !s.task.agentReport.myWorkPlan;
        }

        function buildQuery(url) {

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

            if (s.task.agentReport.agentFilter && (!s.task.report.agent.isManager || up.isGeneralManager())) {
                if (count > 0) {
                    url += '&'
                } else {
                    count++;
                }
                if (!s.task.agentReport.myWorkPlan) {
                    url += 'isAgent=true&agentId=' + agentId;

                } else {
                    url += 'workedWith=true&managerId=' + agentId;
                }
            }

            if (s.task.agentReport.regionFilter) {
                if (count > 0) {
                    url += '&'
                } else {
                    count++;
                }
                url += 'isRegion=true&region=' + s.task.report.region;
            }

            if (s.task.report.agent && s.task.report.agent.isManager) {
                if (count > 0) {
                    url += '&'
                } else {
                    count++;
                }
                if (!s.task.agentReport.myWorkPlan) {
                    url += 'workedWith=true&managerId=' + agentId;
                }
            }

            if (s.task.agentReport.myWorkPlan) {
                if (count > 0) {
                    url += '&'
                } else {
                    count++;
                }
                if (up.isGeneralManager()) {
                    url += 'myWorkPlan=true&managerId=' + UserFactory.getUser().userId;
                } else {
                    url += 'myWorkPlan=true&managerId=' + up.agent.id;
                }
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

            return url;
        }
    }

})();
