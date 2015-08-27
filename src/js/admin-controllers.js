/**
 * Created by Jerico on 11/16/2014.
 */
angular.module("adminControllers", ["fluid", "ngResource", "datatables"])
    .controller("usrMgrCtrl", ["$scope", "DTOptionsBuilder", "DTColumnBuilder", "flowMessageService", "flowModalService", "$compile", "$filter", "sessionService", function (s, dto, dtc, ms, fm, c, f, ss) {
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

        s.delete = function (id) {
            fm.show(s.flow.getElementFlowId("usrMgrDeleteModal"));
            s.http.get("services/flow_user_query/getInstance/", id).success(function (data) {
                s.task.usrMgrEdit = {};
                s.task.usrMgrEdit.flowInstance = data;
            });
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
                        s.dtInstance.rerender();
                    }
                }
            }
        });


        s.$on(s.flow.event.getResizeEventId(), function (event, usr_mgr, size) {
            if (usr_mgr === "usr_mgr_settings") {
                if (s.dtInstance) {
                    s.dtInstance.rerender();
                }
            }
        });
        s.$on(s.flow.event.getResizeEventId(), function (event, page, size) {
            if (page === "usr_mgr_settings") {
                if (s.dtInstance) {
                    s.dtInstance.rerender();
                }
            }
        });

        s.$on(s.flow.event.getRefreshId(), function () {
            if (s.dtInstance) {
                s.dtInstance.rerender();
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
                    s.dtInstance.rerender();
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
                s.dtInstance.rerender();
            }
        };

        s.deleteCancel = function () {
            fm.hide(s.flow.getElementFlowId("usrMgrDeleteModal"));
        };

    }])
    .controller("profileCtrl", ["$scope", "DTOptionsBuilder", "DTColumnBuilder", "flowMessageService", "flowModalService", "$compile", "$filter", "sessionService", function (s, dto, dtc, ms, fm, c, f, ss) {
        var create = new CreateControl();
        create.id = "profile_create_ctl";
        create.action = function () {
            s.task.profileCreate = {};
            s.task.profileCreate.flowProfilePermissions = [];
            s.flow.goTo("profile_create");
        };

        var save = new SaveControl();
        save.id = "profile_edit_ctl";
        save.action = function () {
            $("#" + s.flow.getElementFlowId("profile_submit")).trigger("click");
        };

        var deleteCtl = new DeleteControl();
        deleteCtl.id = "profile_del_ctl";
        deleteCtl.action = function () {
            fm.show(s.flow.getElementFlowId("profileDeleteModal"));
        };

        s.dtOptions = new FlowOptionsGET(dto, s.flow.getHomeUrl(), s, c, ss);
        s.dtColumns = FlowColumns(dtc);

        s.dtColumns.push(dtc.newColumn("profileName").withTitle("Name").withOption("searchable", true));
        s.dtColumns.push(dtc.newColumn("createdDt").withTitle("Date created").withOption("searchable", true).renderWith(function (data) {
            return renderDate(data, f);
        }));

        s.edit = function (id) {
            s.task.profileEdit = {};
            s.task.tempEdit = {};
            s.flow.goTo("profile_edit", id);
        };

        s.delete = function (id) {
            fm.show(s.flow.getElementFlowId("profileDeleteModal"));
            s.http.get("services/flow_user_profile_query/getInstance/", id).success(function (page) {
                s.task.profileEdit = page;
            });
        };

        s.save = function () {
            if (s.task.page.name == "profile_edit") {
                if (!angular.equals(s.task.profileEdit, s.task.tempEdit)) {
                    s.flow.action("put", s.task.profileEdit, s.task.profileEdit.id);
                } else {
                    s.flow.message.info(UI_MESSAGE_NO_CHANGE);
                }
            } else if (s.task.page.name === "profile_create") {
                s.flow.action("put", s.task.profileCreate);
            }
        };

        s.$on(s.flow.event.getSuccessEventId(), function (event, data, method) {
            if (method === "put") {
                if (s.task.page.name == "profile_edit") {
                    s.task.profileEdit = {};
                    angular.copy(s.task.profileEdit, s.task.tempEdit);
                    s.flow.goToHome();
                } else if (s.task.page.name === "profile_create") {
                    s.task.profileCreate = {};
                    s.flow.goToHome();
                }

            }
            else if (method === "delete") {
                if (s.task.page.name === "profile_settings") {
                    if (s.dtInstance) {
                        s.dtInstance.rerender();
                    }
                }
            }
        });


        s.$on(s.flow.event.getResizeEventId(), function (event, profile, size) {
            if (profile === "profile_settings") {
                if (s.dtInstance) {
                    s.dtInstance.rerender();
                }
            }
        });

        s.$on(s.flow.event.getRefreshId(), function () {
            if (s.dtInstance) {
                s.dtInstance.rerender();
            }
        });

        s.flow.pageCallBack = function (page, data, source) {
            if ("profile_edit" === page) {
                if (!s.task.profileEdit.id || source === "refresh") {
                    s.task.profileEdit = data;
                    if (!s.task.profileEdit.flowProfilePermissions) {
                        s.task.profileEdit.flowProfilePermissions = [];
                    }
                    angular.copy(s.task.profileEdit, s.task.tempEdit);
                }
            } else if ("profile_settings" === page) {
                if (s.dtInstance) {
                    s.dtInstance.rerender();
                }
            }
            s.flow.addControl(save, ["profile_edit", "profile_create"]);
            s.flow.addControl(deleteCtl, "profile_edit");
            s.flow.addControl(create, "profile_settings");
        };

        s.deleteConfirm = function () {
            s.flow.action("delete", s.task.profileEdit, s.task.profileEdit.id);
            fm.hide(s.flow.getElementFlowId("profileDeleteModal"));
            if (s.task.page.name !== "profile_settings") {
                s.flow.goToHome();
            }
            if (s.dtInstance) {
                s.dtInstance.rerender();
            }
        };

        s.deleteCancel = function () {
            fm.hide(s.flow.getElementFlowId("profileDeleteModal"));
        };

    }])
    .controller("groupCtrl", ["$scope", "DTOptionsBuilder", "DTColumnBuilder", "flowMessageService", "flowModalService", "$compile", "$filter", "sessionService", function (s, dto, dtc, ms, fm, c, f, ss) {

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

        s.delete = function (id) {
            fm.show(s.flow.getElementFlowId("groupDeleteModal"));
            s.http.get("services/flow_user_group_query/getInstance/", id).success(function (page) {
                s.task.groupEdit = page;
            });
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
                        s.dtInstance.rerender();
                    }
                }
            }
        });

        s.$on(s.flow.event.getResizeEventId(), function (event, group, size) {
            if (group === "group_settings") {
                if (s.dtInstance) {
                    s.dtInstance.rerender();
                }
            }
        });

        s.$on(s.flow.event.getRefreshId(), function () {
            if (s.dtInstance) {
                s.dtInstance.rerender();
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
                    s.dtInstance.rerender();
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
                s.dtInstance.rerender();
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

    }]);
