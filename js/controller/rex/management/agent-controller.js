/**
 * Created by Jerico on 1/11/2015.
 */
angular.module("agentController", ["fluid", "ngResource", "datatables"])
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
            if (s.page.name === "agent_edit") {
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
            } else if (s.page.name === "agent_create") {
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


         s.flow.onPageChanging = function(page){
                
            if("agent_create" === page){
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
                if (s.page.name == "agent_edit") {
                    angular.copy(s.task.agentEdit, s.task.editTemp);
                    s.flow.goToHome();
                } else if (s.page.name === "agent_create") {
                    s.task.agentCreate = {};
                    angular.copy(s.task.agentCreate, s.tempData);
                    s.flow.goToHome();
                }

            }
            else if (method === "delete") {
                if (s.page.name === "agent_home") {
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
            if (s.page.name !== "agent_home") {
                s.flow.goToHome();
            }
            s.dtOptions.reloadData();
        };

        s.deleteCancel = function () {
            fm.hide(s.flow.getElementFlowId("agentDeleteModal"));
        };



    }]);
