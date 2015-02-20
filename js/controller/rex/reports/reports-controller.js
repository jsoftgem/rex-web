/**
 * Created by Jerico on 2/6/2015.
 */
angular.module("reportsController", ["fluid", "ngResource", "datatables", "ngCookies", "angular.filter"])
    .controller("reportsCtrl", ["$scope", "DTOptionsBuilder", "DTColumnBuilder", "flowMessageService", "flowModalService", "$compile", "$filter", "$cookies", "HOST", "$timeout", "flowFrameService",
        function (s, dto, dtc, ms, fm, c, f, co, h, t, ffs) {


            s.task.preLoad = function () {
                s.task.isYear = false;
                s.task.isMonth = false;
                s.task.isAgent = false;
                s.task.pageAgent = "report_weekly_agent";
                s.task.service = "services/war/report_weekly_service"
                s.task.serviceCustomer = s.task.service + "/agent_customer";
                s.flow.pageCallBack = function (page, data) {
                    if (page === s.task.pageAgent) {
                        s.task.result = data;
                    }
                }

                s.task.change = function () {
                    if (!s.task.isYear) {
                        s.task.year = undefined;
                    }
                    if (!s.task.isMonth) {
                        s.task.month = undefined;
                    }
                    if (!s.task.isAgent) {
                        s.task.agent = undefined;
                    }
                }

                s.$watch(function (scope) {
                    return scope.task.isYear
                }, function () {
                    s.task.change();
                });

                s.$watch(function (scope) {
                    return scope.task.isMonth
                }, function () {
                    s.task.change();
                });

                s.$watch(function (scope) {
                    return scope.task.isAgent
                }, function () {
                    s.task.change();
                });


                s.$watch(function (scope) {
                    return scope.task.year
                }, function () {
                    s.task.query();
                })

                s.$watch(function (scope) {
                    return scope.task.month
                }, function () {
                    s.task.query();
                })

                s.$watch(function (scope) {
                    return scope.task.agent
                }, function () {
                    s.task.query();
                })


                s.task.query = function () {
                    var url = "services/war/report_weekly_service/agents?";

                    var agentId = (s.task.agent !== undefined ? s.task.agent.id : undefined);

                    var count = 0;

                    if (s.task.isYear) {
                        url += "isYear=true&year=" + s.task.year;
                        count++;
                    }


                    if (s.task.isMonth) {
                        if (count > 0) {
                            url += "&";
                        } else {
                            count++;
                        }
                        url += "isMonth=true&month=" + s.task.month;
                    }

                    if (s.task.isAgent) {
                        if (count > 0) {
                            url += "&"
                        }
                        url += "isAgent=true&agent=" + agentId;
                    }

                    if (s.task.valid()) {
                        s.http.get(url).success(function (data) {
                            s.task.result = data;
                        })
                    }
                }

                s.task.valid = function () {
                    var valid = true;

                    if (s.task.isYear) {
                        if (s.task.year === undefined) {
                            s.flow.message.danger("Please select a year.");
                            valid = false;
                        }
                    }


                    if (s.task.isMonth) {
                        if (s.task.month === undefined) {
                            s.flow.message.danger("Please select a month.");
                            valid = false;
                        }
                    }

                    if (s.task.isAgent) {
                        if (s.task.agent === undefined) {
                            s.flow.message.danger("Please select an agent.");
                            valid = false;
                        }
                    }
                    return valid;

                }

                s.$on(s.flow.event.getRefreshId(), function (event) {
                    s.task.query();
                })

                s.task.getCustomers = function (report) {
                    report.view = !report.view;
                    if (report.view) {
                        report.loaded = false;
                        var url = s.task.serviceCustomer;


                        var count = 0;


                        if (report.year) {
                            url += "?year=" + report.year;
                            count++;
                        }

                        if (report.reportMonth) {
                            if (count > 0) {
                                url += "&"
                            } else {
                                count++;
                            }

                            url += "month=" + report.reportMonth;
                        }


                        if (report.week) {
                            if (count > 0) {
                                url += "&";
                            } else {
                                count++;
                            }

                            url += "week=" + report.week;
                        }


                        if (report.agentId) {
                            if (count > 0) {
                                url += "&";
                            }
                            url += "agent=" + report.agentId;
                        }

                        s.http.get(url).success(function (data) {
                            report.customers = data;
                            report.loaded = true;
                        });

                    }

                }


                s.task.getDayName = function (dayOfWeek) {
                    return getDayName(dayOfWeek);
                }
            }


        }
    ])
;
