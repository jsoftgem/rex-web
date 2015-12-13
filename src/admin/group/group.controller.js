(function () {
    'use strict'
    angular.module('war.admin')
        .controller('groupCtrl', GroupCtrl);

    GroupCtrl.$inject = ['$scope', 'DTOptionsBuilder', 'DTColumnBuilder', 'flowMessageService', 'flowModalService', '$compile', '$filter', 'sessionService'];

    function GroupCtrl(s, dto, dtc, ms, fm, c, f, ss) {

        if (!s.task.editTemp) {
            s.task.editTemp = {};
        }
        if (!s.task.createTemp) {
            s.task.createTemp = {};
        }

        var create = new CreateControl();
        create.id = "group_create_ctl";
        create.action = function (page) {
            s.flow.goTo("group_create").then(function () {
                s.task.groupCreate = {};
                s.task.groupCreate.flowUsers = [];
                s.task.groupCreate.flowUserGroupModules = [];
                angular.copy(s.task.groupCreate, s.task.createTemp);
            });
        };


        var save = new SaveControl();
        save.id = "group_edit_ctl";
        save.action = function () {
            if (s.task.page.name === "group_usr_mgr_create") {
                $("#" + s.flow.getElementFlowId("usrMgr_submit")).trigger("click");
            } else {
                $("#" + s.flow.getElementFlowId("group_submit")).trigger("click");
            }
        };

        var deleteCtl = new DeleteControl();
        deleteCtl.id = "group_del_ctl";

        s.dtOptions = new FlowOptionsGET(dto, s.flow.getHomeUrl(), s, c, ss);
        s.dtColumns = FlowColumns(dtc);

        s.dtColumns.push(dtc.newColumn("groupName").withTitle("Name").withOption("searchable", true));
        s.dtColumns.push(dtc.newColumn("groupTitle").withTitle("Title").withOption("searchable", true));
        s.dtColumns.push(dtc.newColumn("groupAdminFullname").withTitle("Admin").withOption("searchable", true));
        s.dtColumns.push(dtc.newColumn("createdDt").withTitle("Date created").renderWith(function (data) {
            return renderDate(data, f);
        }));

        s.edit = function (id) {
            s.task.groupEdit = {};
            s.flow.goTo("group_edit", id);
        };

        s.delete = function (data) {
            s.task.groupEdit = data;
            fm.show(s.flow.getElementFlowId("groupDeleteModal"));
        };

        s.save = function () {
            if (s.task.page.name == "group_edit") {
                if (!angular.equals(s.task.groupEdit, s.task.editTemp)) {
                    for (var i = 0; i < s.task.groupEdit.flowUserGroupModules.length; i++) {
                        s.task.groupEdit.flowUserGroupModules[i].groupName = s.task.groupEdit.groupName;
                    }
                    s.flow.action("put", s.task.groupEdit, s.task.groupEdit.id);

                } else {
                    s.flow.message.info(UI_MESSAGE_NO_CHANGE);
                }
            } else if (s.task.page.name === "group_create") {
                for (var i = 0; i < s.task.groupCreate.flowUserGroupModules.length; i++) {
                    s.task.groupCreate.flowUserGroupModules[i].groupName = s.task.groupCreate.groupName;
                }
                s.flow.action("put", s.task.groupCreate);
            }
        };

        s.$on(s.flow.event.getSuccessEventId(), function (event, data, method) {
            if (method === "put") {
                if (s.task.page.name == "group_edit") {
                    angular.copy(s.task.groupEdit, s.task.editTemp);
                    s.flow.goToHome();
                } else if (s.task.page.name === "group_create") {
                    s.task.groupCreate = {};
                    angular.copy(s.task.groupCreate, s.task.createTemp);
                    s.flow.goToHome();
                }
            }
            else if (method === "delete") {
                if (s.task.page.name === "group_settings") {
                    if (s.dtInstance) {
                        s.dtInstance.reloadData();
                    }
                }
            }
        });

        s.$on(s.flow.event.getResizeEventId(), function (event, group, size) {
            if (group === "group_settings") {
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
            if ("group_edit" === page) {
                if (!s.task.groupEdit.id || source === "refresh") {
                    s.task.groupEdit = data;
                    angular.copy(s.task.groupEdit, s.task.editTemp);
                }
            } else if ("group_settings" === page) {
                if (s.dtInstance) {
                    s.dtInstance.reloadData();
                }
            }
            s.flow.addControl(create, "group_settings");
            s.flow.addControl(save, ["group_edit", "group_create"]);
            s.flow.addControl(deleteCtl, "group_edit");
        };

        s.$on(s.flow.getEventId("group_del_ctl"), function () {
            fm.show(s.flow.getElementFlowId("groupDeleteModal"));
        });

        s.deleteConfirm = function () {
            s.flow.action("delete", s.task.groupEdit, s.task.groupEdit.id);
            fm.hide(s.flow.getElementFlowId("groupDeleteModal"));
            if (s.task.page.name !== "group_settings") {
                s.flow.goToHome();
            }
            if (s.dtInstance) {
                s.dtInstance.reloadData();
            }
        };

        s.deleteCancel = function () {
            fm.hide(s.flow.getElementFlowId("groupDeleteModal"));
        };

        s.$on(s.flow.getEventId("createFlowModules"), function () {
            s.task.groupModuleEdit = false;
            s.task.groupModule = {};
            s.task.groupModule.flowUserGroupTask = {};
            fm.show(s.flow.getElementFlowId("groupModuleModal"));
        });

        s.$on(s.flow.getEventId('editFlowModules'), function (event, id) {
            s.task.groupModuleEdit = true;
            var groupModule;
            if (s.task.page.name === "group_create") {
                for (var i = 0; i < s.task.groupEdit.flowUserGroupModules.length; i++) {
                    var mod = s.task.groupEdit.flowUserGroupModules[i];
                    if (mod.flowModuleId === id) {
                        groupModule = mod;
                        break;
                    }
                }
            } else if (s.task.page.name === "group_edit") {
                for (var i = 0; i < s.task.groupEdit.flowUserGroupModules.length; i++) {
                    var mod = s.task.groupEdit.flowUserGroupModules[i];
                    if (mod.flowModuleId === id) {
                        groupModule = mod;
                        break;
                    }
                }
            }
            s.task.groupModule = groupModule;
            fm.show(s.flow.getElementFlowId("groupModuleModal"));
        });

        s.addGroupModule = function () {
            if (s.task.page.name === "group_create") {

                var contains = false;
                var index = 0;
                for (var i = 0; i < s.task.groupCreate.flowUserGroupModules.length; i++) {
                    var mod = s.task.groupCreate.flowUserGroupModules[i];
                    if (mod.flowModuleId === s.task.groupModule.flowModuleId) {
                        contains = true;
                        index = i;
                        break;
                    }
                }


                if (contains && !s.task.groupModuleEdit) {
                    ms.danger(s.flow.getElementFlowId("groupModuleModalMsg"), "Module already exists in group.", 2000).open();
                } else {
                    if (s.task.groupModuleEdit) {
                        s.task.groupCreate.flowUserGroupModules[index] = s.task.groupModule;
                    } else {
                        s.task.groupCreate.flowUserGroupModules.push(s.task.groupModule);
                    }

                    fm.hide(s.flow.getElementFlowId("groupModuleModal"));

                }
            } else if (s.task.page.name === "group_edit") {
                if (!s.task.groupEdit.flowUserGroupModules) {
                    s.task.groupEdit.flowUserGroupModules = [];
                }

                var contains = false;
                var index = 0;
                for (var i = 0; i < s.task.groupEdit.flowUserGroupModules.length; i++) {
                    var mod = s.task.groupEdit.flowUserGroupModules[i];
                    if (mod.flowModuleId === s.task.groupModule.flowModuleId) {
                        contains = true;
                        index = i;
                        break;
                    }
                }

                if (contains && !s.task.groupModuleEdit) {
                    ms.danger(s.flow.getElementFlowId("groupModuleModalMsg"), "Module already exists in group.", 2000).open();
                } else {
                    if (s.task.groupModuleEdit) {
                        s.task.groupEdit.flowUserGroupModules[index] = s.task.groupModule;
                    } else {
                        s.task.groupEdit.flowUserGroupModules.push(s.task.groupModule);
                    }
                    fm.hide(s.flow.getElementFlowId("groupModuleModal"));
                }


            }

        };

        s.cancelGroupModule = function () {
            fm.hide(s.flow.getElementFlowId("groupModuleModal"));
        };

    }
})();