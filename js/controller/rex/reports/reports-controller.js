/**
 * Created by Jerico on 2/6/2015.
 */
angular.module("reportsController", ["fluid", "ngResource", "datatables", "angular.filter", "flowServices"])
    .controller("reportsCtrl", ["$scope", "DTOptionsBuilder", "DTColumnBuilder", "flowMessageService", "flowModalService",
        "$compile", "$filter", "sessionService", "HOST", "$timeout", "flowFrameService", "userProfile", "hasProfile",
        function (s, dto, dtc, ms, fm, c, f, ss, h, t, ffs, up, hp) {


            s.totalProductivity = function (planned, unplanned, target) {

                var total = ((100 * (planned + unplanned)) / target);

                if (total > 125) {
                    total = 125;
                }

                return total;
            };

            s.task.pageAgent = "report_weekly_agent";

            s.task.service = "services/war/report_weekly_service"

            s.task.serviceCustomer = s.task.service + "/agent_customer";

            s.task.hideAgentFilter = false;

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

                        url += "month=" + report.reportMonth.label.toUpperCase();
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

                    if (report.region) {
                        if (count > 0) {
                            url += "&";
                        }
                        url += "region=" + report.region;
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

            s.task.reportTable = $("#" + s.flow.getElementFlowId('reportTable'));

            s.task.print = {};

            s.task.print.current = function () {
                s.task.reportTable.print({
                    globalStyles: true,
                    iframe: true,
                    noPrintSelector: ".no-print",
                    manuallyCopyFormValues: true,
                    deferred: $.Deferred()
                })
            };

            s.flow.onRefreshed = function () {
                s.task.query();
            };
            s.task.load = function () {

                s.task.newReport = function () {
                    var report = {};
                    report.tag = "all";
                    report.size = 25;
                    report.start = 0;
                    report.isAgent = false;
                    report.isYear = false;
                    report.isMonth = false;
                    report.isRegion = false;

                    return report;
                };
                s.task.report = s.task.newReport();

                hp.check("agent", s.task)
                    .success(function (valid) {
                        s.task.hideAgentFilter = valid;
                        s.task.report.isAgent = valid;
                        s.task.report.agent = up.agent;
                        console.info("profileAgent", up);
                    });

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
                    var url = "services/war/report_weekly_service/agents?";

                    var agentId = (s.task.report.agent !== undefined ? s.task.report.agent.id : undefined);

                    var count = 0;

                    if (s.task.report.isYear) {
                        url += "isYear=true&year=" + s.task.report.year;
                        count++;
                    }


                    if (s.task.report.isMonth) {
                        if (count > 0) {
                            url += "&";
                        } else {
                            count++;
                        }
                        url += "isMonth=true&month=" + s.task.report.month;
                    }

                    if (s.task.report.isAgent) {
                        if (count > 0) {
                            url += "&"
                        } else {
                            count++;
                        }
                        url += "isAgent=true&agentId=" + agentId;
                    }

                    if (s.task.report.isRegion) {
                        if (count > 0) {
                            url += "&"
                        } else {
                            count++;
                        }
                        url += "isRegion=true&region=" + s.task.report.region;
                    }


                    if (s.task.valid() && s.task.report.closed === false) {
                        if (count > 0) {
                            url += "&"
                        }
                        if (s.task.report.size) {
                            url += "size=" + s.task.report.size;
                        }
                        if (s.task.report.tag) {
                            url += "&tag=" + s.task.report.tag;
                        }

                        if(s.task.report.start){
                            url += "&start=" + s.task.report.start;
                        }

                        s.http.get(url).success(function (data) {
                            s.task.report.size = data.size;
                            s.task.report.tag = data.tag;
                            s.task.report.weeklyReports = data.weeklyReports;
                        })
                    }
                };

                s.task.valid = function () {
                    var valid = true;

                    if (s.task.report.isYear) {
                        if (s.task.report.year === undefined) {
                            s.flow.message.danger("Please select a year.");
                            valid = false;
                        }
                    }


                    if (s.task.report.isMonth) {
                        if (s.task.report.month === undefined) {
                            s.flow.message.danger("Please select a month.");
                            valid = false;
                        }
                    }

                    if (s.task.report.isAgent) {
                        if (s.task.report.agent === undefined) {
                            s.flow.message.danger("Please select an agent.");
                            valid = false;
                        }
                    }

                    if (s.task.report.isRegion) {
                        if (s.task.report.region === undefined) {
                            s.flow.message.danger("Please select a region.");
                            valid = false;
                        }
                    }

                    return valid;

                }


            };

            s.task.postLoad = function () {
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
                })

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
                })
            };

            s.task.page.load = function () {
                if (this.name === s.task.pageAgent) {
                    s.task.query();
                }
            };
        }
    ])
    .controller("reportsMCtrl", ["$scope", "DTOptionsBuilder", "DTColumnBuilder", "flowMessageService", "flowModalService", "$compile", "$filter", "sessionService", "HOST", "$timeout", "flowFrameService", "hasProfile", "userProfile",
        function (s, dto, dtc, ms, fm, c, f, ss, h, t, ffs, hp, up) {

            s.task.hideAgentFilter = false;
            s.task.pageCustomer = "report_monthly_customer";

            s.task.newReport = function () {
                var report = {};
                report.tag = "all";
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

            s.task.load = function () {


                hp.check("agent", s.task)
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
                }
                s.task.query = function () {
                    var url = "services/war/report_monthly_service/customers?";

                    var count = 0;

                    if (s.task.report.isYear) {
                        url += "isYear=true&schoolYear=" + s.task.report.schoolYear;
                        count++;
                    }

                    if (s.task.report.isMonth) {
                        if (count > 0) {
                            url += "&";
                        } else {
                            count++;
                        }
                        url += "isMonth=true&month=" + s.task.report.month;
                    }

                    if (s.task.report.isAgent) {
                        if (count > 0) {
                            url += "&"
                        } else {
                            count++;
                        }
                        url += "isAgent=true&agentId=" + s.task.agent.id;
                    }

                    if (s.task.report.isRegion) {
                        if (count > 0) {
                            url += "&"
                        } else {
                            count++;
                        }
                        url += "isRegion=true&region=" + s.task.report.region;
                    }

                    if (s.task.report.isCustomer) {
                        if (count > 0) {
                            url += "&";
                        } else {
                            count++;
                        }
                        url += "isCustomer=true&customerId=" + s.task.customer.id;
                    }


                    if (s.task.valid()) {
                        if (count > 0) {
                            url += "&"
                        }
                        url += "size=" + s.task.report.size;
                        url += "&tag=" + s.task.report.tag;
                        url += "&start=" + s.task.report.start;
                        s.http.get(url).success(function (data) {
                            s.task.report = data;
                        })
                    }
                }
                s.task.valid = function () {
                    var valid = true;

                    if (s.task.report.isYear) {
                        if (s.task.report.schoolYear === undefined) {
                            s.flow.message.danger("Please select a year.");
                            valid = false;
                        }
                    }


                    if (s.task.report.isMonth) {
                        if (s.task.report.month === undefined) {
                            s.flow.message.danger("Please select a month.");
                            valid = false;
                        }
                    }

                    if (s.task.report.isAgent) {
                        if (s.task.agent === undefined) {
                            s.flow.message.danger("Please select an agent.");
                            valid = false;
                        }
                    }

                    if (s.task.report.isRegion) {
                        if (s.task.report.region === undefined) {
                            s.flow.message.danger("Please select a region.");
                            valid = false;
                        }
                    }

                    if (s.task.report.isCustomer) {
                        if (s.task.customer === undefined) {
                            s.flow.message.danger("Please select a customer");
                            valid = false;
                        }
                    }

                    return valid;

                }
                s.task.changeTag = function (filter, tag) {
                    if (tag === "all") {
                        filter.limitTo = {};
                    } else if (tag === "20") {
                        filter.limitTo = 20;
                    } else if (tag === "50") {
                        filter.limitTo = 50;
                    }
                }
            }

            s.task.postLoad = function () {
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
                })

                s.$watch(function (scope) {
                    return scope.task.report.month
                }, function () {
                    s.task.query();
                })

                s.$watch(function (scope) {
                    return scope.task.agent
                }, function () {
                    s.task.query();
                })

                s.$watch(function (scope) {
                    return scope.task.report.region
                }, function () {
                    s.task.query();
                })

                s.$watch(function (scope) {
                    return scope.task.customer
                }, function () {
                    s.task.query();
                })
            }

            s.task.page.load = function () {
                if (this.name === s.task.pageAgent) {
                    s.task.report = s.task.newReport();
                    s.task.query();
                }
            };
        }])
    .controller("reportCustomerSummary", ["$scope", "DTOptionsBuilder", "DTColumnBuilder", "flowMessageService", "flowModalService", "$compile", "$filter", "sessionService", "HOST", "$timeout", "flowFrameService", "hasProfile", "userProfile",
        function (s, dto, dtc, ms, fm, c, f, ss, h, t, ffs, hp, up) {

            s.task.home = "report_monthly_customer";
            s.task.view = "Table";

            s.task.refresh = function () {
                s.task.query();
            }

            s.flow.onRefreshed = function () {
                s.task.refresh();
            }

            s.task.page.load = function (data) {


                s.task.report = {};

                s.task.order = "materialsAdvisor";

                if (this.name === s.task.home) {
                    s.task.report.data = data;
                    s.task.report.filter = JSON.parse(this.getParam);

                    if (up.agent.id) {

                        this.title = up.agent.fullName + "'s Customer";

                        s.task.report.filter.regionCode = up.agent.region;

                        s.task.report.filter.agent = up.agent.id;

                        s.task.isAgent = true;
                    }


                }
            }


            s.task.selectSchoolYear = function (item) {
                if (s.task.report && s.task.report.filter && item) {
                    s.task.report.filter.schoolYear = item.id;
                    s.task.query();
                }
            }

            s.task.selectRegion = function (item) {
                if (s.task.report.filter && item) {
                    s.task.report.filter.regionCode = item.regionCode;
                    s.task.query();
                }
            }

            s.task.selectAgent = function (item) {
                if (s.task.report.filter && item) {
                    s.task.report.filter.agent = item.id;
                    s.task.query();
                }
            }


            s.task.query = function () {
                if (s.task.report.filter) {
                    console.info("agent-query", s.task.report);
                    var filter = JSON.stringify(s.task.report.filter);
                    s.flow.action("get", undefined, filter);
                }
            }

            s.task.clearFilters = function () {
                if (s.task.report.filter) {
                    s.task.report.filter = JSON.parse(s.task.page.getParam);
                    s.task.schoolYear = undefined;
                    s.task.agent = undefined;
                    s.task.region = undefined;
                    s.task.report.data = {};
                    s.task.query();
                }
            }


            s.task.tag = function (tag) {

                s.task.report.filter.tag = tag;
                if (tag === '20') {
                    s.task.order = "index";
                } else if (tag === '50') {
                    s.task.order = "index";
                } else {
                    s.task.order = "materialsAdvisor";
                }

                s.task.query();
            }

            s.$on(s.flow.event.getSuccessEventId(), function (event, data, method) {

                console.info("reports-monthly-summary- getSuccessEventId", method);

                if (method === "get") {
                    console.info("get", data);
                    s.task.report.data = data;
                }

            });

        }]);

