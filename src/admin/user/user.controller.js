(function () {
    'use strict';
    angular.module('war.admin')
        .controller('usrMgrCtrl', UsrMgrCtrl);
    UsrMgrCtrl.$inject = ['$scope', 'DTOptionsBuilder', 'DTColumnBuilder', 'flowMessageService', 'flowModalService', '$compile', '$filter', 'sessionService'];
    function UsrMgrCtrl(s, dto, dtc, ms, fm, c, f, ss) {

        s.task.editPassword = false;
        var create = new CreateControl();
        create.id = "usr_mgr_create_ctl";
        create.action = function () {
            s.task.usrMgrCreate = {};
            s.task.usrMgrCreate.flowInstance = {};
            s.task.usrMgrCreate.flowInstance.flowUserDetail = {};
            s.task.usrMgrCreate.flowUserGroup = {};
            s.task.reTypePassword = "";
            angular.copy(s.task.usrMgrModel, s.tempData);
            if (s.task.usrMgrCreate.flowInstance.flowUserProfileSet === undefined) {
                s.task.usrMgrCreate.flowInstance.flowUserProfileSet = [];
            }
            s.flow.goTo("usr_mgr_create");
        };

        var save = new SaveControl();
        save.id = "usr_mgr_edit_ctl";
        save.action = function () {
            $("#" + s.flow.getElementFlowId("usrMgr_submit")).trigger("click");
        };

        s.save = function () {
            if (s.task.page.name === "usr_mgr_edit") {
                if (!angular.equals(s.task.usrMgrEdit, s.task.editTemp)) {
                    console.info("retyped", s.task.reTypePassword);
                    if (!s.task.editPassword) {
                        s.task.usrMgrEdit.flowInstance.password = null;
                    } else {
                        if (s.task.reTypePassword !== s.task.usrMgrEdit.flowInstance.password) {
                            s.flow.message.warning("Password did not match.");
                            return;
                        }
                    }
                    s.flow.action("put", s.task.usrMgrEdit, s.task.usrMgrEdit.flowInstance.id);
                } else {
                    s.flow.message.info(UI_MESSAGE_NO_CHANGE);
                }
            } else if (s.task.page.name === "usr_mgr_create") {
                if (s.task.reTypePassword !== s.task.usrMgrCreate.flowInstance.password) {
                    s.flow.message.warning("Password did not match.");
                    return;
                }
                s.flow.action("put", s.task.usrMgrCreate);
            }
        };

        var deleteCtl = new DeleteControl();
        deleteCtl.id = "usr_mgr_del_ctl";

        s.dtOptions = new FlowOptionsGET(dto, s.flow.getHomeUrl(), s, c, ss);
        s.dtColumns = FlowColumns(dtc);

        s.dtColumns.push(dtc.newColumn("username").withTitle("Username").withOption("searchable", true));
        s.dtColumns.push(dtc.newColumn("email").withTitle("Email").withOption("searchable", true));
        s.dtColumns.push(dtc.newColumn("group").withTitle("Group").withOption("searchable", false).withOption("sortable", false));


        s.edit = function (id) {
            s.task.usrMgrEdit = {};
            s.task.usrMgrEdit.flowInstance = {};
            s.task.editTemp = {};
            s.flow.goTo("usr_mgr_edit", id);
        };

        s.delete = function (data) {
            s.task.usrMgrEdit = {};
            s.task.usrMgrEdit.flowInstance = data;
            fm.show(s.flow.getElementFlowId("usrMgrDeleteModal"));

        };


        s.$on(s.flow.event.getSuccessEventId(), function (event, data, method) {
            if (method === "put") {
                if (s.task.page.name == "usr_mgr_edit") {
                    angular.copy(s.task.usrMgrEdit, s.task.editTemp);
                    s.flow.goToHome();
                } else if (s.task.page.name === "usr_mgr_create") {
                    s.task.usrMgrCreate = {};
                    s.task.usrMgrCreate.flowUserGroup = {};
                    angular.copy(s.task.usrMgrCreate, s.tempData);
                    s.flow.goToHome();
                }

            }
            else if (method === "delete") {
                if (s.task.page.name === "usr_mgr_settings") {
                    if (s.dtInstance) {
                        s.dtInstance.reloadData();
                    }
                }
            }
        });


        s.$on(s.flow.event.getResizeEventId(), function (event, usr_mgr, size) {
            if (usr_mgr === "usr_mgr_settings") {
                if (s.dtInstance) {
                    s.dtInstance.reloadData();
                }
            }
        });
        s.$on(s.flow.event.getResizeEventId(), function (event, page, size) {
            if (page === "usr_mgr_settings") {
                if (s.dtInstance) {
                    s.dtInstance.reloadData();
                }
            }
        });

        s.$on(s.flow.event.getRefreshId(), function () {
            if (s.dtInstance) {
                s.dtInstance.reloadData();
            }
        });

        s.flow.pageCallBack = function (page, data, source) {
            if ("usr_mgr_edit" === page) {
                if (!s.task.usrMgrEdit.flowInstance.id || source === "refresh") {
                    s.task.usrMgrEdit.flowInstance = data;
                    s.task.reTypePassword = s.task.usrMgrEdit.flowInstance.password;
                    s.oldPassword = "";
                    angular.copy(s.task.usrMgrEdit.flowInstance.password, s.oldPassword);
                    if (s.task.usrMgrEdit.flowInstance.flowUserProfileSet === undefined) {
                        s.task.usrMgrEdit.flowInstance.flowUserProfileSet = [];
                    }
                    s.http.get("services/flow_user_group_query/getInstanceByUserId/", s.task.usrMgrEdit.flowInstance.id)
                        .success(function (data) {
                            s.task.usrMgrEdit.flowUserGroup = data;
                            angular.copy(s.task.usrMgrEdit, s.task.editTemp);
                        });
                }

            } else if ("usr_mgr_settings" === page) {
                if (s.dtInstance) {
                    s.dtInstance.reloadData();
                }

            }
            s.flow.addControl(save, ["usr_mgr_edit", "usr_mgr_create"]);
            s.flow.addControl(deleteCtl, "usr_mgr_edit");
            s.flow.addControl(create, "usr_mgr_settings");
        };


        s.$on(s.flow.getEventId("usr_mgr_del_ctl"), function () {
            fm.show(s.flow.getElementFlowId("usrMgrDeleteModal"));
        });

        s.deleteConfirm = function () {
            s.flow.action("delete", s.task.usrMgrEdit, s.task.usrMgrEdit.flowInstance.id);
            fm.hide(s.flow.getElementFlowId("usrMgrDeleteModal"));
            if (s.task.page.name !== "usr_mgr_settings") {
                s.flow.goToHome();
            }
            if (s.dtInstance) {
                s.dtInstance.reloadData();
            }
        };

        s.deleteCancel = function () {
            fm.hide(s.flow.getElementFlowId("usrMgrDeleteModal"));
        };

    }

})();
