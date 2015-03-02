/**
 * Created by Jerico on 2/6/2015.
 */
angular.module("reportsController", ["fluid", "ngResource", "datatables", "angular.filter", "flowServices"])
    .controller("reportsCtrl", ["$scope", "DTOptionsBuilder", "DTColumnBuilder", "flowMessageService", "flowModalService",
        "$compile", "$filter", "sessionService", "HOST", "$timeout", "flowFrameService", "userProfile", "hasProfile",
        function (s, dto, dtc, ms, fm, c, f, ss, h, t, ffs, up, hp) {


            s.task.preLoad = function () {


                s.task.pageAgent = "report_weekly_agent";
                s.task.service = "services/war/report_weekly_service"
                s.task.serviceCustomer = s.task.service + "/agent_customer";
                s.task.hideAgentFilter = false;

                s.flow.pageCallBack = function (page, data) {
                    if (page === s.task.pageAgent) {
                        s.task.query();
                    }
                }

                s.$on(s.flow.event.getRefreshId(), function () {
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

                }

                s.task.getDayName = function (dayOfWeek) {
                    return getDayName(dayOfWeek);
                }
            }


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
                }
                s.task.report = s.task.newReport();

                hp.check("agent", s.task)
                    .success(function (valid) {
                        s.task.hideAgentFilter = valid;
                        s.task.report.isAgent = valid;
                        s.task.report.agent = up.agent;
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
                }
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
                        url += "isAgent=true&agent=" + agentId;
                    }

                    if (s.task.report.isRegion) {
                        if (count > 0) {
                            url += "&"
                        } else {
                            count++;
                        }
                        url += "isRegion=true&region=" + s.task.report.region;
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
                    return scope.task.report.year
                }, function () {
                    s.task.query();
                })

                s.$watch(function (scope) {
                    return scope.task.report.month
                }, function () {
                    s.task.query();
                })

                s.$watch(function (scope) {
                    return scope.task.report.agent
                }, function () {
                    s.task.query();
                })

                s.$watch(function (scope) {
                    return scope.task.report.region
                }, function () {
                    s.task.query();
                })
            }


        }
    ])
    .controller("reportsMCtrl", ["$scope", "DTOptionsBuilder", "DTColumnBuilder", "flowMessageService", "flowModalService", "$compile", "$filter", "sessionService", "HOST", "$timeout", "flowFrameService", "hasProfile", "userProfile",
        function (s, dto, dtc, ms, fm, c, f, ss, h, t, ffs, hp, up) {

            s.task.hideAgentFilter = false;
            s.task.preLoad = function () {
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
                }


                s.flow.pageCallBack = function (page, data) {
                    if (page === s.task.pageCustomer) {
                        s.task.report = s.task.newReport();
                        s.task.query();
                    }
                }

                s.$on(s.flow.event.getRefreshId(), function () {
                    s.task.query();
                })
            }

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


        }]);
