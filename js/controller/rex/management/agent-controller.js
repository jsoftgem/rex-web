/**
 * Created by Jerico on 1/11/2015.
 */
angular.module("agentController", ["fluid", "ngResource", "datatables", "flowServices", "angular.filter"])
    .controller("agentCtrl", ["$scope", "DTOptionsBuilder", "DTColumnBuilder", "flowMessageService", "flowModalService", "$compile", "$filter", "sessionService", function (s, dto, dtc, ms, fm, c, f, ss) {
        s.editPassword = false;

        var create = new CreateControl();
        create.id = "agent_create_ctl";

        create.action = function () {

            s.flow.goTo("agent_create");
        };

        var save = new SaveControl();
        save.id = "agent_edit_ctl";
        save.action = function () {
            $("#" + s.flow.getElementFlowId("agent_submit")).trigger("click");
        };

        s.save = function () {
            if (s.task.page.name === "agent_edit") {
                if (!angular.equals(s.task.agentEdit, s.task.editTemp)) {
                    if (!s.editPassword) {
                        s.task.agentEdit.user.password = null;
                    } else {
                        if (s.reTypePassword !== s.task.agentEdit.user.password) {
                            s.flow.message.warning("Password did not match.");
                            return;
                        }
                    }
                    s.flow.action("put", s.task.agentEdit, s.task.agentEdit.id);
                } else {
                    s.flow.message.info(UI_MESSAGE_NO_CHANGE);
                }
            } else if (s.task.page.name === "agent_create") {
                if (s.reTypePassword !== s.task.agentCreate.user.password) {
                    s.flow.message.warning("Password did not match.");
                    return;
                }
                s.flow.action("put", s.task.agentCreate);
            }
        };

        var deleteCtl = new DeleteControl();
        deleteCtl.id = "agent_del_ctl";

        s.dtOptions = new FlowOptionsGET(dto, s.flow.getHomeUrl(), s, c, ss);
        s.dtColumns = FlowColumns(dtc);
        s.dtColumns.push(dtc.newColumn("user.flowUserDetail.fullName").withTitle("Name").withOption("searchable", true));
        s.dtColumns.push(dtc.newColumn("region").withTitle("Region").withOption("searchable", true));
        s.dtColumns.push(dtc.newColumn("active").withTitle("Active").renderWith(function (data) {
            return renderCheckbox(data)
        }));
        s.dtColumns.push(dtc.newColumn("online").withTitle("Online").renderWith(function (data) {
            return renderCheckbox(data)
        }));

        s.dtColumns.push(dtc.newColumn("createdDt").withTitle("Date created").renderWith(function (data) {
            return renderDate(data, f);
        }).withOption("searchable", false));

        s.dtColumns.push(dtc.newColumn("startDt").withTitle("Last login date").renderWith(function (data) {
            return renderDate(data, f);
        }).withOption("searchable", false));

        s.edit = function (id) {
            s.task.agentEdit = {};
            s.task.agentEdit.user = {};
            s.task.editTemp = {};
            s.flow.goTo("agent_edit", id);
        };

        s.delete = function (id) {
            fm.show(s.flow.getElementFlowId("agentDeleteModal"));
            s.http.get("services/war/agent_query/getInstance/", id).success(function (data) {
                s.task.agentEdit = data;
            });
        };


        s.flow.onPageChanging = function (page) {

            if ("agent_create" === page) {
                s.task.agentCreate = {};
                s.task.agentCreate.user = {};
                s.task.agentCreate.user.flowUserDetail = {};
                s.task.agentCreate.user.flowUserDetail.secretQuestion = "When is your birthday? (yyyy-mm-dd)";
                s.reTypePassword = "";
                angular.copy(s.task.agentCreate, s.tempData);
                if (s.task.agentCreate.user.flowUserProfileSet === undefined) {
                    s.task.agentCreate.user.flowUserProfileSet = [];
                }
            }

            return true;
        }

        s.$on(s.flow.event.getSuccessEventId(), function (event, data, method) {
            if (method === "put") {
                if (s.task.page.name == "agent_edit") {
                    angular.copy(s.task.agentEdit, s.task.editTemp);
                    s.flow.goToHome();
                } else if (s.task.page.name === "agent_create") {
                    s.task.agentCreate = {};
                    angular.copy(s.task.agentCreate, s.tempData);
                    s.flow.goToHome();
                }

            }
            else if (method === "delete") {
                if (s.task.page.name === "agent_home") {
                    s.dtOptions.reloadData();
                }
            }
        });


        s.$on(s.flow.event.getResizeEventId(), function (event, page, size) {
            if (page === "agent_home") {
                s.dtOptions.reloadData();
            }
        });
        s.$on(s.flow.event.getResizeEventId(), function (event, page, size) {
            if (page === "agent_home") {
                s.dtOptions.reloadData();
            }
        });

        s.$on(s.flow.event.getRefreshId(), function () {
            s.dtOptions.reloadData();
        });

        s.flow.pageCallBack = function (page, data, source) {
            if ("agent_edit" === page) {
                if (!s.task.agentEdit.id || source === "refresh") {
                    s.task.agentEdit = data;
                    s.reTypePassword = s.task.agentEdit.user.password;
                    s.oldPassword = "";
                    angular.copy(s.task.agentEdit.user.password, s.oldPassword);
                }

            } else if ("agent_home" === page) {
                s.dtOptions.reloadData();

            }
            s.flow.addControl(save, ["agent_edit", "agent_create"]);
            s.flow.addControl(deleteCtl, "agent_edit");
            s.flow.addControl(create, "agent_home");
        };


        s.$on(s.flow.getEventId("agent_del_ctl"), function () {
            fm.show(s.flow.getElementFlowId("agentDeleteModal"));
        });

        s.deleteConfirm = function () {
            s.flow.action("delete", s.task.agentEdit, s.task.agentEdit.id);
            fm.hide(s.flow.getElementFlowId("agentDeleteModal"));
            if (s.task.page.name !== "agent_home") {
                s.flow.goToHome();
            }
            s.dtOptions.reloadData();
        };

        s.deleteCancel = function () {
            fm.hide(s.flow.getElementFlowId("agentDeleteModal"));
        };


    }])
    .controller("customerSummaryCtrl", ["$scope", "DTOptionsBuilder", "DTColumnBuilder", "flowMessageService", "flowModalService", "$compile", "$filter", "sessionService", "hasProfile", "userProfile", "imageService", function (s, dto, dtc, ms, fm, c, f, ss, hp, up, is) {

        s.imageService = is;
        s.flow.openTaskBaseUrl = "services/flow_task_service/getTask?showToolBar=false&size=100&";

        s.editCustomer = function (customerId) {
            s.flow.openTask("customer_task", "customer_edit", customerId, false);
        };
        s.editActivity = function (activityId) {
            s.flow.openTask("daily_task", "daily_edit", activityId, false);
        };

        s.task.preLoad = function () {
            this.homePage = "customer_agent_home";
            this.homeUrl = "services/war/customer_light_query/find_by_assigned_agent";

        };


        s.task.refresh = function () {
            if (s.task.page.name === s.task.homePage) {
                s.http.post(this.homeUrl)
                    .success(function (data) {
                        s.task.agent.summary.result = data;
                    });

                if (s.task.agent.selectedCustomer) {
                    s.flow.action("post", undefined, s.buildQuery());
                }
            }
        };

        s.$on(s.flow.event.getSuccessEventId(), function (event, data, method) {
            if (s.task.page.name === s.task.homePage) {
                if (method === "post") {
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
            s.task.agent.week = "all";
            s.task.agent.activity = {};
            s.task.agent.summary = {};

            if (this.name === s.task.homePage) {
                s.http.post(s.task.homeUrl)
                    .success(function (data) {
                        s.task.agent.summary.result = data;
                    }).then(function () {
                        s.task.agent = up.agent;
                    });
            }
        };


        s.filter = function () {
            s.flow.action("post", undefined, s.buildQuery());
        };

        s.buildQuery = function () {
            var url = "";
            if (s.task.agent.selectedCustomer) {

                url += "?customerId=" + s.task.agent.selectedCustomer.id

                if (s.task.agent.schoolYear) {
                    url += "&schoolYearId=" + s.task.agent.schoolYear.id;
                }

                if (s.task.agent.month) {
                    url += "&month=" + s.task.agent.month;
                }

                if (s.task.agent.week) {
                    url += "&week=" + s.task.agent.week;
                }
            }
            return url;
        };

        s.clearFilter = function () {
            s.task.agent.schoolYear = undefined;
            s.task.agent.month = undefined;
            s.task.agent.week = "all";
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
                var url = s.buildQuery() + "&start=" + s.task.agent.activity.previous;
                s.flow.action("post", undefined, url);
            }

        };

        s.next = function () {
            if (s.task.agent.activity.hasNext) {
                var url = s.buildQuery() + "&start=" + s.task.agent.activity.next;
                s.flow.action("post", undefined, url);
            }

        };

        s.goToSummary = function () {
            var param = s.task.agent.selectedCustomer.id;

            if (s.task.agent.schoolYear) {
                param += "?schoolYear=" + s.task.agent.schoolYear.id;
            }


            s.flow.goTo("customer_agent_summary", param);
        };


    }])
    .controller("customerInfoCtrl", ["$scope", "DTOptionsBuilder", "DTColumnBuilder", "flowMessageService", "flowModalService", "$compile", "$filter", "sessionService", "hasProfile", "userProfile", "imageService", function (s, dto, dtc, ms, fm, c, f, ss, hp, up, is) {

        s.task.page.load = function (data) {
            s.task.summaryPage = "customer_agent_summary";
            s.task.summaryUrl = "services/war/agent_customer_summary_query/customer_summary";
            s.task.chartId = s.flow.getElementFlowId("agentMonthlyBarChart");
            console.info(this.name, data);
            if (this.name === s.task.summaryPage) {
                s.task.agent = up.agent;
                s.task.summary = data;
                s.task.agent.schoolYear = data.schoolYear;
                s.task.title = s.task.summary.customer.school.name;
                s.task.createChart();
            }
        };

        s.task.refresh = function () {
            s.querySummary();
        };

        s.flow.onRefreshed = function () {
            s.task.refresh();
        };

        s.querySummary = function () {
            if (s.task.summary) {
                var param = s.task.summary.customer.id;
                if (s.task.agent.schoolYear) {
                    param += "?schoolYear=" + s.task.agent.schoolYear.id;
                }
                s.flow.action("get", undefined, param);
            }

        };

        s.task.createChart = function () {
            var ctx = document.getElementById(s.task.chartId).getContext("2d");
            new Chart(ctx).Bar(s.task.summary.chart);
        };

        s.$on(s.flow.event.getSuccessEventId(), function (event, data, method) {
            if (s.task.page.name === s.task.summaryPage) {
                if (method === "get") {
                    s.task.summary = data;
                    s.task.createChart();
                }
            }
        });


    }]);
