/**
 * Created by Jerico on 1/11/2015.
 */
angular.module("agentController", ["fluid", "ngResource", "datatables", "flowServices"])
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


        s.agent = up.agent;
        s.imageService = is;
        s.flow.openTaskBaseUrl = "services/flow_task_service/getTask?showToolBar=false&size=100&";

        s.editCustomer = function (customerId) {
            s.task.agent = up.agent;
            s.flow.openTask("customer_task", "customer_edit", customerId, false);
        }

        s.task.preLoad = function () {


            s.task.homePage = "customer_agent_home";

            s.task.homeUrl = "services/war/customer_light_query/find_by_assigned_agent"

            hp.check("agent", s.task)
                .success(function (valid) {
                    s.task.hideAgentFilter = valid;
                    s.task.agent = up.agent;
                });

            s.task.newSummary = function () {
                var summary = {};
                summary.isSchoolYear = false;
                summary.schoolYear = undefined;
                summary.isAgent = false;

                return summary;
            }

            s.task.summary = s.task.newSummary();

            s.flow.pageCallBack = function (page, data) {
                console.info(page, data);
                if (page === s.task.homePage) {
                    s.http.post(s.task.homeUrl)
                        .success(function (data) {
                            s.task.summary.result = data;
                        });
                }

            }
            s.flow.onRefreshed = function () {
                if (s.task.page.name === s.task.homePage) {
                    s.http.post(s.task.homeUrl)
                        .success(function (data) {
                            s.task.summary.result = data;
                        });
                }
            }
            s.task.change = function () {
                s.task.report.start = 0;
                s.task.report.size = 25;

                if (!s.task.report.isYear) {
                    s.task.report.schoolYear = undefined;
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
        }


        s.select = function (school) {
            s.selectedCustomer = school;
        }

    }]);
