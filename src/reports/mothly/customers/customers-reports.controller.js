(function () {
    'use strict';
    angular.module('war.reports')
        .controller('reportCustomerSummary', ReportCustomerSummary);

    ReportCustomerSummary.$inject = ['$scope', 'userProfile', 'resourceApiService'];

    function ReportCustomerSummary(s, up, resourceApiService) {
        s.$on('$destroy', destroy);
        s.task.reportCustomer = {};
        s.task.reportCustomer.getSchools = getSchools;
        s.task.reportCustomer.getRegions = getRegions;
        s.task.reportCustomer.getAgentsByRegionCode = getAgentsByRegionCode;
        s.task.home = 'report_monthly_customer';
        s.task.view = 'Table';
        s.task.refresh = function () {
            s.task.query();
        };
        s.flow.onRefreshed = function () {
            s.task.refresh();
        };
        s.task.page.load = function (data) {


            s.task.report = {};

            s.task.order = 'materialsAdvisor';

            if (this.name === s.task.home) {
                s.task.report.data = data;
                s.task.report.filter = JSON.parse(this.getParam);

                if (up.agent.id) {

                    this.title = up.agent.fullName + '\'s Customer';

                    s.task.report.filter.regionCode = up.agent.region;

                    s.task.report.filter.agent = up.agent.id;

                    s.task.isAgent = true;
                }

            }
        };
        s.task.selectSchoolYear = function (item) {
            if (s.task.report && s.task.report.filter && item) {
                s.task.report.filter.schoolYear = item.id;
                s.task.query();
            }
        };
        s.task.selectRegion = function (item) {
            if (s.task.report.filter && item) {
                s.task.report.filter.regionCode = item.regionCode;
                s.task.query();
            }
        };
        s.task.selectAgent = function (item) {
            if (s.task.report.filter && item) {
                s.task.report.filter.agent = item.id;
                s.task.query();
            }
        };
        s.task.query = function () {
            if (s.task.report.filter) {
                console.info('agent-query', s.task.report);
                var filter = JSON.stringify(s.task.report.filter);
                s.flow.action('get', undefined, filter);
            }
        };
        s.task.clearFilters = function () {
            if (s.task.report.filter) {
                s.task.report.filter = JSON.parse(s.task.page.getParam);
                s.task.schoolYear = undefined;
                s.task.agent = undefined;
                s.task.region = undefined;
                s.task.report.data = {};
                s.task.query();
            }
        };
        s.task.tag = function (tag) {

            s.task.report.filter.tag = tag;
            if (tag === '20') {
                s.task.order = 'index';
            } else if (tag === '50') {
                s.task.order = 'index';
            } else {
                s.task.order = 'materialsAdvisor';
            }

            s.task.query();
        };
        s.$on(s.flow.event.getSuccessEventId(), function (event, data, method) {
            console.info('reports-monthly-summary- getSuccessEventId', method);
            if (method === 'get') {
                console.info('get', data);
                s.task.report.data = data;
            }
        });

        function getSchools() {
            resourceApiService.SchoolYearResource.getList(function (schools) {
                s.task.reportCustomer.schools = schools;
            }, function () {
                s.task.reportCustomer.schools = [];
            });
        }

        function getRegions() {
            resourceApiService.RegionResource.getList(function (regions) {
                s.task.reportCustomer.regions = regions;
            }, function () {
                s.task.reportCustomer.regions = [];
            });
        }

        function getAgentsByRegionCode(regionCode) {
            resourceApiService.WarAgent.getByRegionCode(regionCode, function (agents) {
                s.task.reportCustomer.agents = agents;
            }, function () {
                s.task.reportCustomer.agents = [];
            });
        }

        function destroy() {
            s.task.reportCustomer = undefined;
        }
    }
})();
