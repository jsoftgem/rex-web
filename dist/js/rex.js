/**
 * Created by rickzx98 on 8/30/15.
 */

angular.module("war.resources", ["war.session"])
    .factory("WarResource", ["$resource", function (resource) {
        var warResource = function (options) {
            var rs = resource(options);

            rs.getAvatarPath = function (fileId) {
                return withHost("services/download_service/getContent/" + fileId);
            };

            return rs;
        };
        return warResource;
    }])
    .factory("FlowUserDetail", ["WarResource", function (resource) {
        var flowUserDetail = resource(withHost("services/v2/user/detail/:path"));

        flowUserDetail.currentDetail = function (flowUserId, fn) {
            return flowUserDetail.get({path: flowUserId}, fn);
        };


        return flowUserDetail;
    }])
    .factory("WarAgent", ["WarResource", function (resource) {
        var warAgent = resource(withHost("services/v2/war/agent/:path"));

        warAgent.current = function (fn) {
            return warAgent.get({path: "current-agent"}, fn);
        };

        return warAgent;
    }])
    .factory("TaskResource", ["WarResource", function (resource) {

        var taskResource = resource(withHost("services/v2/task/:path"));

        taskResource.getSessionTasks = function (fn) {
            return taskResource.query({path: "user"}, fn);
        };


        return taskResource;

    }])
    .factory("GroupResource", ["WarResource", function (resource) {


        var groupResource = resource(withHost("services/v2/user/group/:path"));

        groupResource.getByName = function (name, fn) {
            groupResource.get({path: "by-name", name: name}, fn);
        };

        return groupResource;

    }]);;/**
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
                    0;
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
                        s.dtInstance.reloadData();
                    }
                }
            }
        });


        s.$on(s.flow.event.getResizeEventId(), function (event, profile, size) {
            if (profile === "profile_settings") {
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
                    s.dtInstance.reloadData();
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
                s.dtInstance.reloadData();
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

    }]);
;'use strict';
angular.module("app", ["MAdmin", "war.resources", "war.session", "war.sidebar", "datatables", "datatables.bootstrap", "datatables.tabletools", "datatables.colvis", "flowServices", "flowFactories", "home", "fluid", "devControllers", "adminControllers", "flowAppDirectives", "sessionControllers", "infinite-scroll", "ngDragDrop", "rexTemplates"])
    .run(["flowFrameService", "flowHttpService", "userProfile", "responseEvent", "userAppSetting", "HOST", "hasProfile", "$rootScope", "sessionService", "UserFactory", "FlowUserDetail", "WarAgent", "TaskResource", "GroupResource",
        function (f, fhp, up, re, uas, h, hp, rs, ss, uf, FlowUserDetail, WarAgent, TaskResource, GroupResource) {
            fhp.host = h;
            fhp.permissionUrl = "services/flow_permission/has_permission";
            rs.$watch(function () {
                return uf.isAuthenticated();
            }, function (session) {
                if (session) {
                    0;
                    0;

                    FlowUserDetail.currentDetail(uf.getUser().flowUserDetailId, function (userDetail) {
                        up.createUserProfile(userDetail);
                    });

                    WarAgent.current(function (agent) {
                        up.agent = agent;
                    });


                    TaskResource.getSessionTasks(function (tasks) {
                        angular.forEach(tasks, function (task) {
                            f.addTask(task);
                        });
                    });

                    GroupResource.getByName(uf.getUser().group, function (group) {
                        up.group = group;
                        up.group.emblemPath = GroupResource.getAvatarPath(up.group.emblemId);
                        0;
                    });

                } else {
                    window.location = "signin.html";
                }
            });
            re.addResponse(undefined, 401, true, "signin.html");
            re.addResponse("NOT_AUTHENTICATED", 401);
            /*   fns.url = "session/notification/alerts";
             fns.topUrl = "session/notification/top?limit=5";*/
            hp.url = "services/flow_permission/has_profile";

        }])
    .filter('setDecimal', function ($filter) {
        return function (input, places) {
            if (isNaN(input)) return input;
            // If we want 1 decimal place, we want to mult/div by 10
            // If we want 2 decimal places, we want to mult/div by 100, etc
            // So use the following to create that factor
            var factor = "1" + Array(+(places > 0 && places + 1)).join("0");
            return Math.round(input * factor) / factor;
        };
    })
    .filter("reportWeek", function () {
        return function (input) {
            var week = {};
            if (input > 0) {
                week.selectedWeek = input;
            }
            return week;
        }
    })
    .filter("totalFrequency", function () {
        return function (items, userAccessLevel) {
            var filtered = [];
            var $totalFrequency = {value: 0};
            angular.forEach(items, function (item) {
                this.value += item.customerFrequency;
            }, $totalFrequency);
            filtered.push({frequency: $totalFrequency.value});
            return filtered;
        }
    });

 

;/**
 * Created by Jerico on 3/11/2015.
 */
Chart.defaults.global = {
    // Boolean - Whether to animate the chart
    animation: true,

    // Number - Number of animation steps
    animationSteps: 60,

    // String - Animation easing effect
    animationEasing: "easeOutQuart",

    // Boolean - If we should show the scale at all
    showScale: true,

    // Boolean - If we want to override with a hard coded scale
    scaleOverride: false,

    // ** Required if scaleOverride is true **
    // Number - The number of steps in a hard coded scale
    scaleSteps: null,
    // Number - The value jump in the hard coded scale
    scaleStepWidth: null,
    // Number - The scale starting value
    scaleStartValue: null,

    // String - Colour of the scale line
    scaleLineColor: "rgba(0,0,0,.1)",

    // Number - Pixel width of the scale line
    scaleLineWidth: 1,

    // Boolean - Whether to show labels on the scale
    scaleShowLabels: true,

    // Interpolated JS string - can access value
    scaleLabel: "<%=value%>",

    // Boolean - Whether the scale should stick to integers, not floats even if drawing space is there
    scaleIntegersOnly: true,

    // Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
    scaleBeginAtZero: false,

    // String - Scale label font declaration for the scale label
    scaleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

    // Number - Scale label font size in pixels
    scaleFontSize: 12,

    // String - Scale label font weight style
    scaleFontStyle: "normal",

    // String - Scale label font colour
    scaleFontColor: "#666",

    // Boolean - whether or not the chart should be responsive and resize when the browser does.
    responsive: false,

    // Boolean - whether to maintain the starting aspect ratio or not when responsive, if set to false, will take up entire container
    maintainAspectRatio: true,

    // Boolean - Determines whether to draw tooltips on the canvas or not
    showTooltips: true,

    // Function - Determines whether to execute the customTooltips function instead of drawing the built in tooltips (See [Advanced - External Tooltips](#advanced-usage-custom-tooltips))
    customTooltips: false,

    // Array - Array of string names to attach tooltip events
    tooltipEvents: ["mousemove", "touchstart", "touchmove"],

    // String - Tooltip background colour
    tooltipFillColor: "rgba(0,0,0,0.8)",

    // String - Tooltip label font declaration for the scale label
    tooltipFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

    // Number - Tooltip label font size in pixels
    tooltipFontSize: 14,

    // String - Tooltip font weight style
    tooltipFontStyle: "normal",

    // String - Tooltip label font colour
    tooltipFontColor: "#fff",

    // String - Tooltip title font declaration for the scale label
    tooltipTitleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

    // Number - Tooltip title font size in pixels
    tooltipTitleFontSize: 14,

    // String - Tooltip title font weight style
    tooltipTitleFontStyle: "bold",

    // String - Tooltip title font colour
    tooltipTitleFontColor: "#fff",

    // Number - pixel width of padding around tooltip text
    tooltipYPadding: 6,

    // Number - pixel width of padding around tooltip text
    tooltipXPadding: 6,

    // Number - Size of the caret on the tooltip
    tooltipCaretSize: 8,

    // Number - Pixel radius of the tooltip border
    tooltipCornerRadius: 6,

    // Number - Pixel offset from point x to tooltip edge
    tooltipXOffset: 10,

    // String - Template string for single tooltips
    tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= value %>",

    // String - Template string for multiple tooltips
    multiTooltipTemplate: "<%= datasetLabel %> - <%= value %>",

    // Function - Will fire on animation progression.
    onAnimationProgress: function () {
    },

    // Function - Will fire on animation completion.
    onAnimationComplete: function () {
    }
};/**
 * Created by Jerico on 11/5/2014.
 */
angular.module("devControllers", ["fluid", "ngResource", "datatables"])
    .controller("menuCtrl", ["$scope", "flowFrameService", "flowHttpService", function (s, f, ff) {

        s.addModule = function (module) {
            f.addTask(module.task);
        };


        s.view = "list";

        s.switchView = function (view) {
            s.view = view;
        };

        s.flow.pageCallBack = function (page, data) {
            s.resultData = data;
        };

    }])
    .controller("pageCtrl", ["$scope", "DTOptionsBuilder", "DTColumnBuilder", "flowMessageService", "flowModalService", "$filter", "$compile", "sessionService", function (s, dto, dtc, ms, fm, f, c, ss) {


        var create = new CreateControl();
        create.id = "page_create_ctl";
        create.action = function () {
            s.task.pageCreate = {};
            s.flow.goTo("page_create");
        };

        var save = new SaveControl();
        save.id = "page_edit_ctl";
        save.action = function () {
            $("#" + s.flow.getElementFlowId("page_submit")).trigger("click");
        };

        var deleteCtl = new DeleteControl();
        deleteCtl.id = "page_del_ctl";
        deleteCtl.action = function () {
            fm.show(s.flow.getElementFlowId("pageDeleteModal"));
        };

        s.dtOptions = new FlowOptionsGET(dto, s.flow.getHomeUrl(), s, c, ss);
        s.dtColumns = FlowColumns(dtc);
        s.dtColumns.push(dtc.newColumn("name").withTitle("Name"));
        s.dtColumns.push(dtc.newColumn('title').withTitle('Title').withOption("searchable", true));
        s.dtColumns.push(dtc.newColumn('home').withTitle("Page Url").withOption("searchable", true));
        s.dtColumns.push(dtc.newColumn('isHome').withTitle('Home').withOption("searchable", false).renderWith(function (data) {
            return renderCheckbox(data);
        }));
        s.dtColumns.push(dtc.newColumn("createdDt").withTitle("Date created").renderWith(function (data, type, full, meta) {
            return f('date')(data, "medium");
        }).withOption("searchable", false));
        s.dtColumns.push(dtc.newColumn('get').withTitle('Get URI').withOption("searchable", false).notSortable());
        s.dtColumns.push(dtc.newColumn('post').withTitle('POST URI').withOption("searchable", false).notSortable());
        s.dtColumns.push(dtc.newColumn('put').withTitle('Put URI').withOption("searchable", false).notSortable());
        s.dtColumns.push(dtc.newColumn('delURL').withTitle('Delete URI').withOption("searchable", false).notSortable());
        s.dtColumns.push(dtc.newColumn('pageLinkEnabled').withTitle('Page Link').withOption("searchable", false).notSortable().renderWith(function (data) {
            return renderCheckbox(data);
        }));
        s.dtColumns.push(dtc.newColumn('autoGet').withTitle('Auto loading').withOption("searchable", false).notSortable().renderWith(function (data) {
            return renderCheckbox(data);
        }));

        s.edit = function (id) {
            s.task.pageEdit = {};
            s.task.editTemp = {};
            s.flow.goTo("page_edit", id);
        };

        s.delete = function (id) {
            fm.show(s.flow.getElementFlowId("pageDeleteModal"));
            s.http.get("services/flow_page_query/getInstance/", id).success(function (page) {
                s.task.pageEdit = page;
            });
        };

        s.save = function () {
            if (s.task.page.name == "page_edit") {
                if (!angular.equals(s.task.pageEdit, s.task.editTemp)) {
                    s.flow.action("put", s.task.pageEdit, s.task.pageEdit.id);
                } else {
                    s.flow.message.info(UI_MESSAGE_NO_CHANGE);
                }
            } else if (s.task.page.name === "page_create") {
                s.flow.action("put", s.task.pageCreate);
            }
        };

        s.$on(s.flow.event.getSuccessEventId(), function (event, data, method) {
            if (method === "put") {
                if (s.task.page.name === "page_edit") {
                    angular.copy(s.task.pageEdit, s.task.editTemp);
                    s.flow.goToHome();
                } else if (s.task.page.name === "page_create") {
                    s.task.pageCreate = {};
                    s.flow.goToHome();
                }
            }
            else if (method === "delete") {
                if (s.task.page.name === "page_settings") {
                    if (s.dtInstance) {
                        s.dtInstance.reloadData();
                    }
                }
            }

        });

        s.$on(s.flow.event.getResizeEventId(), function (event, page, size) {
            if (page === "page_settings") {
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
            if ("page_edit" === page) {
                if (!s.task.pageEdit.id || source === "refresh") {
                    s.task.pageEdit = data;
                    angular.copy(s.task.pageEdit, s.task.editTemp);
                }
            } else if ("page_settings" === page) {
                if (s.dtInstance) {
                    s.dtInstance.reloadData();
                }
            }
            s.flow.addControl(save, ["page_edit", "page_create"]);
            s.flow.addControl(deleteCtl, "page_edit");
            s.flow.addControl(create, "page_settings");
        };

        s.deleteConfirm = function () {
            s.flow.action("delete", s.task.pageEdit, s.task.pageEdit.id);
            fm.hide(s.flow.getElementFlowId("pageDeleteModal"));
            if (s.task.page.name !== "page_settings") {
                s.flow.goToHome();
            }
            if (s.dtInstance) {
                s.dtInstance.reloadData();
            }
        };

        s.deleteCancel = function () {
            fm.hide(s.flow.getElementFlowId("pageDeleteModal"));
        };

    }])
    .controller("taskCtrl", ["$scope", "DTOptionsBuilder", "DTColumnBuilder", "flowMessageService", "flowModalService", "$compile", "sessionService", function (s, dto, dtc, ms, fm, c, ss) {


        var create = new CreateControl();
        create.id = "task_create_ctl";
        create.action = function () {
            s.task.tskCreate = {};
            s.flow.goTo("task_create");
        };

        var save = new SaveControl();
        save.id = "task_edit_ctl";
        save.action = function () {
            $("#" + s.flow.getElementFlowId("task_submit")).trigger("click");
        };

        var deleteCtl = new DeleteControl();
        deleteCtl.id = "task_del_ctl";
        deleteCtl.action = function () {
            fm.show(s.flow.getElementFlowId("taskDeleteModal"));
        };

        s.dtOptions = new FlowOptionsGET(dto, s.flow.getHomeUrl(), s, c, ss);

        s.dtColumns = FlowColumns(dtc);

        s.dtColumns.push(dtc.newColumn("id").withTitle("Task ID").withOption("searchable", false));
        s.dtColumns.push(dtc.newColumn("name").withTitle("Name").withOption("searchable", true));
        s.dtColumns.push(dtc.newColumn("title").withTitle("Title").withOption("searchable", true));
        s.dtColumns.push(dtc.newColumn("glyph").withTitle("Glyph").notSortable().withOption("searchable", false)
            .renderWith(function (data, type, full, meta) {
                return "<span class='" + data + "'></span>";
            }));


        s.edit = function (id) {
            s.task.tskEdit = {};
            s.task.editTemp = {};
            s.flow.goTo("task_edit", id);
        };

        s.delete = function (id) {
            fm.show(s.flow.getElementFlowId("taskDeleteModal"));
            s.http.get("services/flow_task_query/getInstance/", id).success(function (task) {
                s.task.tskEdit = task;
            });
        };

        s.save = function () {
            if (s.task.page.name == "task_edit") {
                if (!angular.equals(s.task.tskEdit, s.task.editTemp)) {
                    s.flow.action("put", s.task.tskEdit, s.task.tskEdit.id);
                } else {
                    s.flow.message.info(UI_MESSAGE_NO_CHANGE);
                }
            } else if (s.task.page.name === "task_create") {
                s.flow.action("put", s.task.tskCreate);
            }
        };

        s.$on(s.flow.event.getSuccessEventId(), function (event, data, method) {
                if (method === "put") {
                    if (s.task.page.name == "task_edit") {
                        s.task.tskEdit = {};
                        angular.copy(s.task.tskEdit, s.task.editTemp);
                        s.flow.goToHome();
                    } else if (s.task.page.name === "task_create") {
                        s.task.tskCreate = {};
                        s.flow.goToHome();
                    }
                }
                else if (method === "delete") {
                    if (s.dtInstance) {
                        s.dtInstance.reloadData();
                    }
                }
            }
        );


        s.$on(s.flow.event.getResizeEventId(), function (event, page, size) {
            if (page === "task_settings") {
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
            if ("task_edit" === page) {
                if (!s.task.tskEdit.id || source === "refresh") {
                    s.task.tskEdit = data;
                    angular.copy(s.task.tskEdit, s.task.editTemp);
                }
            } else if ("task_settings" === page) {
                if (s.dtInstance) {
                    s.dtInstance.reloadData();
                }
            }
            s.flow.addControl(save, ["task_edit", "task_create"]);
            s.flow.addControl(deleteCtl, "task_edit");
            s.flow.addControl(create, "task_settings");
        };

        s.deleteConfirm = function () {
            s.flow.action("delete", s.task.tskEdit, s.task.tskEdit.id);
            fm.hide(s.flow.getElementFlowId("taskDeleteModal"));
            if (s.task.page.name !== "task_settings") {
                s.flow.goToHome();
            }
            if (s.dtInstance) {
                s.dtInstance.reloadData();
            }
        };

        s.deleteCancel = function () {
            fm.hide(s.flow.getElementFlowId("taskDeleteModal"));
        };

    }])
    .controller("mdCtrl", ["$scope", "DTOptionsBuilder", "DTColumnBuilder", "flowMessageService", "flowModalService", "$compile", "sessionService", function (s, dto, dtc, ms, fm, c, ss) {

        var create = new CreateControl();
        create.id = "md_create_ctl";
        create.action = function () {
            s.task.mdCreate = {};
            s.flow.goTo("md_create");
        };
        var save = new SaveControl();
        save.id = "md_edit_ctl";
        save.action = function () {
            $("#" + s.flow.getElementFlowId("md_submit")).trigger("click");
        };

        var deleteCtl = new DeleteControl();
        deleteCtl.id = "md_del_ctl";
        deleteCtl.action = function () {
            fm.show(s.flow.getElementFlowId("mdDeleteModal"));
        };

        s.dtOptions = new FlowOptionsGET(dto, s.flow.getHomeUrl(), s, c, ss);
        s.dtColumns = FlowColumns(dtc);

        s.dtColumns.push(dtc.newColumn("moduleName").withTitle("Name").withOption("searchable", true));
        s.dtColumns.push(dtc.newColumn("moduleTitle").withTitle("Title").withOption("searchable", true));
        s.dtColumns.push(dtc.newColumn("task").withTitle("Task URL").withOption("searchable", false));
        s.dtColumns.push(dtc.newColumn("moduleGlyph").withTitle("Glyph").notSortable().withOption("searchable", false)
            .renderWith(function (data) {
                return "<span class='" + data + "'></span>";
            }));


        s.edit = function (id) {
            s.task.mdEdit = undefined;
            s.task.editTemp = {};
            s.flow.goTo("md_edit", id);
        };

        s.delete = function (id) {
            fm.show(s.flow.getElementFlowId("mdDeleteModal"));
            s.http.get("services/flow_module_query/getInstance/", id).success(function (page) {
                s.task.mdEdit = page;
            });
        };

        s.save = function () {
            if (s.task.page.name == "md_edit") {
                if (!angular.equals(s.task.mdEdit, s.task.editTemp)) {
                    s.flow.action("put", s.task.mdEdit, s.task.mdEdit.id);
                } else {
                    s.flow.message.info(UI_MESSAGE_NO_CHANGE);
                }
            } else if (s.task.page.name === "md_create") {
                s.flow.action("put", s.task.mdCreate);
            }
        };

        s.$on(s.flow.event.getSuccessEventId(), function (event, data, method) {
            if (method === "put") {
                if (s.task.page.name == "md_edit") {
                    s.task.mdEdit = {};
                    angular.copy(s.task.mdEdit, s.task.editTemp);
                    s.flow.goToHome();
                } else if (s.task.page.name === "md_create") {
                    s.task.mdCreate = {};
                    s.flow.goToHome();
                }
            } else if (method === "delete") {
                if (s.dtInstance) {
                    s.dtInstance.reloadData();
                }
            }

        });

        s.$on(s.flow.event.getResizeEventId(), function (event, page, size) {
            if (page === "md_settings") {
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
            if ("md_edit" === page) {
                if (!s.task.mdEdit || source === "refresh") {
                    s.task.mdEdit = data;
                    angular.copy(s.task.mdEdit, s.task.editTemp);
                }
            } else if ("md_settings" === page) {
                if (s.dtInstance) {
                    s.dtInstance.reloadData();
                }
            }
            s.flow.addControl(save, ["md_edit", "md_create"]);
            s.flow.addControl(deleteCtl, "md_edit");
            s.flow.addControl(create, "md_settings");
        };

        s.deleteConfirm = function () {
            s.flow.action("delete", s.task.mdEdit, s.task.mdEdit.id);
            fm.hide(s.flow.getElementFlowId("mdDeleteModal"));
            if (s.task.page.name !== "md_settings") {
                s.flow.goToHome();
            }
            if (s.dtInstance) {
                s.dtInstance.reloadData();
            }
        };

        s.deleteCancel = function () {
            fm.hide(s.flow.getElementFlowId("mdDeleteModal"));
        };

    }])
    .controller("moduleGroupCtrl", ["$scope", "DTOptionsBuilder", "DTColumnBuilder", "flowMessageService", "flowModalService", "$compile", "sessionService", function (s, dto, dtc, ms, fm, c, ss) {

        var create = new CreateControl();
        create.id = "moduleGroup_create_ctl";
        create.action = function () {
            s.task.moduleGroupCreate = {};
            s.flow.goTo("moduleGroup_create");
        };

        var save = new SaveControl();
        save.id = "moduleGroup_edit_ctl";
        save.action = function () {
            $("#" + s.flow.getElementFlowId("moduleGroup_submit")).trigger("click");
        };
        var deleteCtl = new DeleteControl();
        deleteCtl.id = "moduleGroup_del_ctl";
        deleteCtl.action = function () {
            fm.show(s.flow.getElementFlowId("moduleGroupDeleteModal"));
        };


        s.dtOptions = new FlowOptionsGET(dto, s.flow.getHomeUrl(), s, c, ss);
        s.dtColumns = FlowColumns(dtc);
        s.dtColumns.push(dtc.newColumn("name").withTitle("Name").withOption("searchable", true));
        s.dtColumns.push(dtc.newColumn("title").withTitle("Title").withOption("searchable", true));
        s.dtColumns.push(dtc.newColumn("iconUri").withTitle("Glyph").withOption("searchable", false));

        s.edit = function (id) {
            s.task.moduleGroupEdit = {};
            s.task.editTemp = {};
            s.flow.goTo("moduleGroup_edit", id);
        };

        s.delete = function (id) {
            fm.show(s.flow.getElementFlowId("moduleGroupDeleteModal"));
            s.http.get("services/flow_task_group_query/getInstance/", id).success(function (page) {
                s.task.moduleGroupEdit = page;
            });
        };

        s.save = function () {
            if (s.task.page.name == "moduleGroup_edit") {
                if (!angular.equals(s.task.moduleGroupEdit, s.task.editTemp)) {
                    s.flow.action("put", s.task.moduleGroupEdit, s.task.moduleGroupEdit.id);
                } else {
                    s.flow.message.info(UI_MESSAGE_NO_CHANGE);
                }
            } else if (s.task.page.name === "moduleGroup_create") {
                s.flow.action("put", s.task.moduleGroupCreate);
            }
        };

        s.$on(s.flow.event.getSuccessEventId(), function (event, data, method) {
            if (method === "put") {
                if (s.task.page.name == "moduleGroup_edit") {
                    s.task.moduleGroupEdit = {};
                    angular.copy(s.task.moduleGroupEdit, s.task.editTemp);
                    s.flow.goToHome();
                } else if (s.task.page.name === "moduleGroup_create") {
                    s.task.moduleGroupCreate = {};
                    s.flow.goToHome();
                }
            } else if (method === "delete") {
                if (s.dtInstance) {
                    s.dtInstance.reloadData();
                }
            }

        });

        s.$on(s.flow.event.getResizeEventId(), function (event, page, size) {
            if (page === "moduleGroup_settings") {
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
            if ("moduleGroup_edit" === page) {
                if (!s.task.moduleGroupEdit.id || source === "refresh") {
                    s.task.moduleGroupEdit = data;
                    angular.copy(s.task.moduleGroupEdit, s.task.editTemp);
                }
            } else if ("moduleGroup_settings" === page) {
                if (s.dtInstance) {
                    s.dtInstance.reloadData();
                }
            }
            s.flow.addControl(save, ["moduleGroup_edit", "moduleGroup_create"]);
            s.flow.addControl(deleteCtl, "moduleGroup_edit");
            s.flow.addControl(create, "moduleGroup_settings");
        };

        s.deleteConfirm = function () {
            s.flow.action("delete", s.task.moduleGroupEdit, s.task.moduleGroupEdit.id);
            fm.hide(s.flow.getElementFlowId("moduleGroupDeleteModal"));
            if (s.task.page.name !== "moduleGroup_settings") {
                s.flow.goToHome();
            }
            if (s.dtInstance) {
                s.dtInstance.reloadData();
            }
        };

        s.deleteCancel = function () {
            fm.hide(s.flow.getElementFlowId("moduleGroupDeleteModal"));
        };

    }]);
;/**
 * Created by Jerico on 11/29/2014.
 */
var directives = angular.module("flowAppDirectives", ["fluid"]);


/* Framework Helper */
directives.directive("addPages", ["flowHttpService", "flowModalService", "$compile", "ngFileUpload", function (f, fm, c) {
    return {
        scope: {task: "=", pageUrl: "@", targetList: "=", id: "@", disabled: "="},
        restrict: "AE",
        replace: true,
        template: "<button ng-disabled='disabled' type='button' ng-click='look()' class='btn btn-info'>Add pages</button>",
        link: function (scope, element) {


            if (!scope.id) {
                scope.id = "pg_pf_ed_" + scope.task.id;
            }

            var parent = $(element[0]).parent().get();

            var modal = $("<div>").attr("id", "{{id}}_pge_slt_mdl").addClass("modal fade fluid-modal").appendTo(parent).get();

            var modalContent = $("<div>").addClass("modal-dialog modal-lg").attr("id", "{{id}}_mdl_cnt").appendTo(modal).get();

            var modalPanel = $("<div>").addClass("panel panel-default").appendTo(modalContent).get();

            var modalPanelHeading = $("<div>").addClass("panel-heading").appendTo(modalPanel).get();

            var spanTitle = $("<span>").addClass("text-info").addClass("col-lg-5 col-md-5 col-sm-3 col-xs-3").html("Select a page").appendTo(modalPanelHeading).get();

            var inputGroup = $("<div>").addClass("col-lg-7 col-md-7 col-sm-9 col-xs-9").addClass("input-group").appendTo(modalPanelHeading).get();

            var inputSearch = $("<input>").addClass("form-control").attr("type", "text").attr("ng-model", "search").appendTo(inputGroup).get();

            var inputSpan = $("<span>").addClass("input-group-addon").appendTo(inputGroup).get();

            $("<i>").addClass("fa fa-search").appendTo(inputSpan);

            var modalPanelBody = $("<div>").addClass("panel-body").attr("style", "overflow:auto;height:200px").appendTo(modalPanel).get();

            var modalPanelFooter = $("<div>").addClass("panel-footer").attr("style", "height:50px").appendTo(modalPanel).get();

            var pullRightFooterDiv = $("<div>").addClass("pull-right").appendTo(modalPanelFooter).get();

            var buttonGroup = $("<div>").addClass("btn-group btn-group-sm").appendTo(pullRightFooterDiv).get();

            var closeButton = $("<button>").addClass("btn btn-info").attr("ng-click", "close()").attr("type", "button").html("close").appendTo(buttonGroup).get();

            var modalTable = $("<table>").addClass("table table-responsive table-hover").appendTo(modalPanelBody).get();

            var mThead = $("<thead>").appendTo(modalTable).get();

            var mTheadRow = $("<tr>").appendTo(mThead).get();

            var mTbody = $("<tbody>").appendTo(modalTable).get();

            var mTr = $("<tr>").attr("ng-repeat", "page in pages | filter:search").attr("ng-click", "addToList(page)").appendTo(mTbody).get();

            var td = $("<td>").html("{{page.name}}").appendTo(mTr).get();

            scope.close = function () {
                fm.hide(scope.id + "_pge_slt_mdl");
            };

            scope.addToList = function (page) {
                var flowPermission = {
                    "flowPageId": page.id,
                    "flowPageName": page.name,
                    "put": true,
                    "get": true,
                    "post": true,
                    "del": true
                };
                var contains = false;
                for (var i = 0; i < scope.targetList.length; i++) {
                    var fp = scope.targetList[i];
                    if (fp.flowPageName === flowPermission.flowPageName) {
                        contains = true;
                        break;
                    }
                }

                if (!contains) {
                    scope.targetList.push(flowPermission);
                    scope.pages.splice(scope.pages.indexOf(page), 1);
                } else {
                    $(modalContent).addClass("shake");
                    $(modalContent).one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", function () {
                        $(modalContent).removeClass("shake");
                    });
                }
            };

            scope.look = function () {
                f.get(scope.pageUrl, scope.task).success(function (pages) {
                    scope.pages = pages;
                    angular.forEach(scope.targetList, function (pp) {
                        angular.forEach(scope.pages, function (p, key) {
                            if (p.id === pp.flowPageId) {
                                scope.pages.splice(key, 1);
                            }
                        });
                    });
                    fm.show(scope.id + "_pge_slt_mdl");
                });
            };

            c(modal)(scope);

        }
    }
}]);
directives.directive("addAllPages", ["flowHttpService", function (f) {

    return {
        scope: {task: "=", pageUrl: "@", targetList: "=", id: "@", disabled: "="},
        restrict: "AE",
        replace: true,
        template: "<button ng-disabled='disabled' type='button' ng-click='addAll()' class='btn btn-info'>Add all pages</button>",
        link: function (scope) {


            scope.addAll = function () {
                f.get(scope.pageUrl, scope.task).success(function (pages) {
                    scope.pages = pages;

                    angular.forEach(scope.pages, function (page) {
                        var flowPermission = {
                            "flowPageId": page.id,
                            "flowPageName": page.name,
                            "put": true,
                            "get": true,
                            "post": true,
                            "del": true
                        };
                        var contains = false;
                        for (var i = 0; i < scope.targetList.length; i++) {
                            var fp = scope.targetList[i];
                            if (fp.flowPageName === flowPermission.flowPageName) {
                                contains = true;
                                break;
                            }
                        }

                        if (!contains) {
                            scope.targetList.push(flowPermission);
                            scope.pages.splice(scope.pages.indexOf(page), 1);
                        }
                    });
                });
            }

        }
    }
}]);
directives.directive("fluidMenu", function ($parse, $compile, $timeout, flowHttpService, flowFrameService, UserFactory) {
    return {
        link: function ($scope, element, attributes) {
            $scope._menu = {status: [], collapse: {}, hover: []};
            $scope.dataMap = [];
            $scope._menu.mouseleave = function () {
                for (var j = 0; j < $scope._menu.hover.length; j++) {
                    $scope._menu.hover[j] = '';
                }
            };
            $scope._menu.mouseover = function (i) {
                for (var j = 0; j < $scope._menu.hover.length; j++) {
                    $scope._menu.hover[j] = '';
                }
                $scope._menu.hover[i] = 'nav-hover';
            };
            $scope._menu.collapse = function (i) {
                $scope._menu.status[i] = !$scope._menu.status[i];

                var current = attributes.$$element.find('a[index=' + i + ']');

                current.parent('li').addClass('active').siblings().removeClass('active').children('ul').each(function () {
                    $scope._menu.status[$(this).attr('index')] = true;
                });

                if (current.hasClass('btn-fullscreen')) {
                    if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
                        if (document.documentElement.requestFullscreen) {
                            document.documentElement.requestFullscreen();
                        } else if (document.documentElement.msRequestFullscreen) {
                            document.documentElement.msRequestFullscreen();
                        } else if (document.documentElement.mozRequestFullScreen) {
                            document.documentElement.mozRequestFullScreen();
                        } else if (document.documentElement.webkitRequestFullscreen) {
                            document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
                        }
                    } else {
                        if (document.exitFullscreen) {
                            document.exitFullscreen();
                        } else if (document.msExitFullscreen) {
                            document.msExitFullscreen();
                        } else if (document.mozCancelFullScreen) {
                            document.mozCancelFullScreen();
                        } else if (document.webkitExitFullscreen) {
                            document.webkitExitFullscreen();
                        }
                    }
                }
            };

            $scope.$watch(function (scope) {
                return UserFactory.isAuthenticated();
            }, function (authenticated) {
                if (authenticated) {
                    var groupLength = 0;

                    var groups = UserFactory.getUser().flowGroups;

                    groupLength = groups.length - 1;

                    angular.forEach(groups, function (group, index) {

                        var groupLi = $("<li>").appendTo(element[0]).get();

                        var groupA = $("<a>").attr("href", "#").appendTo(groupLi).get();

                        $("<i>").addClass(group.iconUri).appendTo(groupA).get();

                        $("<span>").addClass("menu-title").html(group.title).appendTo(groupA).get();

                        $("<span>").addClass("fa arrow").appendTo(groupA).get();
                        if (group.flowModules && group.flowModules.length > 0) {
                            var moduleLength = group.flowModules.length - 1;
                            var subUl = $("<ul>").addClass("nav nav-second-level").appendTo(groupLi).get();
                            angular.forEach(group.flowModules, function (module, index2) {
                                $scope.dataMap.push({name: module.moduleName, data: module});

                                var subLi = $("<li>").appendTo(subUl).get();

                                var subA = $("<a>").attr("href", "#").attr("module", module.moduleName).appendTo(subLi).get();

                                $("<i>").addClass(module.moduleGlyph).appendTo(subA).get();

                                $("<span>").addClass("submenu-title").html(module.moduleTitle).appendTo(subA).get();

                                if (groupLength === index && moduleLength === index2) {
                                    $scope.loaded = true;
                                }
                            });
                        }
                    });

                } else {
                    $scope.loaded = true;
                }
            });


            $scope.openModule = function (moduleName) {

                angular.forEach($scope.dataMap, function (data) {
                    if (moduleName === data.name) {
                        this.task = data.data.task;
                    }
                }, $scope.data);

                if ($scope.data && $scope.data.task) {
                    flowFrameService.addTask($scope.data.task);
                }
            };

            $scope.reload = function () {
                $timeout(function () {
                    if ($scope.loaded) {
                        attributes.$$element.find('li').children('a').each(function (index, value) {
                            var module = $(value).attr("module");
                            $scope._menu.status[index] = true;
                            if (module) {
                                $(this).attr({
                                    'ng-click': '_menu.collapse(' + index + ');openModule(\"' + module + '\")',
                                    'index': index
                                });
                            } else {
                                $(this).attr({'ng-click': '_menu.collapse(' + index + ')', 'index': index});
                            }

                            $('>ul', $(this).parent('li')).attr({
                                'collapse': '_menu.status[' + index + ']',
                                'index': index
                            });
                        });

                        $(">li", attributes.$$element).each(function (index, value) {
                            $scope._menu.hover[index] = '';
                            $(this).attr({
                                'ng-mouseleave': '_menu.mouseleave()',
                                'ng-mouseover': '_menu.mouseover(' + index + ')',
                                'ng-class': '_menu.hover[' + index + ']'
                            });
                        });
                        $compile(element.contents())($scope);

                    } else {
                        $scope.reload();
                    }
                });
            };

            $scope.reload();
        }
    };
});
directives.directive("fluidSubTaskbar", ["flowFrameService", "$timeout", "$compile", function (f, t, c) {
    return {
        restrict: "A",
        link: function (scope, element) {

            var table = $("<table>").appendTo(element[0]).get();

            var tr = $("<tr>").appendTo(table).get();

            scope.loaded = false;


            scope.$watch(f.taskList, function () {
                angular.forEach(f.taskList, function (task, index) {

                    if (index > 9) {

                        var td = $("<td>").appendTo(tr).get();

                        var a = $("<a>").attr("href", "#").appendTo(td).get();

                        $("<i>").addClass("fluid-bar-icon").addClass(task.glyph).appendTo(a);

                        if (index % 3 === 0) {
                            tr = $("<tr>").appendTo(table).get();
                        }

                    }

                    if ((f.taskList.length - 1) === index) {
                        0;
                        scope.loaded = true;
                    }

                });
            });


            scope.reload = function () {
                t(function () {
                    if (scope.loaded) {
                        c(element.contens())(scope);
                    }
                    else {
                        scope.reload();
                    }

                });
            }

            scope.reload();

        }

    }
}]);
directives.directive("fluidReportTable", ["$compile", function (c) {
    return {
        scope: {table: "="},
        restrict: "AE",
        replace: true,
        transclude: true,
        template: "<div><ng-transclude></ng-transclude><table class='table table-condensed'></table></div>",
        link: function (scope, element, attr) {

            scope.table = {};
            scope.showHeaders = [];

            var reportColumns = element.find("report-column");

        }
    }
}]);
directives.directive("fluidReportColumn", ["$compile", function (c) {
    return {
        scope: true,
        link: function (scope, element, attr) {

            if (attr.removable) {
                scope.removable = (attr.removable === "true");
            }

            if (attr.headerTitle) {
                scope.headerTitle = attr.headerTitle;
                scope.field = scope.headerTitle.replace(" ", "");
            }

            if (attr.class) {
                scope.class = attr.class;
            }

            if (scope.removable) {
                var th = $("<th>").addClass(scope.class).attr("name", "removable_th_" + scope.field).attr("ng-init", "table.is_" + scope.field + "=true").get();
                $("<input>").attr("type", "checkbox").attr("ng-model", "table.is_" + scope.field).appendTo(th).get();
                element.append(th);
            }


            var th = $("<th>").addClass(scope.class).attr("name", "th_" + scope.field).html(scope.headerTitle).get();

            element.append(th);


            c(element.contents())(scope);
        },
        restrict: "E",
        replace: true,
        template: "<report-column></report-column>"
    }
}]);
directives.directive("fluidRenderWidth", [function () {
    return {
        restrict: "A",
        scope: {tableId: "@", headerName: "@"},

        link: function (scope, element, attr) {

            scope.$watch(function () {
                var table = $("#" + scope.tableId);
                return table.find("th:contains('" + scope.headerName + "')").width();
            }, function (newValue) {
                var value = newValue + 10;
                element.width(value);
            });
        }
    }
}]);
directives.directive("flowBarTooltip", ["$timeout", "flowFrameService", "flowHttpService", function (t, f, f2) {
    return {
        scope: {task: '=', index: "="},
        restrict: "A",
        link: function (scope, element, attr) {
            scope.tooltipTime = 400;
            if (scope.task === undefined) {
                throw "Task object must be assigned.";
            }

            if (attr.tooltipTime) {
                scope.tooltipTime = attr.tooltipTime;
            }

            if (attr.tooltipHeaderTitle) {
                scope.tooltipHeaderTitle = attr.tooltipHeaderTitle;
            }

            if (attr.tooltipPosition) {
                scope.tooltipPosition = attr.tooltipPosition;
            }

            if (attr.tooltipEvent) {
                scope.tooltipEvent = attr.tooltipEvent;
            }

            if (attr.tooltipMy) {
                scope.my = attr.tooltipMy;
            }

            if (attr.tooltipAt) {
                scope.at = attr.tooltipAt;
            }

            if (!scope.tooltipPosition) {
                scope.tooltipPosition = "{\"my\":\"top center\",\"at\":\"bottom center\"}";
            }

            if (!scope.tooltipEvent) {
                scope.tooltipEvent = "hover";
            }

            if (scope.tooltipHeaderTitle === undefined) {
                scope.tooltipHeaderTitle = scope.task.title;
            }

            scope.position = JSON.parse(scope.tooltipPosition);

            if (scope.my) {
                scope.position.my = scope.my;
            }

            if (scope.at) {
                scope.position.at = scope.at;
            }

            scope.links = [];


            scope.$watch(function (scope) {
                return scope.task.generic || f.fullScreen
            }, function (newValue) {
                if (scope.task.generic === false) {
                    var content = "<ul class='nav nav-pills nav-stacked'>";

                    if (scope.task.pages) {
                        angular.forEach(scope.task.pages, function (page) {
                            if (page.pageLinkEnabled !== undefined && page.pageLinkEnabled === true) {
                                content += "<li page='" + page.name + "'>" +
                                    "<a href='#' class='color-white' >" + page.title + "</a>" +
                                    "</li>"
                            }
                        });
                    }

                    content += "<li><a href='#' class='color-white'>Minimize</a></li>";
                    if (!f.fullScreen) {
                        content += "<li><a href='#' class='color-white'>Fullscreen</a></li>";
                    } else {
                        content += "<li><a href='#' class='color-white'>Fluidscreen</a></li>";
                    }
                    content += "<li><a href='#' class='color-white'>Close</a></li>";

                    content += "</ul>"
                    scope.tooltip = $(element[0]).qtip({
                            content: {
                                title: scope.tooltipHeaderTitle,
                                text: content
                            },
                            position: {
                                at: scope.position.at,
                                my: scope.position.my,
                                adjust: {
                                    method: "none shift"
                                }
                            }, hide: {
                                event: 'click',
                                inactive: scope.tooltipTime
                            },
                            style: "qtip-dark",
                            events: {
                                show: function (evt, api) {
                                    var list = api.elements.tooltip.find("li").get();
                                    angular.forEach(list, function (li, index) {

                                        var liElement = $(li);

                                        if (liElement.text() === "Minimize") {
                                            if (scope.task.active === false) {
                                                liElement.attr("style", "display:none");

                                            } else {
                                                liElement.attr("style", "display:block");
                                            }
                                        } else if (liElement.text() === "Close") {

                                        } else {
                                            var page = liElement.attr("page");

                                            if (scope.task.active === false) {
                                                liElement.attr("style", "display:none");

                                            } else {
                                                liElement.attr("style", "display:block");
                                            }
                                        }
                                        api.elements.tooltip.find("li:eq(" + index + ")")
                                            .click(function (event) {
                                                var current = $(this);
                                                if (current.attr("page")) {
                                                    var page = current.attr("page");
                                                    for (var p = 0; p < scope.task.pages.length; p++) {
                                                        var pg = scope.task.pages[p];
                                                        if (pg.name === page) {
                                                            if (f.fullScreen) {
                                                                scope.task.currentPage = {name: page};
                                                                f.fullScreenTask = scope.task;
                                                            } else {
                                                                scope.task.currentPage = {name: page};
                                                                t(function () {
                                                                    $(".frame-content").scrollTo($("div.box[task]:eq(" + scope.index + ") div.flow-panel"), 200);
                                                                });
                                                            }

                                                            if (!scope.$$phase) {
                                                                scope.$apply();
                                                            }


                                                        }
                                                    }
                                                } else if (current.text() === "Minimize") {
                                                    scope.task.hide();
                                                } else if (current.text() === "Close") {
                                                    scope.task.close();
                                                } else if (current.text() === "Fullscreen") {
                                                    scope.task.fullScreen();

                                                } else if (current.text() === "Fluidscreen") {
                                                    scope.task.fluidScreen();
                                                }
                                                api.toggle(false);
                                            }
                                        );
                                    });
                                }
                            }
                        }
                    );
                }
            });


        }

    }
}]);
directives.directive('flowProfileVisible', ["flowHttpService", function (f) {
    return {
        restrict: 'A',
        scope: {task: "=", profiles: "="},
        link: function (scope, iElement, iAttrs) {
            f.post("services/flow_permission/has_profile", scope.profiles, scope.task).
                success(function (data) {
                    if (data) {
                        iElement.removeClass("hidden");
                    } else {
                        iElement.addClass("hidden");
                    }
                });
        }
    };
}]);
directives.directive('fallbackSrc', function () {
    var fallbackSrc = {
        link: function postLink(scope, iElement, iAttrs) {
            iElement.bind('error', function () {
                angular.element(this).attr("src", iAttrs.fallbackSrc);
            });
        }
    };
    return fallbackSrc;
});
/*UI Helper*/

directives.directive("offset", [function () {

    return {
        restrict: "A",
        link: function (scope, element, attr) {
            if (attr.offset) {
                scope.offset = attr.offset;
            }

            if (scope.offset) {
                element.addClass("col-lg-offset-" + scope.offset)
                    .addClass("col-md-offset-" + scope.offset)
                    .addClass("col-sm-offset-" + scope.offset)
                    .addClass("col-xs-offset-" + scope.offset)
            }

        }
    }
}]);
directives.directive("button", [function () {
    return {
        restrict: 'A',
        link: function (scope, iElement, iAttrs) {

            iElement.addClass("btn");
            if (iAttrs.info) {
                iElement.attr("type", iAttrs.info);
                iElement.addClass("btn-info");
            } else if (iAttrs.warning) {
                iElement.attr("type", iAttrs.warning);
                iElement.addClass("btn-warning");
            } else if (iAttrs.danger) {
                iElement.attr("type", iAttrs.danger);
                iElement.addClass("btn-danger");
            } else if (iAttrs.primary) {
                iElement.attr("type", iAttrs.primary);
                iElement.addClass("btn-primary");
            } else {
                iElement.attr("type", "button");
                iElement.addClass("btn-default");
            }


        }
    };
}]);


/* icons */

directives.directive("fluidIconSave", function () {
    return {
        restrict: "A",
        link: function (scope, element) {
            element.addClass("fa fa-save");
        }
    }
});

directives.directive("fluidIconAttach", function () {
    return {
        restrict: "A",
        link: function (scope, element) {
            element.addClass("fa fa-paperclip");
        }
    }
});

directives.directive("fluidIconEdit", function () {
    return {
        restrict: "A",
        link: function (scope, element) {
            element.addClass("fa fa-edit");
        }
    }
});

directives.directive("fluidIconNew", function () {
    return {
        restrict: "A",
        link: function (scope, element) {
            element.addClass("fa fa-plus");
        }
    }
});

directives.directive("fluidIconSearch", function () {
    return {
        restrict: "A",
        link: function (scope, element) {
            element.addClass("fa fa-search");
        }
    }
});

directives.directive("fluidIconTrash", function () {
    return {
        restrict: "A",
        link: function (scope, element) {
            element.addClass("fa fa-trash-o");
        }
    }
});

directives.directive("fluidIconDownload", function () {
    return {
        restrict: "A",
        link: function (scope, element) {
            element.addClass("fa fa-download");
        }
    }
});

directives.directive("fluidIconClose", function () {
    return {
        restrict: "A",
        link: function (scope, element) {
            element.addClass("fa fa-close");
        }
    }
});


directives.directive("fluidIconPrint", function () {
    return {
        restrict: "A",
        link: function (scope, element) {
            element.addClass("fa fa-print");
        }
    }
});

directives.directive("fluidIconClear", function () {
    return {
        restrict: "A",
        link: function (scope, element) {
            element.addClass("fa fa-eraser");
        }
    }
});

directives.directive("fluidIconNext", function () {
    return {
        restrict: "A",
        link: function (scope, element) {
            element.addClass("fa fa-step-forward");
        }
    }
});

directives.directive("fluidIconBack", function () {
    return {
        restrict: "A",
        link: function (scope, element) {
            element.addClass("fa fa-step-backward");
        }
    }
});

directives.directive("fluidIconNext", function () {
    return {
        restrict: "A",
        link: function (scope, element) {
            element.addClass("fa fa-forward");
        }
    }
})

directives.directive("fluidIconCheck", function () {
    return {
        restrict: "A",
        link: function (scope, element) {
            element.addClass("fa fa-check text-success");
        }
    }
})


directives.directive("fluidIconRefresh", function () {
    return {
        restrict: "A",
        link: function (scope, element, attr) {
            element.addClass("fa fa-refresh");

            scope.$watch(function () {
                return attr.loading;
            }, function (loading) {
                if (loading) {
                    if (loading === 'true') {
                        element.addClass("fa-spin");
                    } else {
                        element.removeClass("fa-spin");
                    }
                }
            })

        }
    }
});

directives.directive("fluidIconSpinner", function () {
    return {
        restrict: "A",
        link: function (scope, element, attr) {
            element.addClass("fa fa-spinner");

            scope.$watch(function () {
                return attr.loading;
            }, function (loading) {
                if (loading) {
                    if (loading === 'true') {
                        element.addClass("fa-spin");
                    } else {
                        element.removeClass("fa-spin");
                    }
                }
            })

        }
    }
});


directives.directive("fluidIconTag", function () {
    return {
        restrict: "A",
        link: function (scope, element) {
            element.addClass("fa fa-tag");
        }
    }
})


directives.directive("bgWeek1", function () {
    return {
        restrict: "A",
        link: function (scope, element, attr) {
            var bgSpan = element.find("div[bg-div]");
            bgSpan.css("background", "rgba(109,182,255,0.5)");
            bgSpan.height(25);
            bgSpan.width(25);
            bgSpan.css("float", "left");
            element.css("float", "right");
            element.width(70);
            element.css("font-size", 9);
            element.css("padding-top", -7);
        },
        template: "<div><div bg-div></div><span style='text-align:center'>Week 1</span></div>"
    }
});

directives.directive("bgWeek2", function () {
    return {
        restrict: "A",
        link: function (scope, element, attr) {
            var bgSpan = element.find("div[bg-div]");
            bgSpan.css("background", "rgba(109,219,73,0.5)");
            bgSpan.height(25);
            bgSpan.width(25);
            bgSpan.css("float", "left");
            element.css("float", "right");
            element.width(70);
            element.css("font-size", 9);
            element.css("padding-top", -7);
        },
        template: "<div><div bg-div></div><span style='text-align:center'>Week 2</span></div>"
    }
});

directives.directive("bgWeek3", function () {
    return {
        restrict: "A",
        link: function (scope, element, attr) {
            var bgSpan = element.find("div[bg-div]");
            bgSpan.css("background", "rgba(59,89,152,0.5)");
            bgSpan.height(25);
            bgSpan.width(25);
            bgSpan.css("float", "left");
            element.css("float", "right");
            element.width(70);
            element.css("font-size", 9);
            element.css("padding-top", -7);
        },
        template: "<div><div bg-div></div><span style='text-align:center'>Week 3</span></div>"
    }
});
directives.directive("bgWeek4", function () {
    return {
        restrict: "A",
        link: function (scope, element, attr) {
            var bgSpan = element.find("div[bg-div]");
            bgSpan.css("background", "rgba(99,85,74,0.5)");
            bgSpan.height(25);
            bgSpan.width(25);
            bgSpan.css("float", "left");
            element.css("float", "right");
            element.width(70);
            element.css("font-size", 9);
            element.css("padding-top", -7);
        },
        template: "<div><div bg-div></div><span style='text-align:center'>Week 4</span></div>"
    }
});

directives.directive("bgWeek5", function () {
    return {
        restrict: "A",
        link: function (scope, element, attr) {
            var bgSpan = element.find("div[bg-div]");
            bgSpan.css("background", "rgba(255,167,0,0.5)");
            bgSpan.height(25);
            bgSpan.width(25);
            bgSpan.css("float", "left");
            element.css("float", "right");
            element.width(70);
            element.css("font-size", 9);
            element.css("padding-top", -7);
        },
        template: "<div><div bg-div></div><span style='text-align:center'>Week 5</span></div>"
    }
});


directives.directive("barChart", function () {
    return {
        restrict: "A",

        link: function (scope, element, attr) {


        }
    }
})

directives.directive("fluidPrintReport", ["$compile", function (c) {
    return {
        restrict: "A",
        scope: {printData: "="},
        link: function (scope, element, attr) {
            element.unbind("click");
            element.bind("click", function (e) {

                if (scope.printData) {
                    var $printView = $("<div>");

                    angular.forEach(scope.printData.regions, function ($region, $index) {
                        var $printPanel = $("<div>");

                        $printPanel.addClass("panel panel-primary");

                        var $regionHeader = $("<div>");

                        $regionHeader.addClass("panel-heading").addClass("text-center");

                        $regionHeader.html($region.region);

                        $printPanel.append($regionHeader);


                        var $panelBody = $("<div>");
                        $panelBody.addClass("panel-body");


                        var $agentTable = $("<table>");
                        $agentTable.addClass("table table-bordered table-condensed");
                        $agentTable.append($("<colgroup>")
                            .append($("<col>").attr("span", 4))
                            .append($("<col>").attr("span", 12).addClass("months-header"))
                            .append($("<col>").attr("span", 11).addClass("activity-header")));
                        if (scope.printData.labels) {

                            var $header = $("<thead>");
                            $header.append($("<th>").css("font-size", "9px").html("Top"));
                            $header.append($("<th>").css("font-size", "9px").html("Accounts"));

                            angular.forEach(scope.printData.labels, function ($label, $index) {
                                var $th = $("<th>");
                                $th.css("font-size", "9px");
                                $th.html($label);
                                $header.append($th);
                            });

                            $agentTable.append($header);
                        }

                        angular.forEach($region.agents, function ($agent, $indexA) {
                            var $agentTableBody = $("<tbody>");
                            $agentTableBody.append($("<tr>").append($("<td>").attr("colspan", "27")
                                .addClass("bg-warning").html($agent.materialsAdvisor)));


                            angular.forEach($agent.customers, function ($customer, $indexC) {

                                var $ctr = $("<tr>").css("font-size", "10px");

                                $ctr.append($("<td>").addClass("text-center").html($customer.top ? $customer.top : "Untagged"))
                                    .append($("<td>").addClass("text-center").html($customer.label));

                                $agentTableBody.append($ctr);

                                angular.forEach($customer.data, function ($data, $indexD) {
                                    $ctr.append($("<td>").addClass("text-center").html($data));
                                });

                            });

                            $agentTable.append($agentTableBody);
                        });

                        $panelBody.append($agentTable);

                        $printPanel.append($panelBody);

                        // console.info("print-report", $printPanel.html());

                        $printView.append($printPanel);

                    });


                    $printView.print({
                        globalStyles: true,
                        mediaPrint: false,
                        stylesheet: null,
                        noPrintSelector: ".no-print",
                        iframe: true,
                        append: null,
                        prepend: null,
                        manuallyCopyFormValues: true,
                        deferred: $.Deferred()
                    });
                }

            });

        }

    }
}])












;angular.module("fNotify", ["fluid", "truncate"])
    .directive("fnBar", ["fnService", "$timeout", "flowHttpService", "flowFrameService", function (fs, t, f, frs) {
        return {

            restrict: "AE",

            replace: true,

            templateUrl: "templates/fluid/fluidNotify.html",

            link: function (scope) {
                scope.fs = fs;

                scope.openNotificationCenter = function () {

                    var url = "services/flow_task_service/getTask?name=notification&active=true&size=50&showToolBar=false";

                    frs.addTask(url, undefined, false);
                };

                scope.open = function (alert) {
                    f.putGlobal("session/notification/notify", alert);

                    var url = "services/flow_task_service/getTask?name=notification&active=true&size=50&showToolBar=false&page=notification_view&page-path=" + alert.id;

                    frs.addTask(url, undefined, false);
                };

                scope.getMessageTypeGlyph = function (alert) {
                    if (alert.messageType) {
                        if (alert.messageType === "danger") {
                            return "fa fa-exclamation";
                        } else if (alert.messageType === "info") {
                            return "fa fa-info"
                        } else if (alert.messageType === "warning") {
                            return "fa fa-warning"
                        } else if (alert.messageType === "success") {
                            return "fa fa-check"
                        }
                    }

                };

                scope.getLabelScheme = function (alert) {
                    if (alert.messageType === "danger") {
                        return "label label-danger";
                    } else if (alert.messageType === "info") {
                        return "label label-info"
                    } else if (alert.messageType === "warning") {
                        return "label label-warning"
                    } else if (alert.messageType === "success") {
                        return "label label-success"
                    }
                };


                f.getGlobal(scope.fs.url, false).success(function (alerts) {
                    scope.fs.alerts = alerts;
                });

                f.getGlobal(scope.fs.topUrl, false).success(function (top) {
                    scope.fs.top = top;
                });


                scope.notificationPoll = function () {

                    f.getGlobal(scope.fs.url, false).success(function (alerts) {
                        scope.fs.alerts = alerts;
                        t(scope.notificationPoll, 10000);
                    });
                };


                scope.topChecks = function () {
                    f.getGlobal(scope.fs.topUrl, false).success(function (top) {
                        scope.fs.top = top;
                        t(scope.topChecks, 10000);
                    });
                };
/*
                scope.topChecks();
                scope.notificationPoll();*/

            }

        }

    }])
    .service("fnService", ["flowFrameService", function (f) {

        this.alerts = [];
        this.top = [];

        this.limit = 5;

        this.exceed = function () {
            return this.top.length > this.limit;
        };

        this.enabled = true;

        this.interval = function (alert) {
            var today = new Date(alert.startDt);
            return jQuery.timeago(today);
        };

        this.openPage = function (alert) {
            var url = "services/flow_task_service/getTask?group-default=true&active=true&name=" + alert.task;

            if (alert.page) {
                url = url + "&page=" + alert.page;
                if (alert.pageParam) {
                    url = url + "&page-path=" + alert.pageParam;
                }
            }

            f.addTask(url, undefined, false);
        };

        return this;

    }]);;/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var HOST = "http://war.rexpublishing.com.ph:8080/rex-services/";

angular.module("flowFactories", [])
    .constant("HOST", HOST)
    .constant("VIEWER", "vendors/ViewerJS/#")
    .constant("REX_VERSION", "1.3")
    .constant("FLUID_VERSION", "1.2c");

function withHost(url) {
    if (url && url.charAt(0) === '/') {
        url = url.substring(1, url.length - 1);
    }
    0;
    return HOST + url;
}

/*add http://192.168.1.2:9080/rex-war/ when accessing via remote*/

;/**Flow Components v0.0.1
 * Created by Jerico de Guzman
 * October 2014**/
var flowComponents = angular.module("fluid", ["ngFileUpload", "oc.lazyLoad", "LocalStorageModule"]);
var EVENT_PAGE_SUCCESS = "$onPageSuccess", EVENT_PAGE_ERROR = "$onPageFailed";
flowComponents.config(["$httpProvider", "localStorageServiceProvider", function (h, ls) {
    ls.setPrefix("fluid")
        .setStorageType("sessionStorage")
        .setNotify(true, true);
    h.defaults.headers.common = {};
    h.defaults.headers.post = {};
    h.defaults.headers.put = {};
    h.defaults.headers.patch = {};
    h.interceptors.push("flowInjector");

}]);
flowComponents.run(["$templateCache", function (tc) {
}]);
flowComponents
    .directive("flowPanel", ["flowFrameService", "flowHttpService", "$templateCache", "$compile", "flowMessageService", "$rootScope", "$q", "$timeout", "$ocLazyLoad", "userProfile", "sessionService",
        function (f, f2, tc, c, ms, rs, q, t, oc, up, ss) {
            return {
                scope: {task: '='},
                restrict: "E",
                template: tc.get("templates/fluid/fluidPanel.html"),
                replace: true,
                link: {
                    pre: function (scope, element) {
                        /* Initialize variables*/
                        scope.pathRegexPattern = /{[\w|\d]*}/;
                        scope.generateUrl = function (url, param) {
                            if (isJson(param)) {
                                param = JSON.parse(param);
                            }
                            for (var key in param) {
                                if (param.hasOwnProperty(key)) {
                                    var reg = new RegExp("{" + key + "}", "g");
                                    url = url.replace(reg, param[key]);
                                }
                            }
                            return url;
                        }
                        scope.flowFrameService = f;

                        0;
                        0;
                        scope.userTask = {};
                        scope.userTask.closed = false;
                        scope.flow = {};
                        scope.task.toolbars = [
                            {
                                "id": 'home',
                                "glyph": "fa fa-home",
                                "label": "home",
                                "disabled": false,
                                "uiType": "info",
                                "action": function () {
                                    scope.flow.goToHome();
                                }
                            },
                            {
                                "id": 'back',
                                "glyph": "fa fa-arrow-left",
                                "label": "back",
                                "disabled": true,
                                "uiType": "info",
                                "action": function () {
                                    if (scope.task.navPages.length > 0 && scope.task.navPages.length > scope.currentPageIndex) {
                                        var i = --scope.currentPageIndex;
                                        var count = scope.task.navPages.length - (i + 1);
                                        var page = scope.task.navPages[i];
                                        scope.task.navPages.splice((i + 1), count);
                                        scope.flow.navTo(page.name);
                                    } else {
                                        this.disabled = true;
                                    }
                                }
                            },
                            {
                                "id": 'forward',
                                "glyph": "fa fa-arrow-right",
                                "label": "forward",
                                "disabled": true,
                                "uiType": "info",
                                "action": function () {
                                    if (scope.task.navPages.length - 1 > scope.currentPageIndex) {
                                        var page = scope.task.navPages[++scope.currentPageIndex];
                                        scope.flow.navTo(page.name);
                                    } else {
                                        this.disabled = true;
                                    }
                                }
                            }
                        ];


                        /* Page Event */
                        scope.flow.event = {};

                        scope.flow.message = {};

                        scope.flow.message.duration = 3000;
                        scope.http = {};
                        scope.currentPageIndex = 0;
                        /*   scope.flow.pageCallBack = function (page, data) {
                         console.info("generic callBack", page);
                         };*/
                        scope.flow.onPageChanging = function (page, param) {
                            return true;
                        }
                        scope.flow.onRefreshed = function () {
                        };
                        scope.flow.onOpenPinned = function (page, param) {

                        };

                        scope.flow.navToTask = function (task) {

                            var $index = {index: 0};

                            angular.forEach(f.taskList, function (tsk, index) {
                                if (tsk.id === task.id) {
                                    this.index = index;
                                }
                            }, $index);

                            t(function () {
                                $(".frame-content").scrollTo($("div.box[task]:eq(" + $index.index + ") div"), 200);
                            });
                        }
                        scope.flow.openTaskBaseUrl = "services/flow_task_service/getTask?";

                        scope.flow.openTask = function (name, page, param, newTask, origin, size) {

                            var url = scope.flow.openTaskBaseUrl;

                            if (size) {
                                url += "size=" + size + "&"
                            } else {
                                url += "size=100&"
                            }

                            url += "active=true&name=" + name;
                            if (page) {

                                url += "&page=" + page;
                            }
                            if (param) {
                                url += "&page-path=" + param;
                            }

                            if (newTask) {
                                url += "&newTask=" + newTask;
                            }
                            0;

                            f.addTask(url, origin ? origin : scope.task, true);
                        }
                        var parent = element.parent();
                        /***********/


                        /* Getters for IDs */

                        scope.flow.getHomeUrl = function () {
                            return f2.host + scope.homeUrl;
                        };

                        scope.flow.getElementFlowId = function (id) {
                            return id + "_" + scope.task.id;
                        };

                        scope.flow.getEventId = function (id) {
                            return id + "_fp_" + scope.task.id;
                        };

                        scope.flow.event.getResizeEventId = function () {
                            return scope.flow.getEventId("rsz_evt_id_");
                        };

                        scope.flow.event.getPageCallBackEventId = function () {
                            return "task_flow_page_call_back_event_id_" + scope.task.id;
                        };

                        scope.flow.event.getOnTaskLoadedEventId = function () {
                            return scope.flow.getEventId("on_ld_tsk_evt_id_");
                        };

                        scope.flow.event.getGoToEventId = function () {
                            return goToEventID + scope.task.id;
                        };

                        scope.flow.event.getRefreshId = function () {
                            return scope.flow.getEventId("tsk_rfh_id_");
                        };

                        scope.flow.event.getSuccessEventId = function () {
                            return scope.flow.getEventId("suc_evt_id_");
                        };

                        scope.flow.event.getErrorEventId = function () {
                            return scope.flow.getEventId("err_evt_id_");
                        };

                        /********************/


                        /* Integrated Alerts */
                        var messageId = scope.flow.getElementFlowId("pnl_msg");

                        scope.flow.message.info = function (msg) {
                            ms.info(messageId, msg, scope.flow.message.duration).open();
                        };

                        scope.flow.message.warning = function (msg) {
                            ms.warning(messageId, msg, scope.flow.message.duration).open();
                        };

                        scope.flow.message.danger = function (msg) {
                            ms.danger(messageId, msg, scope.flow.message.duration).open();
                        };

                        scope.flow.message.success = function (msg) {
                            ms.success(messageId, msg, scope.flow.message.duration).open();
                        };

                        /*********************/


                        /* Controls */
                        scope.flow.controls = undefined; //register controls


                        /* HTTP API */
                        scope.http.get = function (url, param) {
                            if (param) {
                                if (url.search(scope.pathRegexPattern) > 0) {
                                    url = scope.generateUrl(url, param);
                                } else {
                                    url = url + param;
                                }

                            }
                            return f2.get(url, scope.task);
                        };

                        scope.http.delete = function (url, param) {
                            if (param) {
                                if (url.search(scope.pathRegexPattern) > 0) {
                                    url = scope.generateUrl(url, param);
                                } else {
                                    url = url + param;
                                }
                            }
                            return f2.delete(url, scope.task);
                        };

                        scope.http.post = function (url, data, param) {
                            if (param) {
                                if (url.search(scope.pathRegexPattern) > 0) {
                                    url = scope.generateUrl(url, param);
                                } else {
                                    url = url + param;
                                }
                            }
                            return f2.post(url, data, scope.task);
                        };

                        scope.http.put = function (url, data, param) {
                            if (param) {
                                if (url.search(scope.pathRegexPattern) > 0) {
                                    url = scope.generateUrl(url, param);
                                } else {
                                    url = url + param;
                                }
                            }
                            return f2.put(url, data, scope.task);
                        };

                        /*********************/

                        /* Action */

                        scope.loadProperties = function () {
                            if (scope.flow.controls) {
                                angular.forEach(scope.flow.controls, function (control) {
                                    if (control.pages) {
                                        scope.flow.addControl(control, control.pages);
                                    }
                                });
                            }
                        };
                        scope.loadGet = function () {
                            //adds control for page
                            if (!rs.$$phase) {
                                scope.$apply();
                            }

                            if (scope.task.prevPage) {
                                if (scope.task.prevPage.destroy) {
                                    scope.task.prevPage.destroy();
                                }
                            }


                            0;
                            return q(function (resolve, reject) {
                                if ((scope.task.page !== undefined && scope.task.page !== null) && (scope.task.page.autoGet !== null && scope.task.page.autoGet === true)) {
                                    scope.task.currentPage = scope.task.page.name;
                                    var url = scope.homeUrl;
                                    if (scope.task.page.getParam) {
                                        if (scope.homeUrl.search(scope.pathRegexPattern) > 0) {
                                            url = scope.generateUrl(scope.homeUrl, scope.task.page.getParam);
                                        } else {
                                            url = scope.homeUrl + scope.task.page.getParam;
                                        }
                                    }
                                    f2.get(url, scope.task)
                                        .success(function (data) {
                                            0;
                                            resolve({page: scope.task.page.name, value: data});
                                        });
                                } else if ((scope.task.page !== undefined && scope.task.page !== null) && (scope.task.page.autoGet === null || scope.task.page.autoGet === false)) {
                                    scope.task.currentPage = scope.task.page.name;
                                    0;
                                    resolve({page: scope.task.page.name});
                                }
                            }).then(function (data) {
                                scope.task.pageLoaded = true;
                                var pagePanel = element.find(".flow-panel-page");
                                0;
                                0;
                                pagePanel.html("<fluid-include url='{{task.page.home}}' name='{{flow.getElementFlowId(task.page.name)}}' taskid='{{task.id}}'></fluid-include>");
                                c(pagePanel.contents())(scope);
                                scope.onLoad = function () {
                                    if (scope.task.pinned) {
                                        scope.task.loaded = true;
                                        scope.flow.onOpenPinned(scope.task.page, scope.task.pageParam);
                                    } else {

                                        if (!scope.task.page.load && scope.flow.pageCallBack) {
                                            scope.flow.pageCallBack(data.page, data.value);
                                            if (!rs.$$phase) {
                                                scope.$apply();
                                            }
                                            scope.task.loaded = true;
                                        } else {
                                            if (scope.task.page.load) {
                                                scope.task.page.load(data.value);
                                            }
                                            if (!rs.$$phase) {
                                                scope.$apply();
                                            }

                                            scope.task.loaded = true;
                                        }

                                    }

                                    scope.loadProperties();
                                    0;
                                };
                            }, function (response) {
                                scope.task.pageLoaded = true;
                                scope.task.loaded = true;
                                var pagePanel = element.find(".flow-panel-page");
                                pagePanel.html("<fluid-include url='{{task.page.home}}' name='{{flow.getElementFlowId(task.page.name)}}' taskid='{{task.id}}'></fluid-include>");
                                c(pagePanel.contents())(scope);
                            });
                        };


                        scope.$on(EVENT_PAGE_SUCCESS, function (event, name, taskId) {
                            var current = scope.flow.getElementFlowId(scope.task.page.name);
                            0;
                            0;
                            0;
                            if (taskId === scope.task.id && !scope.task.loaded) {
                                if (scope.task.preLoaded === undefined || scope.task.preLoaded === false) {
                                    scope.task.preLoad();
                                    scope.task.preLoaded = true;
                                }
                                if (scope.task.preLoaded) {
                                    scope.task.load();
                                    scope.task.loaded = true;
                                }
                                scope.task.postLoad();
                            }
                            ;

                            if (name === current) {
                                if (scope.onLoad) {
                                    scope.onLoad();
                                } else {
                                    scope.loadProperties();
                                }
                            }
                        });

                        scope.flow.addControl = function (control, pageName) {
                            var exists = false;

                            angular.forEach(scope.task.toolbars, function (ctl) {
                                if (control.id === ctl.id) {
                                    exists = true;
                                }
                            });

                            if (Array.isArray(pageName)) {

                                var index = pageName.indexOf(scope.task.page.name);
                                if (index > -1) {
                                    if (!exists) {
                                        scope.task.toolbars.push(control);
                                    }
                                } else {
                                    if (exists) {
                                        for (var t = scope.task.toolbars.length - 1; t > 0; t--) {
                                            var toolbar = scope.task.toolbars[t];
                                            if (toolbar.id === control.id) {
                                                scope.task.toolbars.splice(t, 1);
                                            }
                                        }
                                    }

                                }
                            }

                            else if (scope.task.page.name === pageName) {
                                if (!exists) {
                                    scope.task.toolbars.push(control);
                                }
                            } else if (exists) {
                                for (var t = scope.task.toolbars.length - 1; t > 0; t--) {
                                    var toolbar = scope.task.toolbars[t];
                                    if (toolbar.id === control.id) {
                                        scope.task.toolbars.splice(t, 1);
                                        break;
                                    }
                                }

                            }
                        };
                        scope.navToPage = function (name) {
                            return q(function (resolve) {
                                angular.forEach(scope.task.navPages, function (page) {
                                    if (name === page.name) {
                                        scope.task.prevPage = scope.task.page;
                                        scope.task.page = page;

                                        var uri = page.get;

                                        if (scope.task.page.param !== undefined && scope.task.page.param != null) {
                                            if (uri.search(scope.pathRegexPattern) > 0) {
                                                uri = scope.generateUrl(uri, scope.task.page.param);
                                            } else {
                                                uri = uri + scope.task.page.param;
                                            }
                                        }

                                        scope.homeUrl = uri;

                                        if (scope.task.pinned === true) {
                                            scope.userTask.page = scope.task.page.name;
                                            scope.userTask.param = scope.task.page.param;

                                            if (scope.task.generic === false) {
                                                if (scope.task.id.indexOf("gen") === -1) {
                                                    scope.userTask.flowTaskId = scope.task.id.split("_")[0];
                                                    scope.userTask.flowId = scope.task.flowId;
                                                    scope.userTask.pinned = scope.task.pinned;
                                                    f2.post("services/flow_user_task_crud/save_task_state?field=pin", scope.userTask, scope.task);
                                                }
                                            }
                                        }

                                        for (var i = 0; i < scope.task.navPages.length; i++) {
                                            if (scope.task.navPages[i].name === name) {
                                                scope.currentPageIndex = i;
                                                break;
                                            }
                                        }

                                        for (var i = 0; i < scope.task.toolbars.length; i++) {
                                            if (scope.task.toolbars[i].id === 'back') {
                                                scope.task.toolbars[i].disabled = !(scope.currentPageIndex > 0);
                                            }
                                            if (scope.task.toolbars[i].id === 'forward') {
                                                scope.task.toolbars[i].disabled = !(scope.currentPageIndex < scope.task.navPages.length - 1);
                                            }
                                        }
                                        resolve();
                                    }
                                });
                            });
                        };
                        scope.flow.navTo = function (name) {
                            if (scope.flow.onPageChanging(name)) {
                                return scope.navToPage(name).then(scope.loadGet());
                            }
                        };
                        scope.getToPage = function (name, param) {
                            0;
                            return q(function (resolve, reject) {
                                angular.forEach(scope.task.pages, function (page) {
                                        if (name === page.name) {
                                            scope.task.prevPage = {};
                                            angular.copy(scope.task.page, scope.task.prevPage);
                                            scope.task.page = page;
                                            var uri = page.get;

                                            if (param !== undefined && param !== "null") {

                                                page.param = param;
                                                if (uri.search(scope.pathRegexPattern) > 0) {
                                                    uri = scope.generateUrl(uri, param);
                                                } else {
                                                    uri = uri + param;
                                                }
                                            } else if (page.param) {
                                                if (uri.search(scope.pathRegexPattern) > 0) {
                                                    uri = scope.generateUrl(uri, param);
                                                } else {
                                                    uri = uri + param;
                                                }
                                            }


                                            scope.homeUrl = uri;

                                            if (scope.task.pinned === true) {
                                                scope.userTask.page = scope.task.page.name;
                                                scope.userTask.param = scope.task.page.param;

                                                if (scope.task.generic === false) {
                                                    if (scope.task.id.indexOf("gen") === -1) {
                                                        scope.userTask.flowTaskId = scope.task.id.split("_")[0];
                                                        scope.userTask.flowId = scope.task.flowId;
                                                        scope.userTask.pinned = scope.task.pinned;
                                                        f2.post("services/flow_user_task_crud/save_task_state?field=pin", scope.userTask, scope.task);
                                                    }
                                                }
                                            }


                                            var contains = false;

                                            for (var i = 0; i < scope.task.navPages.length; i++) {
                                                if (scope.task.navPages[i].name === name) {
                                                    contains = true;
                                                    scope.currentPageIndex = i;
                                                    break;
                                                }
                                            }

                                            if (contains === false) {
                                                scope.task.navPages.push(page);
                                                scope.currentPageIndex = scope.task.navPages.length - 1;
                                            }

                                            for (var i = 0; i < scope.task.toolbars.length; i++) {
                                                if (scope.task.toolbars[i].id === 'back') {
                                                    scope.task.toolbars[i].disabled = !(scope.currentPageIndex > 0);
                                                }
                                                if (scope.task.toolbars[i].id === 'forward') {
                                                    scope.task.toolbars[i].disabled = !(scope.currentPageIndex < scope.task.navPages.length - 1);
                                                }
                                            }
                                            resolve();
                                        }
                                    }
                                )
                            });
                        };
                        scope.flow.goTo = function (name, param) {
                            0;
                            if (scope.flow.onPageChanging(name, param)) {
                                return scope.getToPage(name, param).then(scope.loadGet());
                            }
                        };

                        scope.$watch(function (scope) {
                                return scope.task.currentPage;
                            },
                            function (newValue) {
                                if (newValue) {
                                    scope.flow.goTo(newValue.name, newValue.param);
                                }
                            });

                        scope.flow.action = function (method, data, param) {
                            if (method) {
                                var uri = "";
                                if (method.toLowerCase() === "put") {
                                    uri = scope.task.page.put;
                                    if (param !== undefined && param !== "null") {
                                        if (uri.search(scope.pathRegexPattern) > 0) {
                                            uri = scope.generateUrl(uri, param);
                                        } else {
                                            uri = uri + param;
                                        }
                                    }
                                    f2.put(uri, data, scope.task)
                                        .success(function (rv) {
                                            rs.$broadcast(scope.flow.event.getSuccessEventId(), rv, method);
                                        })
                                        .error(function (data) {
                                            if (data) {
                                                scope.flow.message.danger(data.msg);
                                            } else {
                                                scope.flow.message.danger("Error creating request to " + uri);
                                            }

                                            rs.$broadcast(scope.flow.event.getErrorEventId(), data, method);
                                        });

                                } else if (method.toLowerCase() === "get") {
                                    uri = scope.task.page.get;
                                    if (param !== undefined && param !== "null") {
                                        if (uri.search(scope.pathRegexPattern) > 0) {
                                            uri = scope.generateUrl(uri, param);
                                        } else {
                                            uri = uri + param;
                                        }
                                    }
                                    f2.get(uri, scope.task)
                                        .success(function (rv) {
                                            if (rv) {
                                                if (rv.msg) {
                                                    scope.flow.message.success(rv.msg);
                                                }
                                            }
                                            rs.$broadcast(scope.flow.event.getSuccessEventId(), rv, method);
                                        })
                                        .error(function (data) {
                                            if (data) {
                                                scope.flow.message.danger(data.msg);
                                            }
                                            rs.$broadcast(scope.flow.event.getErrorEventId(), data, method);
                                        });

                                } else if (method.toLowerCase() === "delete") {
                                    uri = scope.task.page.delURL;
                                    if (param !== undefined && param !== "null") {
                                        if (uri.search(scope.pathRegexPattern) > 0) {
                                            uri = scope.generateUrl(uri, param);
                                        } else {
                                            uri = uri + param;
                                        }
                                    }
                                    f2.delete(uri, scope.task)
                                        .success(function (rv) {
                                            if (rv) {
                                                if (rv) {
                                                    if (rv.msg) {
                                                        scope.flow.message.success(rv.msg);
                                                    }
                                                }
                                                rs.$broadcast(scope.flow.event.getSuccessEventId(), rv, method);
                                            }
                                        })
                                        .error(function (data) {
                                            if (data) {
                                                scope.flow.message.danger(data.msg);
                                            }
                                            rs.$broadcast(scope.flow.event.getErrorEventId(), data, method);
                                        });
                                } else if (method.toLowerCase() === "post") {
                                    uri = scope.task.page.post;

                                    if (param !== undefined && param !== "null") {
                                        if (uri.search(scope.pathRegexPattern) > 0) {
                                            uri = scope.generateUrl(uri, param);
                                        } else {
                                            uri = uri + param;
                                        }
                                    }

                                    f2.post(uri, data, scope.task)
                                        .success(function (rv) {
                                            if (rv) {
                                                if (rv.msg) {
                                                    scope.flow.message.success(rv.msg);
                                                }
                                            }
                                            rs.$broadcast(scope.flow.event.getSuccessEventId(), rv, method);
                                        })
                                        .error(function (data) {
                                            if (data) {
                                                scope.flow.message.danger(data.msg);
                                            }
                                            rs.$broadcast(scope.flow.event.getErrorEventId(), data, method);
                                        });
                                }

                            }

                        };

                        scope.flow.goToHome = function () {
                            angular.forEach(scope.task.pages, function (page) {
                                if (page.isHome) {
                                    scope.task.page = page;
                                    scope.homeUrl = page.get;

                                    if (page.param) {
                                        scope.homeUrl = scope.homeUrl + page.param;
                                    }

                                    for (var i = 0; i < scope.task.toolbars.length; i++) {
                                        if (scope.task.toolbars[i].id === 'back') {
                                            scope.task.toolbars[i].disabled = true;
                                        }
                                        if (scope.task.toolbars[i].id === 'forward') {
                                            scope.task.toolbars[i].disabled = true;
                                        }
                                    }
                                    scope.currentPageIndex = 0;
                                    scope.task.navPages = [page];

                                    scope.loadGet();
                                }
                            });

                        };

                        /*********************/

                        /*Instance creation*/


                        scope.$watch(function (scope) {
                            return scope.task;
                        }, function (task) {
                            if (task) {
                                if (task.generic) {
                                    scope.task.page = undefined;
                                    0;
                                    scope.baseTask = ss.getSessionProperty(scope.task.url);

                                    if (scope.baseTask) {
                                        0;
                                        var newTask = scope.task.newTask;
                                        var $task = {};
                                        scope.copy = {};
                                        angular.copy(scope.task, scope.copy);
                                        0;
                                        if (!f.fullScreen) {

                                            angular.forEach(f.taskList, function (task, key) {

                                                if (task.id === scope.task.id) {
                                                    this.task = task;
                                                    this.index = key;
                                                }

                                            }, $task);

                                            f.taskList[$task.index] = f.buildTask(scope.baseTask);
                                            f.taskList[$task.index].id = f.taskList[$task.index].id + "_" + $task.index;
                                            f.taskList[$task.index].origin = scope.task.origin;
                                            scope.task = f.taskList[$task.index];
                                        } else {
                                            scope.task = f.buildTask(scope.baseTask);
                                            scope.task.id = "fullscreen_" + scope.baseTask.id;
                                        }
                                        scope.task.generic = false;
                                        scope.task.newTask = newTask;
                                        scope.task.flowHttpService = f2;
                                    } else {
                                        0;
                                        f2.get(scope.task.url, scope.task).success(function (d) {
                                            ss.addSessionProperty(scope.task.url, d);
                                            var newTask = scope.task.newTask;
                                            var $task = {};
                                            scope.copy = {};
                                            angular.copy(scope.task, scope.copy);
                                            0;
                                            if (!f.fullScreen) {

                                                angular.forEach(f.taskList, function (task, key) {

                                                    if (task.id === scope.task.id) {
                                                        this.task = task;
                                                        this.index = key;
                                                    }

                                                }, $task);

                                                f.taskList[$task.index] = f.buildTask(d);
                                                f.taskList[$task.index].id = f.taskList[$task.index].id + "_" + $task.index;
                                                f.taskList[$task.index].origin = scope.task.origin;
                                                scope.task = f.taskList[$task.index];
                                            } else {
                                                scope.task = f.buildTask(d);
                                                scope.task.id = "fullscreen_" + d.id;
                                            }
                                            scope.task.generic = false;
                                            scope.task.newTask = newTask;
                                            scope.task.flowHttpService = f2;
                                            0;
                                            0;
                                        });
                                    }
                                }
                            }

                        });

                        /*********************/

                    },
                    post: function (scope, element) {

                        var parent = element.parent();

                        scope.$on(scope.flow.getEventId("navTo"), function (event, name) {
                            scope.flow.navTo(name);
                        });

                        scope.$on(scope.flow.getEventId("selectPage"), function (event, name) {
                            var i = scope.currentPageIndex;
                            for (var index = 0; i < scope.task.navPages.length; i++) {
                                if (scope.task.navPages[index].name == name) {
                                    i = index;
                                    break;
                                }
                            }
                            var count = scope.task.navPages.length - (i + 1);
                            var page = scope.task.navPages[i];
                            scope.task.navPages.splice((i + 1), count);
                            scope.flow.navTo(name);
                            scope.task.page = page;
                        });

                        scope.$on(scope.flow.event.getGoToEventId(), function (event, name, param) {
                            scope.flow.goTo(name, param);
                        });

                        scope.$on(scope.flow.event.getOnTaskLoadedEventId(), function (event) {

                        });

                        /*scope.$on(scope.flow.event.getPageCallBackEventId, function (event, page, data) {
                         scope.flow.pageCallBack(page, data);
                         });*/

                        scope.$on(EVENT_NOT_ALLOWED + scope.task.id, function (event, msg) {
                            scope.flow.message.danger(msg);
                            angular.forEach(scope.task.navPages, function (page, key) {

                                if (page.name === scope.task.navPages.name) {
                                    scope.task.navPages.splice(key, 1);
                                    scope.flow.goTo(scope.task.prevPage.name);
                                }
                            });

                        });

                        /*******************/


                        /* Post creation */


                        scope.$watch(function (scope) {
                            if (scope.task) {
                                return scope.task;
                            }
                            return;
                        }, function (task) {
                            if (task) {
                                0;
                                if (task.generic === false) {
                                    if (task.lazyLoad === true) {
                                        var pathArr = undefined;
                                        if (task.moduleFiles.indexOf(",") > 0) {
                                            pathArr = task.moduleFiles.split(",");
                                        }

                                        var files = [];
                                        if (pathArr) {
                                            for (var i = 0; i < pathArr.length; i++) {
                                                files.push(pathArr[i]);
                                            }
                                        } else {
                                            files.push(task.moduleFiles);
                                        }

                                        oc.load({
                                            name: task.moduleJS,
                                            files: files,
                                            cache: true
                                        }).then(function () {
                                            0;
                                            generateTask(scope, t, f2);
                                        });
                                    } else {
                                        t(function () {
                                            generateTask(scope, t, f2);
                                        });
                                    }


                                    scope.task.refresh = function () {
                                        if (scope.task.page.autoGet) {
                                            scope.task.loaded = false;
                                            f2.get(scope.homeUrl, scope.task)
                                                .success(function (data) {
                                                    if (scope.task.page.load) {
                                                        scope.task.page.load(data, "refresh");
                                                    }
                                                    if (scope.flow.pageCallBack) {
                                                        scope.flow.pageCallBack(scope.task.page.name, data, "refresh");
                                                    }
                                                    scope.task.loaded = true;
                                                })
                                                .error(function (data) {
                                                    scope.task.loaded = true;
                                                });
                                        } else {
                                            rs.$broadcast(scope.flow.event.getRefreshId());
                                            scope.flow.onRefreshed();
                                        }
                                    };
                                    scope.task.max25 = function (clientState) {
                                        scope.task.size = 25;
                                        parent.removeClass("col-lg-12");
                                        parent.removeClass("col-lg-8");
                                        parent.removeClass("col-lg-6");
                                        parent.addClass("col-lg-4");
                                        if (clientState === undefined || clientState === false) {
                                            if (scope.task.page && scope.task) {
                                                rs.$broadcast(scope.flow.event.getResizeEventId(), scope.task.page.name, scope.task.size);
                                            }
                                            scope.userTask.size = scope.task.size;
                                            if (scope.task.generic === false) {
                                                if (scope.task.id.indexOf("gen") === -1) {
                                                    scope.userTask.flowTaskId = scope.task.id.split("_")[0];
                                                    scope.userTask.flowId = scope.task.flowId;
                                                    f2.post("services/flow_user_task_crud/save_task_state?field=size", scope.userTask, scope.task)
                                                        .then(function () {
                                                            t(function () {
                                                                generateTask(scope, t, f2);
                                                            });
                                                        });
                                                }
                                            }
                                        }

                                    };
                                    scope.task.max50 = function (clientState) {
                                        scope.task.size = 50;
                                        parent.removeClass("col-lg-12");
                                        parent.removeClass("col-lg-8");
                                        parent.removeClass("col-lg-4");
                                        parent.addClass("col-lg-6");
                                        if (clientState === undefined || clientState === false) {
                                            if (scope.task.page && scope.task) {
                                                rs.$broadcast(scope.flow.event.getResizeEventId(), scope.task.page.name, scope.task.size);
                                            }
                                            scope.userTask.size = scope.task.size;
                                            if (scope.task.generic === false) {
                                                if (scope.task.id.indexOf("gen") === -1) {
                                                    scope.userTask.flowTaskId = scope.task.id.split("_")[0];
                                                    scope.userTask.flowId = scope.task.flowId;
                                                    f2.post("services/flow_user_task_crud/save_task_state?field=size", scope.userTask, scope.task)
                                                        .then(function () {
                                                            t(function () {
                                                                generateTask(scope, t, f2);
                                                            });
                                                        });
                                                }
                                            }
                                        }
                                    };
                                    scope.task.max75 = function (clientState) {
                                        scope.task.size = 75;
                                        parent.removeClass("col-lg-12");
                                        parent.removeClass("col-lg-6");
                                        parent.removeClass("col-lg-4");
                                        parent.addClass("col-lg-8");
                                        if (clientState === undefined || clientState === false) {
                                            if (scope.task.page && scope.task) {
                                                rs.$broadcast(scope.flow.event.getResizeEventId(), scope.task.page.name, scope.task.size);
                                            }
                                            scope.userTask.size = scope.task.size;
                                            if (scope.task.generic === false) {
                                                if (scope.task.id.indexOf("gen") === -1) {
                                                    scope.userTask.flowTaskId = scope.task.id.split("_")[0];
                                                    scope.userTask.flowId = scope.task.flowId;
                                                    f2.post("services/flow_user_task_crud/save_task_state?field=size", scope.userTask, scope.task);
                                                    0;
                                                }
                                            }
                                        }

                                    };
                                    scope.task.max100 = function (clientState) {
                                        scope.task.size = 100;
                                        parent.removeClass("col-lg-8");
                                        parent.removeClass("col-lg-6");
                                        parent.removeClass("col-lg-4");
                                        parent.addClass("col-lg-12");
                                        if (clientState === undefined || clientState === false) {
                                            if (scope.task.page && scope.task) {
                                                rs.$broadcast(scope.flow.event.getResizeEventId(), scope.task.page.name, scope.task.size);
                                            }
                                            scope.userTask.size = scope.task.size;
                                            if (scope.task.generic === false) {
                                                if (scope.task.id.indexOf("gen") === -1) {
                                                    scope.userTask.flowTaskId = scope.task.id.split("_")[0];
                                                    scope.userTask.flowId = scope.task.flowId;
                                                    f2.post("services/flow_user_task_crud/save_task_state?field=size", scope.userTask, scope.task)
                                                        .then(function () {
                                                            t(function () {
                                                                generateTask(scope, t, f2);
                                                            });
                                                        });

                                                }
                                            }
                                        }
                                    };
                                    scope.task.hide = function () {
                                        if (scope.task.onWindowHiding(scope.task.page)) {
                                            if (scope.flowFrameService.fullScreen) {
                                                scope.task.fluidScreen();
                                            }
                                            scope.task.active = false;
                                            scope.userTask.active = scope.task.active;
                                            if (scope.task.generic === false) {
                                                if (scope.task.id.indexOf("gen") === -1) {
                                                    scope.userTask.flowTaskId = scope.task.id.split("_")[0];
                                                    scope.userTask.flowId = scope.task.flowId;
                                                    f2.post("services/flow_user_task_crud/save_task_state?field=active", scope.userTask, scope.task);

                                                }

                                            }
                                        }

                                    };
                                    scope.task.close = function () {
                                        if (scope.task.onWindowClosing(scope.task.page)) {

                                            if (scope.task.generic === false) {
                                                if (scope.task.id.indexOf("gen") === -1) {
                                                    scope.userTask.closed = true;
                                                    scope.userTask.flowTaskId = scope.task.id.split("_")[0];
                                                    scope.userTask.flowId = scope.task.flowId;
                                                    f2.post("services/flow_user_task_crud/save_task_state?field=close", scope.userTask, scope.task)
                                                        .success(function (data) {
                                                            for (var i = 0; i < f.taskList.length; i++) {
                                                                var task = f.taskList[i];
                                                                if (scope.task.id === task.id) {
                                                                    f.taskList.splice(i, 1);
                                                                }
                                                                if (scope.flowFrameService.fullScreen) {
                                                                    scope.task.fluidScreen();
                                                                }
                                                                if (!rs.$$phase) {
                                                                    scope.$apply();
                                                                }
                                                            }
                                                        })
                                                        .error(function (data) {

                                                        })
                                                        .then(function (data) {
                                                            scope.$destroy();
                                                        });

                                                }
                                            }
                                        }

                                    };
                                    scope.task.pin = function () {
                                        scope.task.pinned = !scope.task.pinned;
                                        if (scope.task.pinned === true) {
                                            scope.userTask.page = scope.task.page.name;
                                            scope.userTask.param = scope.task.page.param;
                                            scope.task.onWindowPinned(scope.task.page);
                                        } else {
                                            scope.userTask.page = "";
                                            scope.userTask.param = "";
                                        }

                                        if (scope.task.generic === false) {
                                            if (scope.task.id.indexOf("gen") === -1) {
                                                scope.userTask.flowTaskId = scope.task.id.split("_")[0];
                                                scope.userTask.flowId = scope.task.flowId;
                                                scope.userTask.pinned = scope.task.pinned;
                                                f2.post("services/flow_user_task_crud/save_task_state?field=pin", scope.userTask, scope.task);
                                            }
                                        }
                                    };
                                    scope.task.fullScreen = function () {
                                        f.toggleFullscreen(scope.task);
                                        if (!rs.$$phase) {
                                            scope.$apply();
                                        }
                                    };
                                    scope.task.fluidScreen = function () {
                                        f.toggleFluidscreen();
                                        if (!rs.$$phase) {
                                            scope.$apply();
                                        }
                                    };
                                    if (scope.task && !scope.flowFrameService.fullscreen) {
                                        if (scope.task.size) {
                                            if (scope.task.size == '25') {
                                                scope.task.max25(true);
                                            } else if (scope.task.size == '50') {
                                                scope.task.max50(true);
                                            } else if (scope.task.size == '75') {
                                                scope.task.max75(true);
                                            } else if (scope.task.size == '100') {
                                                scope.task.max100(true);
                                            }
                                        }
                                    }
                                }


                                if (scope.flowFrameService.fullScreen) {
                                    parent.addClass("col-lg-12");
                                    parent.removeClass("col-lg-8");
                                    parent.removeClass("col-lg-4");
                                    parent.removeClass("col-lg-6");
                                }
                            }

                        });


                        scope.$watch(function (scope) {
                            return (!scope.task.generic && scope.flowFrameService.fullScreen);
                        }, function (fullScreen) {
                            if (fullScreen) {
                                var height = window.innerHeight;
                                height = estimateHeight(height) - 50;
                                var panel = $("#_id_fp_" + scope.task.id + ".portlet");
                                var panelBody = panel.find(".portlet-body");
                                panel.height(height);
                                var headerHeight = panel.find("div.portlet-header").height();
                                panelBody.height(height - headerHeight);
                                panelBody.css("overflow", "auto");
                            }
                            if (scope.task.generic === false) {
                                scope.task.loaded = false;
                                var loadGetFn = function () {
                                    if (scope.task) {
                                        scope.task.preLoad();
                                        scope.task.preLoaded = true;

                                        scope.loadGet();
                                        if (scope.task.preLoaded) {
                                            scope.task.load();

                                            scope.task.loaded = true;
                                        }
                                        scope.task.postLoad();
                                    }
                                };

                                loadGetFn();
                            }

                        });

                        $(window).on("resize", function () {
                            if (scope.flowFrameService.fullScreen) {
                                var height = window.innerHeight;

                                height = estimateHeight(height) - 50;

                                scope.flowFrameService.getFrame().css("overflow", "hidden");

                                var panel = $("#_id_fp_" + scope.task.id + ".portlet");

                                var panelBody = panel.find(".portlet-body");

                                panel.height(height);

                                var headerHeight = panel.find("div.portlet-header").height();

                                panelBody.height(height - headerHeight);

                                panelBody.css("overflow", "auto");

                                0;

                                0;

                            }
                        });


                        element.ajaxStart(function () {
                            t(function () {
                                scope.task.loaded = false;
                                0;
                            });
                        });

                        element.ajaxStop(function () {
                            t(function () {
                                scope.task.loaded = true;
                                0;
                            });
                        })


                        /********************/
                    }

                }

            }
        }])
    .directive("flowFrame", ["flowFrameService", "$window", "$rootScope", "$timeout", "$templateCache", function (f, w, rs, t, tc) {
        return {
            restrict: "E",
            transclude: true,
            scope: true,
            template: tc.get("templates/fluid/fluidFrame.html"),
            replace: true,
            link: function (scope, element) {

                scope.frame = {};
                scope.flowFrameService = f;


                scope.$watch(function (scope) {
                    return scope.flowFrameService.fullScreen;
                }, function (fullScreen) {

                    var frameDiv = $(element.find("div.form-group")[1]);

                    if (!fullScreen) {
                        var height = window.innerHeight;
                        height = estimateHeight(height);
                        if (scope.flowFrameService.isSearch) {
                            frameDiv.attr("style", "height:" + height + "px;overflow:auto");
                        } else {
                            element.attr("style", "height:" + height + "px;overflow:auto");
                        }
                        $("body").attr("style", "height: " + height + "px;overflow:hidden");
                    } else {
                        var height = window.innerHeight;
                        height = estimateHeight(height);
                        if (scope.flowFrameService.isSearch) {
                            //frameDiv.attr("style", "height:" + height + "px;overflow:hidden");
                        } else {
                            //element.attr("style", "height:" + height + "px;overflow:hidden");
                        }
                    }
                });


                scope.show = function (task) {
                    if (!task.pinned) {
                        task.active = !task.active;
                    }
                };

                $(window).on("resize", function () {
                    if (!scope.flowFrameService.fullScreen) {
                        var height = window.innerHeight;
                        height = estimateHeight(height);
                        if (scope.flowFrameService.isSearch) {
                            frameDiv.attr("style", "height:" + height + "px;overflow:auto");
                        } else {
                            element.attr("style", "height:" + height + "px;overflow:auto");
                        }
                    } else {
                        var height = window.innerHeight;
                        height = estimateHeight(height);
                        if (scope.flowFrameService.isSearch) {
                            frameDiv.attr("style", "height:" + height + "px;overflow:hidden");
                        } else {
                            element.attr("style", "height:" + height + "px;overflow:hidden");
                        }
                    }

                    $("body").attr("style", "height: " + height + "px;overflow:hidden");
                });


                scope.initTask = function (task) {
                    if (task) {
                        scope.$watch(function () {
                            return task.active;
                        }, function (newValue, oldValue) {
                            if (true === newValue) {
                                if (task.onWindowOpening) {
                                    task.onWindowOpened();
                                } else {
                                    task.active = false;
                                }
                            }

                        });
                    }
                }
            }
        };
    }])
    .directive("flowTool", ["$rootScope", "$compile", "$templateCache", function (r, c, tc) {

        return {
            scope: {task: '=', controls: '=', pages: '=', flow: "=", size: "@"},
            restrict: "E",
            replace: true,
            template: tc.get("templates/fluid/fluidToolbar.html"),
            link: function (scope, element, attr) {

                if (attr.size) {
                    if (attr.size === "small") {
                        scope.size = "btn-group-xs";
                    } else if (attr.size === "medium") {
                        scope.size = "btn-group-sm";
                    } else if (attr.size === "large") {
                        scope.size = "btn-group-md";
                    }
                } else {
                    scope.size = "btn-group-md";
                }


                scope.runEvent = function (control) {
                    0;
                    if (control.action) {
                        control.action();
                    } else {
                        var event = control.id + "_fp_" + scope.task.id;
                        r.$broadcast(event);
                    }

                };


                scope.goToEvent = function (name, param) {
                    scope.flow.navTo(name);
                };

                scope.getClass = function (uiType) {
                    if (uiType.toLowerCase() === "info") {
                        return "btn-info";
                    } else if (uiType.toLowerCase() === "danger") {
                        return "btn-danger";
                    } else if (uiType.toLowerCase() === "warning") {
                        return "btn-warning";
                    } else if (uiType.toLowerCase() === "inverse") {
                        return "btn-inverse";
                    } else if (uiType.toLowerCase() === "success") {
                        return "btn-success";
                    } else if (uiType.toLowerCase() === "primary") {
                        return "btn-primary";
                    } else {
                        return "btn-default";
                    }
                }
            }
        }
    }])
    .directive("flowBar", ["flowFrameService", "$templateCache", "$compile", "flowHttpService", function (f, tc, c, f2) {

        return {
            restrict: "AEC",
            link: function (scope, element) {

                scope.taskList = f.taskList;

                scope.open = function (task) {
                    if (task.active === true) {
                        scope.scroll(task);
                    } else {
                        task.active = true;
                        if (task.id.indexOf("gen") === -1) {
                            scope.userTask = {};
                            scope.userTask.flowTaskId = task.id.split("_")[0];
                            scope.userTask.active = task.active;
                            scope.userTask.flowId = task.flowId;
                            f2.post("services/flow_user_task_crud/save_task_state?field=active", scope.userTask, task);
                        }
                    }

                };
                scope.scroll = function (task) {
                    $("body").scrollTo($("#_id_fp_" + task.id), 800);

                }
            },
            replace: true,
            template: tc.get("templates/fluid/fluidBar2.html")
        };
    }])
    .directive("flowField", ["$templateCache", function (tc) {
        return {
            restrict: "AE",
            scope: {
                name: "@",
                model: "=",
                label: "@",
                type: "@",
                required: "=",
                disabled: "=",
                blur: "&"
            },
            template: tc.get("templates/fluid/fluidField.html"),
            replace: true,
            link: function (scope, elem, attr) {

                if (!scope.name && scope.label) {
                    scope.name = scope.label.trim().split(" ").join("_");
                }
                if (scope.type === undefined) {
                    scope.type = "text";
                }
            }
        }
    }])
    .directive("flowTextArea", ["$templateCache", function (tc) {
        return {
            restrict: "AE",
            scope: {
                name: "@",
                model: "=",
                label: "@",
                required: "=",
                disabled: "=",
                rows: "=",
                cols: "="
            },
            template: tc.get("templates/fluid/fluidTextArea.html"),
            replace: true,
            link: function (scope, elem, attr) {
                if (!scope.name && scope.label) {
                    scope.name = scope.label.trim().split(" ").join("_");
                }
            }
        }
    }])
    .directive("flowCheck", ["$compile", "$templateCache", function (c, tc) {
        return {
            restrict: "AE",
            scope: {model: "=", label: "@", required: "=", disabled: "=", name: "@"},
            template: tc.get("templates/fluid/fluidCheckbox.html"),
            link: function (scope) {
                if (!scope.name && scope.label) {
                    scope.name = scope.label.trim().split(" ").join("_");
                }
                if (scope.required === undefined) {
                    scope.required = false;
                }

                if (scope.disabled === undefined) {
                    scope.disabled = false;
                }

                if (scope.model === undefined) {
                    scope.model = false;
                }

                scope.update = function () {
                    if (scope.disabled === undefined || scope.disabled === false || scope.disabled === null) {
                        scope.model = !scope.model;
                    }
                }

            },
            replace: true
        }
    }])
    .directive("flowMessage", [function () {
        return {
            restrict: "AE",
            replace: true,
            template: "<div></div>"

        }
    }])
    .directive("flowModal", ["flowFrameService", "$templateCache", function (f, tc) {
        return {
            restrict: "AE",
            /*  template: "<div ng-class='flowFrameService.fullScreen ? \"overlay-full\" : \"overlay\"' class='hidden animated fadeIn anim-dur'><div ng-style='style' class='flow-modal animated pulse anim-dur'><div ng-transclude></div></div></div>",*/
            template: tc.get("templates/fluid/fluidModal.html"),
            replace: true,
            transclude: true,
            link: function (scope, element, attr) {
                scope.flowFrameService = f;
                scope.style = {};

                if (attr.height) {
                    scope.style.height = attr.height;
                }

                if (attr.width) {
                    scope.style.width = attr.width;
                }
            }
        }
    }])
    .directive("flowSubTable", ["$compile", "flowModalService", "flowHttpService", "flowFrameService", "$rootScope", function (c, fm, f, f2, rs) {
        return {
            restrict: "AE",
            transclude: true,
            replace: true,
            scope: {
                task: "=",
                flow: "=",
                lookUp: "@",
                targetList: "=",
                targetUrl: "@",
                id: "@",
                title: "@",
                keyVar: "@",
                idField: "@",
                sourceUrl: "@",
                editUrl: "@",
                editEvent: "@",
                createEvent: "@"


            },
            template: "<div class='form-group'><div class='panel panel-primary'><div class='panel-heading'><a href='#' class='flow-panel-heading-title' data-toggle='collapse' data-target='#{{id}}_collapse'>{{title}}</a><div class='pull-right'><div class='btn-group btn-group-xs'><button type='button' class='btn btn-info flow-sub-table-control' ng-click='create()' ng-show='createEnabled'><span class='fa fa-plus'></span></button><button ng-show=\"lookUp == 'true'\" type='button' class='btn btn-info flow-sub-table-control' ng-click='look()'><span class='fa fa-search'></span></button></div></div></div><div class='panel-collapse collapse in' id='{{id}}_collapse'><div class='panel-body' ><div ng-transclude></div><div class='container-fluid' style='overflow-y: auto'><table class='table table-responsive table-hover'></table></div></div></div></div>",
            link: function (scope, element) {
                if (!scope.lookUp) {
                    scope.lookUp = "true";
                }

                if (scope.createEvent) {
                    scope.createEnabled = true;
                } else {
                    scope.createEnabled = false;
                }
                if (scope.editEvent || scope.editUrl) {
                    scope.editEnabled = true;
                } else {
                    scope.editEnabled = false;
                }


                if (scope.id === undefined) {

                    var parent = $(element[0]).parent();

                    var size = $(parent).find("flow-sub-table").length;

                    scope.id = "sb_tbl_" + size + "_" + scope.task.id;
                }
                if (!scope.targetList) {
                    scope.targetList = [];
                }
                var parent = $(element[0]).parent().get();

                var modal = $("<div>").attr("id", "{{id}}_add_tbl_mdl").addClass("modal fade fluid-modal").appendTo(parent).get();

                var modalContent = $("<div>").addClass("modal-dialog modal-lg").attr("id", "{{id}}_mdl_cnt").appendTo(modal).get();

                var modalPanel = $("<div>").addClass("panel panel-primary").appendTo(modalContent).get();

                var modalPanelHeading = $("<div>").addClass("panel-heading").appendTo(modalPanel).get();

                var spanTitle = $("<span>").addClass("text-inverse").addClass("col-lg-5 col-md-5 col-sm-3 col-xs-3").html("Select " + scope.title).appendTo(modalPanelHeading).get();

                var inputGroup = $("<div>").addClass("col-lg-7 col-md-7 col-sm-9 col-xs-9").addClass("input-group").appendTo(modalPanelHeading).get();

                var inputSearch = $("<input>").addClass("form-control").attr("type", "text").attr("ng-model", "search").appendTo(inputGroup).get();

                var inputSpan = $("<span>").addClass("input-group-addon").appendTo(inputGroup).get();

                $("<i>").addClass("fa fa-search").appendTo(inputSpan);

                var modalPanelBody = $("<div>").addClass("panel-body").attr("style", "overflow:auto;height:200px").appendTo(modalPanel).get();

                var modalPanelFooter = $("<div>").addClass("panel-footer").attr("style", "height:50px").appendTo(modalPanel).get();

                var pullRightFooterDiv = $("<div>").addClass("pull-right").appendTo(modalPanelFooter).get();

                var buttonGroup = $("<div>").addClass("btn-group btn-group-sm").appendTo(pullRightFooterDiv).get();

                var closeButton = $("<button>").addClass("btn btn-info").attr("ng-click", "close()").attr("type", "button").html("close").appendTo(buttonGroup).get();

                var columns = element.find("flow-sub-column");

                var table = element.find("table");

                var thead = $("<thead>").appendTo(table).get();

                var theadRow = $("<tr>").appendTo(thead).get();

                var tbody = $("<tbody>").appendTo(table).get();

                var modalTable = $("<table>").addClass("table table-responsive table-hovered table-bordered").appendTo(modalPanelBody).get();

                var mThead = $("<thead>").appendTo(modalTable).get();

                var mTheadRow = $("<tr>").appendTo(mThead).get();

                var mTbody = $("<tbody>").appendTo(modalTable).get();

                var tr = $("<tr>").addClass("animated").addClass("slideInDown").addClass("anim-dur").attr("ng-repeat", scope.keyVar + " in targetList").appendTo(tbody).get();

                var mTr = $("<tr>").attr("ng-repeat", scope.keyVar + " in sourceList | filter:search").attr("ng-click", "addToList(" + scope.keyVar + ")").appendTo(mTbody).get();

                if (scope.targetUrl !== undefined) {
                    f.get(scope.targetUrl, scope.task).success(function (data) {
                        scope.targetList = data;
                    });
                }

                $("<th>").html("Action").appendTo(theadRow);

                var tdAction = $("<td>").appendTo(tr).get();

                var buttonGroupDiv = $("<div>").addClass("btn-group").addClass("btn-group-xs").appendTo(tdAction).get();

                if (scope.editEnabled) {
                    var editButton = $("<button>").addClass("btn btn-info").addClass("glyphicon glyphicon-edit").addClass("horizontalSpace").attr("type", "button").attr("title", "edit").attr("ng-click", "edit(" + scope.keyVar + "." + scope.idField + ",$index)").appendTo(buttonGroupDiv).get();
                }

                var removeButton = $("<button>").addClass("btn btn-danger").addClass("glyphicon glyphicon-minus").addClass("horizontalSpace").attr("type", "button").attr("title", "remove").attr("ng-click", "remove($index)").appendTo(buttonGroupDiv).get();


                for (var i = 0; i < columns.length; i++) {
                    var col = $(columns[i]);
                    $("<th>").addClass(col.attr("column-class")).html(col.attr("title")).appendTo(theadRow);
                    $("<th>").addClass(col.attr("column-class")).html(col.attr("title")).appendTo(mTheadRow);
                    if (col.attr("render-with") !== undefined) {
                        $("<td>").addClass(col.attr("column-class")).html(col.attr("render-with")).appendTo(tr);
                        $("<td>").addClass(col.attr("column-class")).html(col.attr("render-with")).appendTo(mTr);
                    } else {
                        $("<td>").addClass(col.attr("column-class")).html("{{" + col.attr("model") + "}}").appendTo(tr);
                        $("<td>").addClass(col.attr("column-class")).html("{{" + col.attr("model") + "}}").appendTo(mTr);
                    }


                }

                scope.create = function () {
                    rs.$broadcast(scope.createEvent + "_fp_" + scope.task.id);
                };

                scope.edit = function (param, index) {
                    if (scope.editUrl) {
                        f2.addTask(scope.editUrl + param, scope.task, true);
                    } else if (scope.editEvent) {
                        rs.$broadcast(scope.editEvent + "_fp_" + scope.task.id, param, index);
                    }


                };


                scope.look = function () {
                    if (scope.sourceUrl) {
                        f.get(scope.sourceUrl, scope.task).success(function (data) {
                            scope.sourceList = data;
                        });
                    }
                    fm.show(scope.id + "_add_tbl_mdl");
                    $(modalContent).addClass("pulse");
                    $(modalContent).one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", function () {
                        $(modalContent).removeClass("pulse");
                    });
                };


                scope.remove = function (index) {
                    scope.targetList.splice(index, 1);
                };

                scope.addToList = function (item) {
                    if (scope.targetList !== undefined) {
                        var exists = false;
                        for (var i = 0; i < scope.targetList.length; i++) {
                            var it = scope.targetList[i];
                            if (item.id === it.id) {
                                exists = true;
                                break;
                            }
                        }
                        if (!exists) {
                            scope.targetList.push(item);
                            scope.close();
                        } else {
                            $(modalContent).addClass("shake");
                            $(modalContent).one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", function () {
                                $(modalContent).removeClass("shake");
                            });
                        }
                    } else {
                        $(modalContent).addClass("shake");
                        $(modalContent).one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", function () {
                            $(modalContent).removeClass("shake");
                        });
                    }

                };

                scope.close = function () {
                    fm.hide(scope.id + "_add_tbl_mdl", scope.id);
                };

                $(element.find("div[ng-transclude]")).remove();

                c(table)(scope);
                c(modal)(scope);

            }
        }
    }])
    .directive("flowSubColumn", [function () {
        return {
            restrict: "AE",
            scope: {title: "@", model: "=", columnClass: "@", renderWith: "@"}

        }
    }])
    .directive("flowLookUp", ["$compile", "flowModalService", "flowHttpService", "flowFrameService", "$timeout", "$templateCache", function (c, fm, f, f2, t, tc) {
        return {
            restrict: "AE",
            scope: {
                task: "=",
                model: "=",
                sourceUrl: "@",
                label: "@",
                fieldLabel: "@",
                disabled: "=",
                required: "=",
                id: "@",
                keyVar: "@",
                fieldValue: "@",
                parentId: "@",
                name: "@"
            },
            link: function (scope, element) {

                if (!scope.name && scope.label) {
                    scope.name = scope.label.trim().split(" ").join("_");
                }
                /*TODO: must return the object when model is a field value */
                if (scope.id === undefined) {
                    var currentElement = $(element).get();
                    var index = $(currentElement).index();
                    scope.id = "lookUp_modal_" + index + "_" + scope.task.id;

                }
                t(function () {
                    scope.sourceList = [];
                    var parent = $(element[0]).parent().get();
                    if (scope.parentId) {

                        while ($(parent).attr("id") !== scope.parentId) {
                            parent = $(parent).parent().get();
                            if (parent === undefined)break;
                        }

                    }

                    var modal = $("<div>").attr("id", "{{id}}_add_tbl_mdl").addClass("modal fade fluid-modal").appendTo(parent).get();

                    var modalContent = $("<div>").addClass("modal-dialog modal-lg").attr("id", "{{id}}_mdl_cnt").appendTo(modal).get();

                    var modalPanel = $("<div>").addClass("panel panel-primary").appendTo(modalContent).get();

                    var modalPanelHeading = $("<div>").addClass("panel-heading").appendTo(modalPanel).get();

                    var spanTitle = $("<span>").addClass("text-inverse").addClass("col-lg-5 col-md-5 col-sm-3 col-xs-3").html("Select " + scope.label).appendTo(modalPanelHeading).get();

                    var inputGroup = $("<div>").addClass("col-lg-7 col-md-7 col-sm-9 col-xs-9").addClass("input-group").appendTo(modalPanelHeading).get();

                    var inputSearch = $("<input>").addClass("form-control").attr("type", "text").attr("ng-model", "search").appendTo(inputGroup).get();

                    var inputSpan = $("<span>").addClass("input-group-addon").appendTo(inputGroup).get();

                    $("<i>").addClass("fa fa-search").appendTo(inputSpan);

                    var modalPanelBody = $("<div>").addClass("panel-body").attr("style", "overflow:auto;height:200px").appendTo(modalPanel).get();

                    var modalPanelFooter = $("<div>").addClass("panel-footer").attr("style", "height:50px").appendTo(modalPanel).get();

                    var pullRightFooterDiv = $("<div>").addClass("pull-right").appendTo(modalPanelFooter).get();

                    var buttonGroup = $("<div>").addClass("btn-group btn-group-sm").appendTo(pullRightFooterDiv).get();

                    var closeButton = $("<button>").addClass("btn btn-info").attr("ng-click", "close()").attr("type", "button").html("close").appendTo(buttonGroup).get();

                    var columns = element.find("flow-sub-column");

                    var modalTable = $("<table>").addClass("table table-responsive table-hover").appendTo(modalPanelBody).get();

                    var mThead = $("<thead>").appendTo(modalTable).get();

                    var mTheadRow = $("<tr>").appendTo(mThead).get();

                    var mTbody = $("<tbody>").appendTo(modalTable).get();
                    var mTr = null;
                    if (!scope.fieldValue) {
                        if (scope.fieldLabel) {
                            mTr = $("<tr>").attr("ng-repeat", scope.keyVar + " in sourceList | filter:search").attr("ng-click", "select(" + scope.keyVar + "," + scope.keyVar + "." + scope.fieldLabel + ")").appendTo(mTbody).get();
                        } else {
                            mTr = $("<tr>").attr("ng-repeat", scope.keyVar + " in sourceList | filter:search").attr("ng-click", "select(" + scope.keyVar + ")").appendTo(mTbody).get();
                        }
                    } else {
                        if (scope.fieldLabel) {
                            mTr = $("<tr>").attr("ng-repeat", scope.keyVar + " in sourceList | filter:search").attr("ng-click", "select(" + scope.keyVar + "." + scope.fieldValue + "," + scope.keyVar + "." + scope.fieldLabel + ")").appendTo(mTbody).get();
                        } else {
                            mTr = $("<tr>").attr("ng-repeat", scope.keyVar + " in sourceList | filter:search").attr("ng-click", "select(" + scope.keyVar + "." + scope.fieldValue + ")").appendTo(mTbody).get();
                        }

                    }

                    for (var i = 0; i < columns.length; i++) {
                        var col = $(columns[i]);
                        $("<th>").addClass(col.attr("column-class")).html(col.attr("title")).appendTo(mTheadRow);

                        if (col.attr("render-with") !== undefined) {
                            $("<td>").addClass(col.attr("column-class")).html(col.attr("render-with")).appendTo(mTr);
                        } else {
                            $("<td>").addClass(col.attr("column-class")).html("{{" + col.attr("model") + "}}").appendTo(mTr);
                        }
                    }
                    var ctnr = undefined;


                    if (scope.fieldLabel) {
                        ctnr = element.find("input").attr("ng-model", "model." + scope.fieldLabel);
                    } else {
                        ctnr = element.find("input").attr("ng-model", "model");
                    }

                    $(element.find("div[ng-transclude]")).remove();
                    c(ctnr)(scope);
                    c(modal)(scope);


                    scope.look = function () {
                        if (scope.sourceUrl) {
                            f.get(scope.sourceUrl, scope.task).success(function (data) {
                                scope.sourceList = data;
                            });
                        }
                        fm.show(scope.id + "_add_tbl_mdl");
                        $(modalContent).addClass("pulse");
                        $(modalContent).one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", function () {
                            $(modalContent).removeClass("pulse");
                        });
                    };

                });
                scope.close = function () {
                    fm.hide(scope.id + "_add_tbl_mdl", scope.id);
                };
                scope.select = function (item, label) {
                    scope.model = item;
                    scope.modelLabel = label;
                    scope.close();
                };
                scope.reset = function (event) {
                    var value = $(event.target).attr("value");
                    $(event.target).attr("value", value);
                };
                scope.isModeled = function () {
                    return scope.model !== undefined;
                };
                scope.isNotModeled = function () {
                    return scope.model === undefined;
                };
                scope.clear = function () {
                    scope.model = undefined;
                };

            },
            template: tc.get("templates/fluid/fluidLookup.html"),
            replace: true,
            transclude: true
        }
    }])
    .directive("flowSelect", ["flowHttpService", "$compile", "$timeout", "$templateCache", function (f, c, t, tc) {
        return {
            scope: {
                id: "@",
                task: "=",
                model: "=",
                label: "@",
                fieldGroup: "@",
                fieldValue: "@",
                fieldLabel: "@",
                sourceUrl: "@",
                disabled: "=",
                required: "=",
                change: "&",
                name: "@"
            },
            link: function (scope, element, attr) {

                scope.templateUrl = "templates/fluid/fluidSelect.html";

                if (!scope.name && scope.label) {
                    scope.name = scope.label.trim().split(" ").join("_");
                }

                if (!scope.id) {
                    scope.id = "fl_slt_" + scope.task.id;
                }

                if (scope.required === undefined || scope.required === "undefined") {
                    scope.required = false;
                }

                if (scope.disabled === undefined || scope.disabled === "undefined") {
                    scope.disabled = false;
                }


                scope.options = "";

                if (scope.fieldValue === undefined) {
                    scope.options = "item";
                } else {
                    scope.options = "item." + scope.fieldValue;
                }

                if (scope.fieldLabel === undefined) {
                } else {
                    scope.options += " as item." + scope.fieldLabel;
                }

                if (scope.fieldGroup) {
                    scope.options += " group by item." + scope.fieldGroup;
                }

                scope.options += " for item in sourceList";

                /* var select = element.find("select").attr("ng-options", options).attr("ng-model", "model").get();*/

                scope.$watch(function (scope) {
                    return scope.sourceUrl;
                }, function (value, old) {
                    0;
                    if (value) {
                        f.get(scope.sourceUrl, scope.task).success(function (sourceList) {
                            scope.sourceList = sourceList;
                            element.html(tc.get(scope.templateUrl));
                            c(element.contents())(scope);
                        });
                    }
                });

                scope.$watch(function (scope) {
                    return attr.values;
                }, function (value, old) {
                    if (value) {
                        scope.sourceList = value.split(",");
                        element.html(tc.get(scope.templateUrl));
                        c(element.contents())(scope);
                    }
                });

                // for IE ng-disabled issue
                scope.$watch(function (scope) {
                        return scope.disabled;
                    },
                    function (newValue) {
                        if (newValue === false) {
                            element.removeAttr("disabled");
                        }
                    });

                scope.$watch(function (scope) {
                    return scope.model;
                }, function (newValue) {
                    scope.change({item: newValue});
                });

            },
            /*   template: tc.get("templates/fluid/fluidSelect.html"),*/
            replace: true
        }
    }])
    .directive("flowPermissionEnabled", ["flowHttpService", "$compile", "sessionService", function (f, c, ss) {
        return {
            restrict: "A",
            scope: {task: "=", page: "="},
            link: function (scope, element, attr) {


                if (attr.method) {
                    scope.method = attr.method;
                }
                0;

                var url = f.permissionUrl + "?pageName=" + scope.page.name + "&method=" + scope.method;

                var enabled = ss.getSessionProperty(url);

                0;

                if (enabled !== null) {
                    0;
                    if (enabled === 'false') {
                        element.attr("disabled", "");
                    }
                }

                if (enabled === null) {
                    f.get(url, scope.task)
                        .success(function (data) {
                            if (!data) {
                                element.attr("disabled", "");
                            }
                            ss.addSessionProperty(url, data);
                        });
                    0;
                }
            }

        }
    }])
    .directive("flowPermissionVisible", ["flowHttpService", "$compile", "sessionService", function (f, c, ss) {
        return {
            restrict: "A",
            scope: {task: "=", page: "="},
            link: function (scope, element, attr) {

                if (attr.method) {
                    scope.method = attr.method;
                }
                0;

                var url = f.permissionUrl + "?pageName=" + scope.page.name + "&method=" + scope.method;

                var visible = ss.getSessionProperty(url);

                0;

                if (visible !== null) {
                    0;

                    if (visible === 'false') {
                        element.addClass("hidden");
                        0;
                    } else {
                        0;
                        element.removeClass("hidden");
                    }

                }

                if (visible === null) {
                    f.get(url, scope.task)
                        .success(function (data) {
                            if (!data) {
                                element.addClass("hidden");
                            }
                            ss.addSessionProperty(url, data);
                        });

                }

            }

        }
    }])
    .directive("flowTooltip", [function () {
        return {
            restrict: "A",
            link: function (scope, element, attr) {

                scope.tooltipTime = 400;

                if (attr.tooltipTime) {
                    scope.tooltipTime = attr.tooltipTime;
                }

                if (attr.tooltipHeaderTitle) {
                    scope.tooltipHeaderTitle = attr.tooltipHeaderTitle;
                }

                if (attr.tooltipPosition) {
                    scope.tooltipPosition = attr.tooltipPosition;
                }

                if (attr.tooltipEvent) {
                    scope.tooltipEvent = attr.tooltipEvent;
                }

                if (attr.tooltipTitle) {
                    scope.tooltipTitle = attr.tooltipTitle;
                }


                if (attr.tooltipMy) {
                    scope.my = attr.tooltipMy;
                }

                if (attr.tooltipAt) {
                    scope.at = attr.tooltipAt;
                }


                if (!scope.tooltipPosition) {
                    scope.tooltipPosition = "{\"my\":\"top center\",\"at\":\"bottom center\"}";
                }


                if (!scope.tooltipEvent) {
                    scope.tooltipEvent = "hover";
                }

                scope.position = JSON.parse(scope.tooltipPosition);

                if (scope.my) {
                    scope.position.my = scope.my;
                }

                if (scope.at) {
                    scope.position.at = scope.at;
                }

                scope.tooltip = $(element[0]).qtip({
                        content: {
                            title: scope.tooltipHeaderTitle,
                            text: scope.tooltipTitle
                        },
                        position: {
                            at: scope.position.at,
                            my: scope.position.my,
                            adjust: {
                                method: "none shift"
                            }
                        }, hide: {
                            event: 'click',
                            inactive: scope.tooltipTime
                        },
                        style: "qtip-dark"
                    }
                );

                scope.api = scope.tooltip.qtip("api");

                scope.$watch(function () {
                    return $(element[0]).attr("tooltip-title")
                }, function (newValue) {
                    scope.api.set(
                        "content.text", newValue
                    );
                });


            }

        }
    }])
    .directive("flowEdit", [function () {
        return {
            restrict: "AE",
            replace: true,
            transclude: true,
            template: "<div class='form-group'><label class='control-label col-sm-2'>{{label}}<span style='color: #ea520a' ng-show='required'>*</span></label><div class='col-sm-10 marginBottom5px' ng-transclude></div></div>",
            link: function (scope, element, attr) {
                if (attr.label) {
                    scope.label = attr.label;
                }

                if (attr.required) {
                    if (attr.required.toLowerCase() === "true") {
                        scope.required = true;
                    } else {
                        scope.required = false;
                    }
                }
            }
        }
    }])
    .directive("flowImage", ["$timeout", "Upload", "sessionService", "flowHttpService", "$templateCache", function (t, u, ss, fh, tc) {
        return {
            scope: {
                model: "=",
                label: "@",
                required: "=",
                url: "@",
                method: "@",
                task: "=",
                sourceUrl: "@",
                fileChanged: "&",
                defaultImage: "@",
                disabled: "="
            },
            template: tc.get("templates/fluid/fluidImage.html"),
            replace: true,
            link: function (scope) {
                scope.fileReaderSupported = window.FileReader != null && (window.FileAPI == null || FileAPI.html5 != false);
                scope.preview = [];
                scope.notDone = true;
                var tries = 0;

                if (!scope.defaultImage) {
                    scope.defaultImage = "images/gallery/profile_default.png";
                }

                scope.refresh = function () {
                    t(function () {
                        0;
                        if (scope.model) {
                            0;
                            if (scope.sourceUrl) {
                                scope.preview[0] = {};
                                scope.preview[0].dataUrl = fh.host + scope.sourceUrl + scope.model;
                            }
                            if (tries == 5) {
                                tries = 0;
                                scope.notDone = false;
                            } else {
                                tries++;
                                scope.refresh();
                            }
                        } else {
                            if (!scope.model) {
                                scope.preview[0] = {};
                                scope.preview[0].dataUrl = scope.defaultImage;
                            }
                            if (tries == 5) {
                                tries = 0;
                                scope.notDone = false;
                            } else {
                                tries++;
                                scope.refresh();
                            }
                        }
                    }, 1000);
                };
                scope.refresh();

                scope.onFileSelect = function ($files, $file, $event, $rejectedFiles) {
                    0;
                    var file = $file;
                    if (file != null) {
                        if (scope.fileReaderSupported && file.type.indexOf('image') > -1) {
                            t(function () {
                                var fileReader = new FileReader();
                                fileReader.readAsDataURL(file);
                                fileReader.onload = function (e) {
                                    t(function () {
                                        file.dataUrl = e.target.result;
                                    });
                                };
                                var bufferRead = new FileReader();

                                bufferRead.readAsArrayBuffer(file);

                                bufferRead.onload = function (e) {
                                    t(function () {
                                        file.data = e.target.result;
                                        u.upload({
                                            url: fh.host + scope.url,
                                            method: scope.method,
                                            headers: {
                                                "flow-container-id": "_id_fpb_" + scope.task.id,
                                                "flowPage": scope.task.currentPage,
                                                "flowUploadFileId": scope.model
                                            },
                                            data: {file: file}
                                        }).progress(function (evt) {
                                            file.progress = parseInt(100.0 * evt.loaded / evt.total);
                                        }).success(function (data, status, headers, config) {
                                            scope.model = data.id;
                                            scope.fileChanged();

                                        }).error(function (data, status, headers, config) {
                                        });
                                    });

                                }
                            });
                        }
                    }
                };

            }
        }
    }])
    .directive("flowLoader", ["flowLoaderService", function (fls) {

        return {
            restrict: "AE",
            scope: {loaderClass: "@"},
            transclude: true,
            template: "<span><i class='text-inverse' ng-show='!flowLoaderService.loaded' ng-class='loaderClass'></i><span ng-show='flowLoaderService.loaded' ng-transclude></span></span>",
            replace: true,
            link: function (scope, element) {
                scope.flowLoaderService = fls;
                scope.flowLoaderService.loaded = true;
            }

        }

    }])
    .directive("fluidLoader", ["flowLoaderService", function (fls) {

        return {
            restrict: "AE",
            scope: {idleClass: "@"},
            transclude: true,
            template: "<span><i class='text-inverse' ng-show='flowLoaderService.loaded' ng-class='idleClass'></i><span ng-show='!flowLoaderService.loaded' ng-transclude></span></span>",
            replace: true,
            link: function (scope, element) {
                scope.flowLoaderService = fls;
                scope.flowLoaderService.loaded = true;
            }

        }

    }])
    .directive("flowDatePicker", ["$filter", "$templateCache", function (f, tc) {
        return {
            restrict: "AE",
            scope: {
                name: "@",
                model: "=",
                label: "@",
                format: "@",
                required: "=",
                disabled: "="
            },
            template: tc.get("templates/fluid/fluidDatePicker.html"),
            replace: true,
            link: function (scope, elem, attr) {

                if (scope.model) {
                    scope.temp = scope.model;
                }

                if (scope.format === undefined) {
                    scope.format = "mm/dd/yyyy";
                }

                var inDatepicker = $(elem[0]).find(".datepicker").datepicker({
                    format: scope.format,
                    forceParse: false,
                    language: "en"
                });

                if (!scope.name && scope.label) {
                    scope.name = scope.label.trim();
                }

                scope.convertToTimestamp = function () {
                    var date = $(elem[0]).find(".datepicker").datepicker("getDate");
                    var convertedDate = new Date(date).getTime();
                    scope.model = convertedDate;
                }

            }

        }
    }])
    .directive("flowRadio", ["$compile", "$templateCache", function (c, tc) {
        return {
            scope: {
                name: "@",
                model: "=",
                label: "@",
                required: "=",
                disabled: "=",
                direction: "@",
                group: "@",
                options: "="
            },
            restrict: "AE",
            replace: true,
            template: tc.get("templates/fluid/fluidRadio.html"),
            link: function (scope, element) {
                if (!scope.name && scope.label) {
                    scope.name = scope.label.trim().split(" ").join("_");
                }
                if (scope.group === undefined) {
                    scope.group = "optRadio";
                }
                if (scope.direction === undefined) {
                    scope.direction = "horizontal";
                }

                var parent = element[0];
                var parentDiv = $(element[0]).find(".fluid-radio").get();
                var div = undefined;

                for (var i = 0; i < scope.options.length; i++) {
                    var option = scope.options[i];

                    if (div) {
                        if (scope.direction === "vertical") {
                            div = $("<div>").addClass("radio").appendTo(parentDiv);
                        }
                    } else {
                        div = $("<div>").addClass("radio").appendTo(parentDiv);
                        if (scope.direction === "horizontal") {
                            $(div).addClass("fluid-radio-horizontal");
                        }
                    }


                    if (scope.disabled) {
                        option.disabled = scope.disabled;
                    }

                    if (scope.required) {
                        option.required = scope.required;
                    }

                    var label = $("<label>").html(option.label).appendTo(div).get();

                    var radio = $("<input>").attr("name", scope.group).attr("type", "radio").attr("ng-click", "select('" + option.value + "')").prependTo(label).get();


                    if (option.disabled) {
                        $(radio).attr("ng-disabled", option.disabled);
                    }

                    if (option.required) {
                        $(radio).attr("ng-required", option.required);
                    }

                    if (scope.model) {
                        if (option.value === scope.model) {
                            $(radio).prop("checked", true);
                        }
                    }

                }

                scope.select = function (value) {
                    scope.model = value;
                }

                c(element.contents())(scope);
            }
        }
    }])
    .directive("flowUploader", ["$upload", "$templateCache", function (u, tc) {
        return {
            restict: "AE",
            link: function (scope, element, attr) {
            },
            template: tc.get("templates/fluid/fluidUploader.html")
        }
    }])
    .directive("column", function () {
        return {
            restrict: "A",
            link: function (scope, element, attr) {
                if (attr.column) {
                    scope.column = attr.column;
                }

                if (scope.column) {
                    element.addClass("col-lg-" + scope.column)
                        .addClass("col-md-12")
                        .addClass("col-sm-12")
                        .addClass("col-xs-12")
                }
            }
        }
    })
    .directive('fluidInclude', ['$http', '$compile', '$timeout', "$rootScope", function (h, c, t, r) {
        return {
            restrict: 'AE',
            link: function link($scope, elem, attrs) {
                //if url is not empty
                if (attrs.name) {
                    $scope.name = attrs.name;
                }

                if (attrs.taskid) {
                    $scope.taskId = attrs.taskid;
                }

                if (attrs.url) {
                    h({method: 'GET', url: attrs.url, cache: true}).then(function (result) {
                        elem.append(c(angular.element(result.data))($scope));
                        t(function () {
                            r.$broadcast(EVENT_PAGE_SUCCESS, $scope.name, $scope.taskId);
                        }, 1, false);
                    }, function () {
                        t(function () {
                            r.$broadcast(EVENT_PAGE_ERROR, $scope.name, $scope.taskId);
                        }, 1, false);
                    });
                }
            }
        };
    }])
    .directive("FluidImageUpload", ["$templateCache", "Upload", function (tc, u) {
        return {
            restrict: "AE",
            template: tc.get("templates/fluid/fluidImageUpload.html"),
            scope: {model: "=", url: "@", auto: "=", onLoad: "&", token: "@", width: "=", height: "="},
            link: function (scope, element, attr) {
                scope.height = 200;
                scope.width = 200;

                if (!scope.auto) {
                    scope.auto = false;
                }

                scope.$watch(function (scope) {
                    return scope.model
                }, function (newModel) {
                    if (newModel) {
                        if (newModel instanceof File) {
                            scope.data = newModel;
                        } else {
                            if (scope.token) {
                                if (newModel.indexOf("?") === -1) {
                                    scope.src = newModel + "?token=" + scope.token;
                                } else {
                                    scope.src = newModel + "&token=" + scope.token;
                                }
                            } else {
                                scope.src = newModel;
                            }
                        }
                    }
                });


                scope.change = function ($files, $file, $event, $rejectedFiles) {
                    0;
                    0;
                    0;
                    0;
                    var file = $file;
                    0;
                    if (file != null) {
                        if (scope.auto) {
                            u.upload({
                                url: scope.url,
                                file: file,
                                fields: {size: file.size}
                            }).success(function (uploadedFile) {
                                if (scope.onLoad) {
                                    scope.onLoad();
                                }
                                scope.model = uploadedFile.id;
                            });
                        } else {
                            scope.model = file;
                        }
                    }
                }


            },
            replace: true
        }
    }]);


function setChildIndexIds(element, taskId, suffix, depth) {
    var children = $(element).children();
    var id = $(element).attr("id");
    if (id) {
        id = id + "{{$index}}tsk" + taskId + "suf" + suffix + "dep" + depth;

    } else {
        id = "grid{{$index}}tsk" + taskId + "suf" + suffix + "dep" + depth;
    }
    ++depth;
    $(element).attr("id", id);
    if (children.length > 0) {
        for (var i = 0; i < children.length; i++) {
            var element = children[i];
            setChildIndexIds(element, taskId, suffix + "_" + i, depth);
        }
    } else {
        return;
    }
}

flowComponents
    .service("flowFrameService", ["flowHttpService", "$timeout", function (f, t) {
        this.isSearch = false;
        this.searchTask = "";
        this.taskUrl = "services/flow_task_service/getTask?name=";
        if (this.taskList === undefined) {
            this.taskList = [];
        }
        this.pushTask = function (task) {
            this.taskList.push(task);
        };
        this.addTask = function (url, origin, newTask) {
            //TODO: remove newTask

            var genericTask = this.createGenericTask();

            genericTask.origin = origin;

            this.taskList.push(genericTask);

            genericTask.index = this.taskList.length - 1;

            genericTask.url = url;

            var index = this.taskList.length - 1;

            if (this.fullScreen) {
                this.toggleFluidscreen();
            }

            t(function () {
                $(".frame-content").scrollTo($("div.box[task]:eq(" + index + ")"), 200);
            }, 300);
        };

        this.toggleSearch = function () {
            this.isSearch = !this.isSearch;
            if (this.isSearch === false) {
                this.searchTask = "";
            }
        };
        this.toggleFullscreen = function (task) {
            this.fullScreen = true;
            this.fullScreenTask = task;
            t(function () {
                $(".frame-content").scrollTop(0);
            });
        };
        this.toggleFluidscreen = function () {
            this.fullScreen = false;
            this.fullScreenTask = undefined;
        };
        this.getFullTask = function (task) {
            0;
            var fullScreenTask = undefined;

            if (task) {
                var fullScreenTask = this.createGenericTask();

                fullScreenTask.url = this.taskUrl + task.name;
                fullScreenTask.size = 100;
                0;
            }

            return fullScreenTask;
        };
        this.createGenericTask = function () {

            var genericTask = Task();

            genericTask.id = "gen_id_";

            var countGeneric = 0;

            angular.forEach(this.taskList, function (task) {
                if ((task.id + "").indexOf("gen_id_") > -1) {
                    countGeneric++;
                }
            });

            genericTask.id = genericTask.id + "" + countGeneric;


            genericTask.size = 50;

            genericTask.active = true;

            genericTask.glyph = "fa fa-tasks";

            genericTask.title = "...";

            genericTask.generic = true;


            return genericTask;
        };
        this.getFrame = function () {
            return $("div.frame-content.frame-fullscreen");
        }
        this.buildTask = function (task) {

            /* Task event */
            task.preLoad = function () {
            };
            task.load = function () {
            };
            task.postLoad = function () {
            }
            task.onWindowClosing = function (page) {
                return true;
            }
            task.onWindowHiding = function (page) {
                return true;
            }
            task.onWindowOpening = function () {
                return true;
            }
            task.onWindowOpened = function () {
            }
            task.onWindowPinned = function (page) {

            }
            task.onWindowActive = function (page) {
            }

            return task;
        }
        this.showActionBar = function () {
            this.actionBarClass = "animated slideInUp";
            this.actionBarShowing = true;
        };
        this.hideActionBar = function () {
            this.actionBarClass = "animated slideOutDown";
            this.actionBarShowing = false;
        };
        return this;

    }])
    .service("flowHttpService", ["$rootScope", "$http", "flowLoaderService", "sessionService", function (rs, h, fl, ss) {
        this.httpSerialKey = new Date().getTime();
        this.post = function (url, data, task) {
            task.loaded = false;
            var promise = null;
            if (this.host) {
                url = this.host + url;
            }
            var headers = {
                "flow-container-id": "_id_fpb_" + task.id,
                "Content-type": "application/json"
            };
            if (task.currentPage) {
                headers.method = "post";
                headers.flowPage = task.currentPage;
            }
            if (data === undefined) {
                promise = h({
                    method: "post",
                    url: url,
                    headers: headers
                });


                promise.success(function (config) {
                    //   $("#_id_fpb_" + task.id).loadingOverlay("remove");
                });

                promise.error(function (data, status, headers, config) {
                    //$("#_id_fpb_" + task.id).loadingOverlay("remove");
                    if (status === 401) {
                        rs.$broadcast("NOT_AUTHENTICATED", data.msg);
                    } else if (status === 403) {
                        rs.$broadcast(EVENT_NOT_ALLOWED + task.id, data.msg);
                    }
                });


                promise.then(function () {
                    task.loaded = true;
                    // $("#_id_fpb_" + task.id).loadingOverlay("remove");
                });

                return promise;
            }
            promise = h({
                method: "post",
                url: url,
                data: data,
                headers: headers
            });
            promise.success(function (config) {
                this.httpSerialKey = new Date().getTime();
            });
            promise.error(function (data, status, headers, config) {
                //  $("#_id_fpb_" + task.id).loadingOverlay("remove");
                if (status === 401) {
                    rs.$broadcast("NOT_AUTHENTICATED");
                } else if (status === 403) {
                    rs.$broadcast("NOT_ALLOWED");
                }
                task.loaded = true;
            });

            promise.then(function () {
                task.loaded = true;
            });

            return promise;
        };
        this.postGlobal = function (url, data) {

            var promise = null;
            if (this.host) {
                url = this.host + url;
            }


            if (data === undefined) {
                promise = h({
                    method: "post",
                    url: url
                });

                return promise;
            }

            promise = h({
                method: "post",
                url: url,
                data: data
            });

            return promise;
        };
        this.put = function (url, data, task) {
            task.loaded = false;
            var promise = null;
            if (this.host) {
                url = this.host + url;
            }

            var headers = {
                "flow-container-id": "_id_fpb_" + task.id,
                "Content-type": "application/json"
            };

            if (task.currentPage) {
                headers.method = "put";
                headers.flowPage = task.currentPage;
            }

            if (data === undefined) {
                promise = h({
                    method: "put",
                    url: url,
                    headers: headers
                });

                promise.success(function (config) {
                    $("#_id_fpb_" + task.id).loadingOverlay("remove");
                });

                promise.error(function (data, status, headers, config) {
                    $("#_id_fpb_" + task.id).loadingOverlay("remove");
                    if (status === 401) {
                        rs.$broadcast("NOT_AUTHENTICATED", data.msg);
                    } else if (status === 403) {
                        rs.$broadcast(EVENT_NOT_ALLOWED + task.id, data.msg);
                    }
                });

                return promise;
            }
            promise = h({
                method: "put",
                url: url,
                data: data,
                headers: headers
            });

            promise.success(function (config) {
                this.httpSerialKey = new Date().getTime();
            });

            promise.error(function (data, status, headers, config) {
                if (status === 401) {
                    rs.$broadcast("NOT_AUTHENTICATED");
                } else if (status === 403) {
                    rs.$broadcast(EVENT_NOT_ALLOWED + task.id, data.msg);
                }
                task.loaded = true;
            });

            promise.then(function () {
                task.loaded = true;
                // $("#_id_fpb_" + task.id).loadingOverlay("remove");
            });


            return promise;
        };
        this.putGlobal = function (url, data) {
            var promise = null;
            if (this.host) {
                url = this.host + url;
            }

            var headers = {"Content-type": "application/json"};


            if (data === undefined) {
                promise = h({
                    method: "put",
                    url: url,
                    headers: headers
                });

                promise.error(function (data, status, headers, config) {
                    if (status === 401) {
                        rs.$broadcast("NOT_AUTHENTICATED", data.msg);
                    }
                });

                return promise;
            }

            promise = h({
                method: "put",
                url: url,
                data: data,
                headers: headers
            });

            promise.error(function (data, status, headers, config) {
                if (status === 401) {
                    rs.$broadcast("NOT_AUTHENTICATED");
                }
                task.loaded = true;
            });

            return promise;
        };
        this.getLocal = function (url) {
            if (this.host) {
                url = this.host + url;
            }
            var promise = h({
                method: "get",
                url: url
            });
            promise.error(function (data, status, headers, config) {
                if (status === 401) {
                    rs.$broadcast("NOT_AUTHENTICATED", data.msg);
                } else if (status === 403) {
                    rs.$broadcast("NOT_ALLOWED", data.msg);
                }
            });

            return promise;
        };
        this.getGlobal = function (url, progress, cache) {

            fl.enabled = progress;

            if (this.host) {
                url = this.host + url;
            }

            var promise = h({
                method: "get",
                url: url
            });

            promise.error(function (data, status, headers, config) {
                if (status === 401) {
                    rs.$broadcast("NOT_AUTHENTICATED", data.msg);
                } else if (status === 403) {
                    rs.$broadcast("NOT_ALLOWED", data.msg);
                }
            });

            return promise;
        };
        this.get = function (url, task) {

            task.loaded = false;

            if (this.host) {
                url = this.host + url;
            }
            var headers = {
                "flow-container-id": "_id_fpb_" + task.id,
                "Content-type": "application/json"
            };

            if (task.currentPage) {
                headers.method = "get";
                headers.flowPage = task.currentPage;
            }


            var key = url + this.httpSerialKey;

            var sessionValue = ss.getSessionProperty(key);

            0;

            var promise = h({
                method: "get",
                url: url,
                headers: headers
            });

            promise.error(function (data, status, headers, config) {
                if (status === 401) {
                    rs.$broadcast("NOT_AUTHENTICATED", data.msg);
                } else if (status === 403) {
                    rs.$broadcast(EVENT_NOT_ALLOWED + task.id, data.msg);
                }

            });

            promise.then(function () {
                task.loaded = true;
            });

            promise.success(function (data, status, headers, config, statusText) {
                var response = {};
                response.data = data;
                response.status = status;
                response.headers = headers;
                response.config = config;
                response.statusText = statusText;
                ss.addSessionProperty(key, response);
                0;
                0;
            });

            return promise;


        };
        this.delete = function (url, task) {
            task.loaded = false;
            if (this.host) {
                url = this.host + url;
            }
            var headers = {"flow-container-id": "_id_fpb_" + task.id, "Content-type": "application/json"};

            if (task.currentPage) {
                headers.method = "delete";
                headers.flowPage = task.currentPage;
            }
            var promise = null;

            promise = h({
                method: "delete",
                url: url,
                headers: headers
            });

            promise.success(function (config) {
                //   $("#_id_fpb_" + task.id).loadingOverlay("remove");
            });

            promise.error(function (data, status, headers, config) {
                //  $("#_id_fpb_" + task.id).loadingOverlay("remove");
                if (status === 401) {
                    rs.$broadcast("NOT_AUTHENTICATED", data.msg);
                } else if (status === 403) {
                    rs.$broadcast(EVENT_NOT_ALLOWED + task.id, data.msg);
                }
                task.loaded = true;
            });

            promise.then(function () {
                task.loaded = true;
                //$("#_id_fpb_" + task.id).loadingOverlay("remove");
            });

            return promise;
        };
        this.headers = function (task) {
            return {"flow-container-id": "_id_fpb_" + task.id, "Content-type": "application/json"};
        };
        this.query = function (query, task) {

            if (task) {
                task.loaded = false;
            }

            var promise = h(query);

            promise.error(function (data, status, headers, config) {
                if (task) {
                    task.loaded = true;
                }
                if (status === 401) {
                    rs.$broadcast("NOT_AUTHENTICATED");
                } else if (status === 403) {
                    rs.$broadcast(EVENT_NOT_ALLOWED + task.id, data.msg);
                }
            });


            promise.then(function () {
                if (task) {
                    task.loaded = true;
                }
            });


            return promise;
        };

        return this;

    }])
    .service("flowControlService", [function () {

        this.controls = [];

        return this;
    }])
    .service("flowMessageService", ["$timeout", function (t) {
        var flowMessageService = {};

        flowMessageService.duration = 1000;

        flowMessageService.info = function (id, message, duration) {
            flowMessageService.id = id;
            flowMessageService.message = message;
            flowMessageService.alertType = "alert alert-info";
            flowMessageService.duration = duration;
            return flowMessageService;
        };

        flowMessageService.warning = function (id, message, duration) {
            flowMessageService.id = id;
            flowMessageService.message = message;
            flowMessageService.alertType = "alert alert-warning";
            flowMessageService.duration = duration;
            return flowMessageService;
        };

        flowMessageService.danger = function (id, message, duration) {
            flowMessageService.id = id;
            flowMessageService.message = message;
            flowMessageService.alertType = "alert alert-danger";
            flowMessageService.duration = duration;
            return flowMessageService;
        };

        flowMessageService.success = function (id, message, duration) {
            flowMessageService.id = id;
            flowMessageService.message = message;
            flowMessageService.alertType = "alert alert-success";
            flowMessageService.duration = duration;
            return flowMessageService;
        };

        flowMessageService.open = function () {
            var messageId = "#" + flowMessageService.id;

            var alerts = $(messageId).find("div[flow-msg]").get();

            var index = 0;
            if (alerts) {
                index = alerts.length;
            }

            var alertContainer = $(messageId).get();
            var alert = $("<div>").attr("flow-msg", index).addClass("animated pulse anim-dur").addClass(flowMessageService.alertType).appendTo(alertContainer).get();

            $("<button>").attr("type", "button").addClass("close icon-cross").attr("data-dismiss", "alert").appendTo(alert).get();

            $("<span>").html(flowMessageService.message).appendTo(alert);

            t(function () {
                $(alert).remove();
            }, flowMessageService.duration);
        };

        flowMessageService.close = function (messageId) {
            $(messageId).find("p").html("");
            $(messageId).removeClass(flowMessageService.alertType);
            $(messageId).alert('close');
        };

        return flowMessageService;
    }])
    .service("flowModalService", [function () {
        var flowModalService = {};

        flowModalService.show = function (id) {
            /* $("#" + id).removeClass("hidden");*/
            $("#" + id).modal("show");
            $(".frame-content").scrollTo($("#" + id), 800);
        };

        flowModalService.hide = function (id, sourceId) {
            $("#" + id).modal("hide");
            if (sourceId) {
                $(".frame-content").scrollTo($("#" + sourceId), 800);
            }
        };

        return flowModalService;
    }])
    .service("flowLoaderService", [function () {
        this.loaded = true;
        this.enabled = true;
        return this;
    }])
    .service("sessionService", ["localStorageService", function (ls) {

        this.isSessionSupported = ls.isSupported;

        this.type = function () {
            return this.isSessionSupported ? "session storage" : "cookie storage";
        }

        this.isSessionOpened = function () {
            return ls.get(AUTHORIZATION) !== null;
        }


        this.containsKey = function (key) {
            return !(!this.getSessionProperty(key));
        }

        this.addSessionProperty = function (key, value) {
            if (this.isSessionSupported) {
                ls.set(key, value);
            } else {
                ls.cookie.set(key, value);
            }
        }

        this.getSessionProperty = function (key) {
            if (this.isSessionSupported) {
                return ls.get(key);
            } else {
                return ls.cookie.get(key);
            }
        };

        this.login = function (username, password, remember) {
            var base64 = window.btoa(username + ":" + password);
            this.addSessionProperty("remember", remember);
            this.addSessionProperty(AUTHORIZATION, "Basic " + base64);
        };

        this.createSession = function (base64) {
            this.addSessionProperty(AUTHORIZATION, "Basic " + base64);
        };

        this.removeSessionProperty = function (key) {
            if (this.isSessionSupported) {
                return ls.remove(key);
            } else {
                return ls.cookie.remove(key);
            }
        };

        this.logout = function () {
            if (this.isSessionSupported) {
                ls.clearAll();
            } else {
                ls.cookie.clearAll();
            }
        }


    }]);

flowComponents
    .factory("flowInjector", ["$q", "$rootScope", "sessionService", "flowLoaderService", "responseEvent", function (q, rs, ss, fls, r) {

        return {
            "request": function (config) {
                if (fls.enabled) {
                    fls.loaded = false;
                }
                config.headers["Access-Control-Allow-Origin"] = "*";
                /*


                 console.debug("request-config", config);
                 if (config.headers['flow-container-id'] !== undefined) {
                 // $('#' + config.headers['flow-container-id']).loadingOverlay();
                 }
                 /!*  if (ss.isSessionOpened()) {
                 config.headers['Authorization'] = ss.getSessionProperty(AUTHORIZATION);
                 }*!/*/
                return config;
            },
            "requestError": function (rejection) {
                fls.loaded = true;
                fls.enabled = true;
                return q.reject(rejection);
            },
            "response": function (response) {
                fls.loaded = true;
                fls.enabled = true;
                r.callEvent(response);
                return response;
            },
            "responseError": function (rejection) {
                fls.loaded = true;
                fls.enabled = true;
                return q.reject(rejection);
            }
        };
    }])
    .factory("responseEvent", ["$location", "$rootScope", function (l, rs) {

        var responseEvent = {};
        responseEvent.responses = [];
        responseEvent.addResponse = function (evt, statusCode, redirect, path) {

            responseEvent.responses.push({
                "evt": evt,
                "statusCode": statusCode,
                "redirect": redirect,
                "path": path
            });

        }

        responseEvent.callEvent = function (res) {

            angular.forEach(responseEvent.responses, function (response) {
                if (response.statusCode === res.statusCode) {
                    if (response.evt) {
                        rs.$broadcast(response.evt, response.data, response.statusText);
                    } else if (response.redirect) {
                        l.path(response.path);
                    }

                }
            });
        }

        return responseEvent;

    }]);


/**Prototypes**/
function Task() {
    var task = {};

    task.id = undefined;

    task.glyph = undefined;

    task.title = undefined;

    task.active = undefined;

    task.size = undefined;

    task.pinned = undefined;

    task.locked = undefined;

    this.url = undefined;

    return task;
}

function Control() {
    var control = {};
    control.id = undefined;
    control.glyph = undefined;
    control.label = undefined;
    control.disabled = undefined;
    return control;
}


var eventInterceptorId = "event_interceptor_id_";
var goToEventID = "event_got_id_";
var EVENT_NOT_ALLOWED = "not_allowed_";
var AUTHORIZATION = "authorization";

function estimateHeight(height) {
    var _pc = window.innerWidth <= 768 ? 100 : 50;
    /*var _pc = height >= 768 ? height * 0.055 : height <= 768 && height > 600 ? height * 0.065 : height <= 600 && height > 400 ? height * 0.09 : height * 0.15;*/
    return height - _pc
}


function generateTask(scope, t, f2) {
    0;
    scope.task.pageLoaded = false;
    if (scope.task.page === undefined || scope.task.page === null) {
        if (scope.task.pages) {
            var $page = getHomePageFromTaskPages(scope.task);
            scope.task.page = $page.page;
            scope.homeUrl = $page.page.get;
            scope.home = $page.page.name;
            scope.task.navPages = [$page.page];
            0;
        }
    } else {
        scope.homeUrl = scope.task.page.get;
        scope.task.page.param = scope.task.pageParam;
        var page = scope.task.page;

        if (scope.task.page.isHome === false) {
            if (scope.task.pages) {
                var $page = getHomePageFromTaskPages(scope.task);
                scope.home = $page.page.name;
                scope.task.navPages = [$page.page];
            }
        } else {
            scope.task.navPages = [page];
        }

        if (scope.task.page.param && scope.task.page.param !== "null") {
            scope.homeUrl = scope.task.page.get + scope.task.page.param;
            0;
        }

        if (scope.task.navPages.indexOf(page) > -1) {
            scope.currentPageIndex = getPageIndexFromPages(scope.task.page.name, scope.task.navPages).index;
        } else {
            scope.task.navPages.push(page);
            scope.currentPageIndex = scope.task.navPages.length - 1;
        }

        for (var i = 0; i < scope.task.toolbars.length; i++) {
            if (scope.task.toolbars[i].id === 'back') {
                scope.task.toolbars[i].disabled = !(scope.currentPageIndex > 0);
            }
            if (scope.task.toolbars[i].id === 'forward') {
                scope.task.toolbars[i].disabled = !(scope.currentPageIndex < scope.task.navPages.length - 1);
            }
        }
    }

    scope.userTask.flowId = scope.task.flowId;
    0;
    var loadGetFn = function () {
        scope.loadGet();

    };


    t(loadGetFn, 500);
}
function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
};/**
 * Created by Jerico on 11/16/2014.
 */


var monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday',
    'Thursday', 'Friday', 'Saturday'];

var VIEWER_PATH = "ViewerJS/#../"

var REG_NUM = /^[0-9]+$/;

function SaveControl() {
    var saveControl = new Control();

    saveControl.label = "Save";
    saveControl.disabled = false;
    saveControl.glyph = "glyphicon glyphicon-floppy-save";
    saveControl.uiType = "info";
    return saveControl;
}

function CreateControl() {
    var createControl = new Control();
    createControl.label = "New";
    createControl.disabled = false;
    createControl.glyph = "glyphicon glyphicon-plus";
    createControl.uiType = "info";
    return createControl;

}

function DeleteControl() {
    var deleteControl = new Control();
    deleteControl.label = "Delete";
    deleteControl.disabled = false;
    deleteControl.glyph = "glyphicon glyphicon-floppy-remove";
    deleteControl.uiType = "danger";
    return deleteControl;
}

function CopyControl() {
    var copyControl = new Control();
    copyControl.label = "Copy";
    copyControl.disabled = false;
    copyControl.glyph = "glyphicon glyphicon-floppy-remove";
    copyControl.uiType = "info";
    return copyControl;
}

function FlowOptionsGET(dto, url, scope, compile, sessionService) {
    var headers = {
        Authorization: "bearer " + sessionService.getSessionProperty("token"),
        method: "get",
        flowPage: scope.task.page.name
    };
    0;
    0;
    return new dto.newOptions()
        .withOption("ajax", {
            url: url,
            type: "GET",
            headers: headers,
            cache: true,
            crossDomain: true,
            global: false,
            beforeSend: function () {
                if (scope.task) {
                    scope.task.loaded = false;
                }
            },
            complete: function () {
                if (scope.task) {
                    scope.task.loaded = true;
                }
            }
        })
        .withDataProp('data')
        .withOption("createdRow", function (row) {
            if (scope && compile) {
                0;
                0;
                compile(angular.element($(row).find('td div.actions')).contents())(scope);
            }
        })
        .withOption("autoWidth", true)
        .withOption("info", true)
        .withOption("processing", true)
        .withOption("sDom", "<'top'iflp<'clear'>>rt<'bottom'iflp<'clear'>>")
        .withOption("stateSave", true)
        .withOption("serverSide", true)
        .withTableTools("swf/copy_csv_xls_pdf.swf")
        .withTableToolsOption("sRowSelect", "os")
        .withTableToolsButtons([
            "copy" /*,{
             "sExtends": "collection",
             "sButtonText": "Edit",
             "aButtons": ["select_all", "select_none"]
             } TODO: report-api flow-service{
             "sExtends": "collection",
             "sButtonText": "Save",
             "aButtons": ["csv", "xls", "pdf"]
             }*/
            , {
                "sExtends": "collection",
                "sButtonText": "Print",
                "aButtons": [{
                    "sExtends": "text",
                    "bShowAll": true,
                    "sButtonText": "All",
                    "fnClick": function (nButton, oConfig, oFlash) {
                        scope.task.flowHttpService.query({
                            method: "get",
                            data: "",
                            url: url + "/report_list",
                            transformResponse: []
                        }, scope.task)
                            .success(function (data) {
                                0;
                                $(data).print({globalStyles: true});
                            });
                    }
                }]
            }
        ])
        .withColVis()
        .withColVisOption('aiExclude', [0])
        .withColVisOption("buttonText", "Columns")
        .withPaginationType('simple_numbers');
}


function FlowOptionGETv2(dto, options) {

    return dto.fromFnPromise(
        function () {
            return options.promise;
        })
        .withOption("autoWidth", true)
        .withOption("info", true)
        .withOption("processing", true)
        .withOption('responsive', true)
        .withOption("sDom", "<'top'iflp<'clear'>>rt<'bottom'iflp<'clear'>>")
        .withOption("stateSave", true);
}


function FlowColumns(dtc, editMethod, deleteMethod, viewMethod) {
    return [dtc.newColumn(null).withTitle('Actions').notSortable().withOption("searchable", false)
        .renderWith(function (data, type, full, meta) {
            return renderActions(data, editMethod, deleteMethod, viewMethod);
        })]
}

function renderCheckbox(data) {
    var span = "text-primary fa fa-square-o";
    if (data) {
        span = "text-success fa fa-check-square-o";
    }
    return "<p class='text-primary'><span class='" + span + "'></span></p>"
}
function renderActions(data, editMethod, deleteMethod, viewMethod) {
    var edit = "edit";
    var del = "delete";
    var view = "view";

    if (viewMethod != undefined) {
        view = viewMethod;
    }

    if (editMethod !== undefined) {
        edit = editMethod;
    }

    if (deleteMethod !== undefined) {
        del = deleteMethod;
    }


    return "<div class='actions btn-group btn-group-md'>" +
        "<button ng-if=" + view + " flow-permission-visible title='View' task='task' page='task.page' method='put'  type='button' class='btn btn-warning glyphicon glyphicon-search field-margin' ng-click='" + view + "(" + JSON.stringify(data) + ")'></button>" +
        "<button flow-permission-visible title='Edit' task='task' page='task.page' method='put'  type='button' class='btn btn-info glyphicon glyphicon-edit field-margin' ng-click='" + edit + "(" + data.id + ")'></button>" +
        "<button flow-permission-visible title='Delete' task='task' page='task.page' method='delete' type='button' class='btn btn-danger glyphicon glyphicon-trash field-margin' ng-click='" + del + "(" + data.id + ")'> </button></div>";
}


function renderMonth(data, filter) {
    return "<span>" + filter('date')(data, 'MMMM') + "</span>";
}


function renderDate(data, filter) {
    return "<span>" + filter('date')(data, 'medium') + "</span>";
}


function renderDateSmall(data, filter) {
    return "<span>" + filter('date')(data, 'MM/dd/yyyy') + "</span>";
}

function getPageFromTaskPages(name, task) {

}

function getHomePageFromTaskPages(task) {
    var $page = {};

    angular.forEach(task.pages, function (page, key) {
        if (page.isHome) {
            this.page = page;
            this.index = key;
        }
    }, $page);

    return $page;
}

function getPageIndexFromTaskPages(name, task) {
    var $index = -1;
    angular.forEach(task.pages, function (page, key) {
        if (page.name === name) {
            this.index = key;
        }
    }, $index);

    return $index;
}

function getPageIndexFromPages(name, pages) {
    var $index = -1;
    angular.forEach(pages, function (page, key) {
        if (page != null) {
            if (page.name === name) {
                this.index = key;
            }
        }

    }, $index);
    return $index;
}


/*UI Messages factory*/
var UI_MESSAGE_NO_CHANGE = "No change has been made.";


function getMarketSegment(marketPotential) {

    if (marketPotential === undefined || marketPotential === 0) {
        return undefined;
    }

    var marketSegment = undefined;

    if (marketPotential >= 18000) {
        marketSegment = "HMP";
    } else if (marketPotential < 18000 && marketPotential > 8000) {
        marketSegment = "MMP1";
    } else if (marketPotential <= 8000 && marketPotential >= 4000) {
        marketSegment = "MMP2";
    } else if (marketPotential < 4000 && marketPotential >= 1400) {
        marketSegment = "LMP1";
    } else if (marketPotential < 1400) {
        marketSegment = "LMP2";
    }

    return marketSegment;
}


function getFirstMonday(date) {
    date.setDate(1);
    while (date.getDay() !== 1) {
        date.setDate(date.getDate() + 1);
    }

    return date;
}


function getWeekOfMonth(date) {

    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday',
            'Thursday', 'Friday', 'Saturday'],
        prefixes = ['1', '2', '3', '4', '5'];

    return prefixes[0 | date.getDate() / 7];

}

function getDayName(dayOfWeek) {
    var di = dayOfWeek - 1;
    return days[di];
}

function isPastMonthDay(date, firstMondayDate) {
    if (date.getDate() < firstMondayDate.getDate()) {
        return true;
    }

    return false;
}

function isDayEnabled(dayDate, currentDate) {
    var enabled = undefined;
    if (currentDate.getMonth() === 0 && dayDate.getMonth() === 11) {
        /*for January and December*/
        enabled = false;
    } else if (currentDate.getMonth() === 11 && dayDate.getMonth() === 0) {
        enabled = true;
    }
    else if (dayDate.getMonth() < currentDate.getMonth()) {
        enabled = false;
    } else if (dayDate.getMonth() > currentDate.getMonth()) {
        enabled = true;
    } else {
        var firstMondayDate = getFirstMonday(currentDate);
        if (isPastMonthDay(dayDate, firstMondayDate)) {
            enabled = false;
        } else {
            enabled = true;
        }
    }

    return enabled;
}
;/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


angular.module("home", ["flowServices", "fluid", "flowFactories", "war.session"])
    .controller("homeCtrl", function ($scope, sessionService, $http, flowMessageService, flowFrameService, flowHttpService, $timeout, userProfile, UserFactory) {
        $scope.userProfile = userProfile;
        $scope.flowFrameService = flowFrameService;
        $scope.taskbar = {};
        $scope.taskbar.getExcessCount = function (limit) {
            return $scope.flowFrameService.taskList.length - limit;
        };
        $scope.taskbar.open = function (task) {
            0;
            0;
            if (flowFrameService.fullScreen) {
                flowFrameService.fullScreenTask = task;
            } else {
                if (task.active === true) {
                    $(".frame-content").scrollTo($("#_id_fp_" + task.id), 800);
                } else {
                    task.active = true;
                    if (task.id.indexOf("gen") === -1) {
                        $scope.userTask = {};
                        $scope.userTask.flowTaskId = task.id.split("_")[0];
                        $scope.userTask.active = task.active;
                        $scope.userTask.flowId = task.flowId;
                        flowHttpService.post("services/flow_user_task_crud/save_task_state?field=active", $scope.userTask, task);

                    }
                }
            }


        };
        $scope.taskbar.close = function (task, index) {
            var userTask = {};
            userTask.closed = true;
            userTask.flowTaskId = task.id.split("_")[0];
            userTask.flowId = task.flowId;
            flowHttpService.post("services/flow_user_task_crud/save_task_state?field=close", userTask, task);
            flowFrameService.taskList.splice(index, 1);
        };
        $scope.taskbar.hide = function (task) {
            task.active = false;
            var userTask = {};
            userTask.active = false;
            userTask.flowTaskId = task.id.split("_")[0];
            userTask.flowId = task.flowId;
            flowHttpService.post("services/flow_user_task_crud/save_task_state?field=close", userTask, task);
        };
        $scope.logout = function () {
            flowHttpService.postGlobal("services/logout_service/logoff")
                .success(function () {
                    UserFactory.logout();
                });
        };
        $scope.$on("NOT_AUTHENTICATED", function (event, msg) {
            window.location = "signin.html";
            flowMessageService.danger("mainMessage", msg, 2000);
        });
        $scope.editProfile = function () {
            flowFrameService.addTask($scope.userProfile.editTaskUrl);
        }
    })
    .controller("signinCtrl", function ($scope, $http, sessionService, flowMessageService, userSessionService, HOST, REX_VERSION, UserFactory) {

        $scope.ver = REX_VERSION;

        $scope.login = function (user) {

            UserFactory.login(user)
                .success(function (data) {
                    window.location = "home.html";
                }).error(function (data) {
                    flowMessageService.danger("loginMessage", data, 3000).open();
                });
        }
    })
    .controller("indexCtrl", function (sessionService, UserFactory) {
        if (UserFactory.isAuthenticated()) {
            window.location = "home.html";
        } else {
            window.location = "signin.html";
        }

    });

;/**
 * Timeago is a jQuery plugin that makes it easy to support automatically
 * updating fuzzy timestamps (e.g. "4 minutes ago" or "about 1 day ago").
 *
 * @name timeago
 * @version 1.4.1
 * @requires jQuery v1.2.3+
 * @author Ryan McGeary
 * @license MIT License - http://www.opensource.org/licenses/mit-license.php
 *
 * For usage and examples, visit:
 * http://timeago.yarp.com/
 *
 * Copyright (c) 2008-2013, Ryan McGeary (ryan -[at]- mcgeary [*dot*] org)
 */

(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery'], factory);
  } else {
    // Browser globals
    factory(jQuery);
  }
}(function ($) {
  $.timeago = function(timestamp) {
    if (timestamp instanceof Date) {
      return inWords(timestamp);
    } else if (typeof timestamp === "string") {
      return inWords($.timeago.parse(timestamp));
    } else if (typeof timestamp === "number") {
      return inWords(new Date(timestamp));
    } else {
      return inWords($.timeago.datetime(timestamp));
    }
  };
  var $t = $.timeago;

  $.extend($.timeago, {
    settings: {
      refreshMillis: 60000,
      allowPast: true,
      allowFuture: false,
      localeTitle: false,
      cutoff: 0,
      strings: {
        prefixAgo: null,
        prefixFromNow: null,
        suffixAgo: "ago",
        suffixFromNow: "from now",
        inPast: 'any moment now',
        seconds: "less than a minute",
        minute: "about a minute",
        minutes: "%d minutes",
        hour: "about an hour",
        hours: "about %d hours",
        day: "a day",
        days: "%d days",
        month: "about a month",
        months: "%d months",
        year: "about a year",
        years: "%d years",
        wordSeparator: " ",
        numbers: []
      }
    },

    inWords: function(distanceMillis) {
      if(!this.settings.allowPast && ! this.settings.allowFuture) {
          throw 'timeago allowPast and allowFuture settings can not both be set to false.';
      }

      var $l = this.settings.strings;
      var prefix = $l.prefixAgo;
      var suffix = $l.suffixAgo;
      if (this.settings.allowFuture) {
        if (distanceMillis < 0) {
          prefix = $l.prefixFromNow;
          suffix = $l.suffixFromNow;
        }
      }

      if(!this.settings.allowPast && distanceMillis >= 0) {
        return this.settings.strings.inPast;
      }

      var seconds = Math.abs(distanceMillis) / 1000;
      var minutes = seconds / 60;
      var hours = minutes / 60;
      var days = hours / 24;
      var years = days / 365;

      function substitute(stringOrFunction, number) {
        var string = $.isFunction(stringOrFunction) ? stringOrFunction(number, distanceMillis) : stringOrFunction;
        var value = ($l.numbers && $l.numbers[number]) || number;
        return string.replace(/%d/i, value);
      }

      var words = seconds < 45 && substitute($l.seconds, Math.round(seconds)) ||
        seconds < 90 && substitute($l.minute, 1) ||
        minutes < 45 && substitute($l.minutes, Math.round(minutes)) ||
        minutes < 90 && substitute($l.hour, 1) ||
        hours < 24 && substitute($l.hours, Math.round(hours)) ||
        hours < 42 && substitute($l.day, 1) ||
        days < 30 && substitute($l.days, Math.round(days)) ||
        days < 45 && substitute($l.month, 1) ||
        days < 365 && substitute($l.months, Math.round(days / 30)) ||
        years < 1.5 && substitute($l.year, 1) ||
        substitute($l.years, Math.round(years));

      var separator = $l.wordSeparator || "";
      if ($l.wordSeparator === undefined) { separator = " "; }
      return $.trim([prefix, words, suffix].join(separator));
    },

    parse: function(iso8601) {
      var s = $.trim(iso8601);
      s = s.replace(/\.\d+/,""); // remove milliseconds
      s = s.replace(/-/,"/").replace(/-/,"/");
      s = s.replace(/T/," ").replace(/Z/," UTC");
      s = s.replace(/([\+\-]\d\d)\:?(\d\d)/," $1$2"); // -04:00 -> -0400
      s = s.replace(/([\+\-]\d\d)$/," $100"); // +09 -> +0900
      return new Date(s);
    },
    datetime: function(elem) {
      var iso8601 = $t.isTime(elem) ? $(elem).attr("datetime") : $(elem).attr("title");
      return $t.parse(iso8601);
    },
    isTime: function(elem) {
      // jQuery's `is()` doesn't play well with HTML5 in IE
      return $(elem).get(0).tagName.toLowerCase() === "time"; // $(elem).is("time");
    }
  });

  // functions that can be called via $(el).timeago('action')
  // init is default when no action is given
  // functions are called with context of a single element
  var functions = {
    init: function(){
      var refresh_el = $.proxy(refresh, this);
      refresh_el();
      var $s = $t.settings;
      if ($s.refreshMillis > 0) {
        this._timeagoInterval = setInterval(refresh_el, $s.refreshMillis);
      }
    },
    update: function(time){
      var parsedTime = $t.parse(time);
      $(this).data('timeago', { datetime: parsedTime });
      if($t.settings.localeTitle) $(this).attr("title", parsedTime.toLocaleString());
      refresh.apply(this);
    },
    updateFromDOM: function(){
      $(this).data('timeago', { datetime: $t.parse( $t.isTime(this) ? $(this).attr("datetime") : $(this).attr("title") ) });
      refresh.apply(this);
    },
    dispose: function () {
      if (this._timeagoInterval) {
        window.clearInterval(this._timeagoInterval);
        this._timeagoInterval = null;
      }
    }
  };

  $.fn.timeago = function(action, options) {
    var fn = action ? functions[action] : functions.init;
    if(!fn){
      throw new Error("Unknown function name '"+ action +"' for timeago");
    }
    // each over objects here and call the requested function
    this.each(function(){
      fn.call(this, options);
    });
    return this;
  };

  function refresh() {
    //check if it's still visible
    if(!$.contains(document.documentElement,this)){
      //stop if it has been removed
      $(this).timeago("dispose");
      return this;
    }

    var data = prepareData(this);
    var $s = $t.settings;

    if (!isNaN(data.datetime)) {
      if ( $s.cutoff == 0 || Math.abs(distance(data.datetime)) < $s.cutoff) {
        $(this).text(inWords(data.datetime));
      }
    }
    return this;
  }

  function prepareData(element) {
    element = $(element);
    if (!element.data("timeago")) {
      element.data("timeago", { datetime: $t.datetime(element) });
      var text = $.trim(element.text());
      if ($t.settings.localeTitle) {
        element.attr("title", element.data('timeago').datetime.toLocaleString());
      } else if (text.length > 0 && !($t.isTime(element) && element.attr("title"))) {
        element.attr("title", text);
      }
    }
    return element.data("timeago");
  }

  function inWords(date) {
    return $t.inWords(distance(date));
  }

  function distance(date) {
    return (new Date().getTime() - date.getTime());
  }

  // fix for IE6 suckage
  document.createElement("abbr");
  document.createElement("time");
}));
;"use strict";
var App = angular.module('MAdmin', ['ui.bootstrap', 'fluid', 'flowServices']);

App.controller('AppController', function ($scope, $rootScope, $location, userAppSetting, sessionService, userProfile) {

    $scope.data = {};
    $scope.effect = '';
    $scope.header = {
        form: false,
        chat: false,
        theme: false,
        footer: true,
        history: false,
        animation: '',
        boxed: '',
        layout_menu: '',
        theme_style: "style2",
        header_topbar: 'header-fixed',
        menu_style: userAppSetting.menu,
        menu_collapse: (userAppSetting.hideMenu ? 'sidebar-collapsed' : ''),
        layout_horizontal_menu: '',
        toggle: function (k) {
            switch (k) {
                case 'chat':
                    $scope.header.chat = !$scope.header.chat;
                    break;
                case 'form':
                    $scope.header.form = !$scope.header.form;
                    break;
                case 'sitebar':
                    $scope.header.menu_style = $scope.header.menu_style ? '' : (($scope.header.layout_menu === '') ? 'sidebar-collapsed' : 'right-side-collapsed');
                    break;
                case 'theme':
                    $scope.header.theme = !$scope.header.theme;
                    break;
                case 'history':
                    $scope.header.history = !$scope.header.history;
                    break;
            }
        },
        collapse: function (c) {
            if (c === 'change') {
                $scope.header.menu_collapse = '';
                userAppSetting.menu = $scope.header.menu_style;
                userAppSetting.updateSetting("menu");
            } else if (c === "k") {
                $scope.header.menu_collapse = $scope.header.menu_collapse ? '' : 'sidebar-collapsed';
                $scope.header.menu_style = userAppSetting.menu;
                userAppSetting.hideMenu = ($scope.header.menu_collapse === 'sidebar-collapsed');
                userAppSetting.updateSetting("hideMenu");
            } else {
                if ($scope.header.menu_style) {
                    $scope.header.menu_style = '';
                    $scope.header.menu_collapse = $scope.header.menu_collapse ? '' : 'sidebar-collapsed';
                } else {
                    $scope.header.menu_collapse = $scope.header.menu_collapse ? '' : 'sidebar-collapsed';
                    $scope.header.menu_style = userAppSetting.menu;
                }
            }

        }
    };
    $rootScope.userProfile = userProfile;

    $scope.$watch(function (scope) {
        return sessionService.isSessionOpened();
    }, function (session) {
        if (session) {
            userAppSetting.
                createAppSetting()
                .success(function (data) {
                    if (data.menu) {
                        userAppSetting.menu = data.menu;
                    }
                    if (data.theme) {
                        userAppSetting.theme = data.theme;
                    }
                    if (data.bgColor) {
                        userAppSetting.bgColor = data.bgColor;
                    }
                    if (data.hideMenu) {
                        userAppSetting.hideMenu = data.hideMenu;
                    }
                    $rootScope.theme = userAppSetting.theme;
                    $scope.header.menu_style = userAppSetting.menu;
                    $scope.header.menu_collapse = (userAppSetting.hideMenu ? 'sidebar-collapsed' : '');
                    0;
                });
        }
    });


    $scope.style_change = function () {
        $rootScope.style = $scope.header.theme_style;
        userAppSetting.style = $scope.header.theme_style;
        userAppSetting.updateSetting("style");

    };

    $scope.theme_change = function (t) {
        $rootScope.theme = t;
        userAppSetting.theme = t;
        userAppSetting.updateSetting("theme");
    };

    $(window).scroll(function () {
        if ($(this).scrollTop() > 0) {
            $('.quick-sidebar').css('top', '0');
        } else {
            $('.quick-sidebar').css('top', '50px');
        }
    });
    $('.quick-sidebar > .header-quick-sidebar').slimScroll({
        "height": $(window).height() - 50,
        'width': '280px',
        "wheelStep": 30
    });
    $('#news-ticker-close').click(function (e) {
        $('.news-ticker').remove();
    });

});
(function ($, window, undefined) {
    'use strict';
    var name = 'stickyTableHeaders';
    var defaults = {
        fixedOffset: 0
    };

    function Plugin(el, options) {
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;

        // Access to jQuery and DOM versions of element
        base.$el = $(el);
        base.el = el;

        // Listen for destroyed, call teardown
        base.$el.bind('destroyed',
            $.proxy(base.teardown, base));

        // Cache DOM refs for performance reasons
        base.$window = $(window);
        base.$clonedHeader = null;
        base.$originalHeader = null;

        // Keep track of state
        base.isSticky = false;
        base.leftOffset = null;
        base.topOffset = null;

        base.init = function () {
            base.options = $.extend({}, defaults, options);

            base.$el.each(function () {
                var $this = $(this);

                // remove padding on <table> to fix issue #7
                $this.css('padding', 0);

                base.$originalHeader = $('thead:first', this);
                base.$clonedHeader = base.$originalHeader.clone();

                base.$clonedHeader.addClass('tableFloatingHeader');
                base.$clonedHeader.css('display', 'none');

                base.$originalHeader.addClass('tableFloatingHeaderOriginal');

                base.$originalHeader.after(base.$clonedHeader);

                base.$printStyle = $('<style type="text/css" media="print">' +
                    '.tableFloatingHeader{display:none !important;}' +
                    '.tableFloatingHeaderOriginal{position:static !important;}' +
                    '</style>');
                $('head').append(base.$printStyle);
            });

            base.updateWidth();
            base.toggleHeaders();

            base.bind();
        };

        base.destroy = function () {
            base.$el.unbind('destroyed', base.teardown);
            base.teardown();
        };

        base.teardown = function () {
            if (base.isSticky) {
                base.$originalHeader.css('position', 'static');
            }
            $.removeData(base.el, 'plugin_' + name);
            base.unbind();

            base.$clonedHeader.remove();
            base.$originalHeader.removeClass('tableFloatingHeaderOriginal');
            base.$originalHeader.css('visibility', 'visible');
            base.$printStyle.remove();

            base.el = null;
            base.$el = null;
        };

        base.bind = function () {
            base.$window.on('scroll.' + name, base.toggleHeaders);
            base.$window.on('resize.' + name, base.toggleHeaders);
            base.$window.on('resize.' + name, base.updateWidth);
        };

        base.unbind = function () {
            // unbind window events by specifying handle so we don't remove too much
            base.$window.off('.' + name, base.toggleHeaders);
            base.$window.off('.' + name, base.updateWidth);
            base.$el.off('.' + name);
            base.$el.find('*').off('.' + name);
        };

        base.toggleHeaders = function () {
            base.$el.each(function () {
                var $this = $(this);

                var newTopOffset = isNaN(base.options.fixedOffset) ?
                    base.options.fixedOffset.height() : base.options.fixedOffset;

                var offset = $this.offset();
                var scrollTop = base.$window.scrollTop() + newTopOffset;
                var scrollLeft = base.$window.scrollLeft();

                if ((scrollTop > offset.top) && (scrollTop < offset.top + $this.height() - base.$clonedHeader.height())) {
                    var newLeft = offset.left - scrollLeft;
                    if (base.isSticky && (newLeft === base.leftOffset) && (newTopOffset === base.topOffset)) {
                        return;
                    }

                    base.$originalHeader.css({
                        'position': 'fixed',
                        'top': newTopOffset,
                        'margin-top': 0,
                        'left': newLeft,
                        'z-index': 1 // #18: opacity bug
                    });
                    base.$clonedHeader.css('display', '');
                    base.isSticky = true;
                    base.leftOffset = newLeft;
                    base.topOffset = newTopOffset;

                    // make sure the width is correct: the user might have resized the browser while in static mode
                    base.updateWidth();
                }
                else if (base.isSticky) {
                    base.$originalHeader.css('position', 'static');
                    base.$clonedHeader.css('display', 'none');
                    base.isSticky = false;
                }
            });
        };

        base.updateWidth = function () {
            if (!base.isSticky) {
                return;
            }
            // Copy cell widths from clone
            var $origHeaders = $('th,td', base.$originalHeader);
            $('th,td', base.$clonedHeader).each(function (index) {

                var width, $this = $(this);

                if ($this.css('box-sizing') === 'border-box') {
                    width = $this.outerWidth(); // #39: border-box bug
                } else {
                    width = $this.width();
                }

                $origHeaders.eq(index).css({
                    'min-width': width,
                    'max-width': width
                });
            });

            // Copy row width from whole table
            base.$originalHeader.css('width', base.$clonedHeader.width());
        };

        base.updateOptions = function (options) {
            base.options = $.extend({}, defaults, options);
            base.updateWidth();
            base.toggleHeaders();
        };

        // Run initializer
        base.init();
    }

    // A plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[name] = function (options) {
        return this.each(function () {
            var instance = $.data(this, 'plugin_' + name);
            if (instance) {
                if (typeof options === "string") {
                    instance[options].apply(instance);
                } else {
                    instance.updateOptions(options);
                }
            } else if (options !== 'destroy') {
                $.data(this, 'plugin_' + name, new Plugin(this, options));
            }
        });
    };

})(jQuery, window);
;/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


angular.module("flowServices", ["fluid"])
    .service("userSessionService", [function () {

        this.createUserSession = function (username, bs64auth) {
            this.username = username;
            this.authorization = bs64auth;
        };

        this.destroyUserSession = function () {
            this.username = undefined;
            this.authorization = undefined;
        };

        return this;
    }])
    .service("userProfile", ["flowHttpService", function (f) {

        this.createUserProfile = function (userDetail) {
            0;
            this.fullName = userDetail.fullName;
            this.detailId = userDetail.id;
            this.avatar = withHost("services/download_service/getContent/" + userDetail.avatar);
            this.groupOwner = userDetail.groupOwner;
            this.profiles = userDetail.profiles;
            this.editTaskUrl = "services/flow_task_service/getTask?name=edit_profile&active=true&size=50&showToolBar=false&page=edit_profile&page-path=" + userDetail.id + "&newTask=false";
        };

        this.destroyUserProfile = function () {
            this.fullName = undefined;
            this.username = undefined;
            this.email = undefined;
            this.detailId = undefined;
            this.avatar = undefined;
            this.group = undefined;
            this.groupOwner = undefined;
            this.profiles = undefined;
            this.agent = undefined;
        };


        this.updateProfile = function (userDetail) {
            this.fullName = userDetail.fullName;
            this.avatar = withHost("services/download_service/getContent/" + userDetail.avatar);
        };

        return this;
    }])
    .service("userAppSetting", ["flowHttpService", function (f) {

        this.menu = "sidebar-default";

        this.style = "style1";

        this.theme = "yellow-blue";

        this.bgColor = "#FF6A6A";

        this.url = "session/flow_user_app_setting_session";

        this.hideMenu = false;

        this.layout = "FLUIDSCREEN";

        this.createAppSetting = function () {
            return f.getGlobal(this.url + "/setting");
        };


        this.updateSetting = function (query) {

            var appSetting = {};
            var value = undefined;
            if (query === "menu") {
                value = this.menu;
            } else if (query === "theme") {
                value = this.theme;
            } else if (query === "style") {
                value = this.style;
            } else if (query === "hideMenu") {
                value = this.hideMenu;
            } else if (query === "layout") {
                value = this.layout;
            }

            var url = this.url + "/update?" + query + "=" + value;

            f.putGlobal(url, appSetting)
                .success(function (data) {

                });
        };

        return this;

    }])
    .service("hasProfile", ["flowHttpService", function (f) {

        this.check = function (profiles, task) {
            return f.post(this.url, profiles, task);
        }
        return this;
    }])
    .service("imageService", ["flowHttpService", function (f) {

        this.url = "services/download_service/getContent/";

        this.getAvatar = function (id) {
            return id ? f.host + this.url + id : '../images/gallery/profile_default.png';
        };

        return this;
    }]);
;/**
 * Created by Jerico on 12/15/2014.
 */
angular.module("sessionControllers", ["fluid", "ngResource", "flowServices", "truncate", "flowAppDirectives",
    "ngCookies"])
    .controller("editProfileCtrl", ["$scope", "userProfile", "UserFactory", function (s, u, uf) {
        s.task.page.load = function (data) {
            0;
            this.title = u.fullName;
            s.task.password = {};
            s.task.flowUserDetail = data;
            s.task.tempData = {};
            s.task.updatePassword = false;
            angular.copy(data, s.task.tempData);
        };


        s.task.validatePassword = function () {
            if (s.task.password.current) {
                s.http.post("session/password_service/validate/", s.task.password.current, uf.getUser().username)
                    .success(function (valid) {
                        s.task.showChangePasswordField = valid;
                        s.task.showInvalidPassword = !valid;
                    }).error(function () {
                        s.task.showInvalidPassword = true;
                    });
            }
        };

        s.task.changePassword = function () {
            s.task.updatePassword = !s.task.updatePassword;
            s.task.showChangePasswordField = false;
            s.task.password = {};
        };

        s.task.update = function () {
            0;
            if (s.task.updatePassword) {
                if (s.task.password.new) {
                    s.http.post("session/password_service/change_password/", s.task.password.new, uf.getUser().username).
                        success(function (data) {
                            s.flow.message.success("Password has been changed.");
                            s.task.changePassword();
                        })
                        .error(function (msg) {
                            //TODO: add error
                        });
                }
            }

            if (!angular.equals(s.task.flowUserDetail, s.task.tempData)) {
                s.flow.action("put", s.task.flowUserDetail, s.task.flowUserDetail.id);
            } else {
                if (!s.task.updatePassword) {
                    s.flow.message.info(UI_MESSAGE_NO_CHANGE);
                }
            }


        };

        s.$on(s.flow.event.getSuccessEventId(), function (event, data, method) {
            if (method === "put") {
                u.updateProfile(s.task.flowUserDetail);
                s.task.tempData = {};
            }
        });


    }])
    .controller("notificationCtrl", ["$scope", "userProfile", "fnService", "$rootScope", function (s, u, fs, rs) {
        s.fs = fs;


        s.back = function () {
            rs.$broadcast(s.flow.getEventId('back'));
        }

        s.open = function (alert) {
            s.flow.goTo("notification_view", alert.id);
        }

        s.getMessageTypeGlyph = function (alert) {
            if (alert.messageType === "danger") {
                return "fa fa-exclamation";
            } else if (alert.messageType === "info") {
                return "fa fa-info"
            } else if (alert.messageType === "warning") {
                return "fa fa-warning"
            } else if (alert.messageType === "success") {
                return "fa fa-check"
            }
        };

        s.getLabelScheme = function (alert) {
            if (alert.messageType === "danger") {
                return "label label-danger";
            } else if (alert.messageType === "info") {
                return "label label-info"
            } else if (alert.messageType === "warning") {
                return "label label-warning"
            } else if (alert.messageType === "success") {
                return "label label-success"
            }
        };

        s.getPanelScheme = function (alert) {
            if (alert.messageType === "danger") {
                return "panel panel-danger";
            } else if (alert.messageType === "info") {
                return "panel panel-info"
            } else if (alert.messageType === "warning") {
                return "panel panel-warning"
            } else if (alert.messageType === "success") {
                return "panel panel-success"
            }
        };


        s.getTypeIcon = function (alert) {
            if (alert.alarmType === "silent") {
                return "fa fa-bell-slash-o";
            } else if (alert.alarmType === "system") {
                return "fa fa-gears";
            } else if (alert.alarmType === "message") {
                return "fa fa-envelope-o";
            } else if (alert.alarmType === "notice") {
                return "fa fa-info-circle";
            } else if (alert.alarmType === "broadcast") {
                return "fa fa-globe";
            }
        };

        s.flow.pageCallBack = function (page, data) {
            if (page === "notification_view") {
                s.data = data;
            }
            else if (page === "notification_center") {
                s.data = data;
            }
        }

    }]);
;/**
 * Created by rickzx98 on 8/30/15.
 */
/**
 * Created by Jerico on 7/30/2015.
 */
angular.module("war.session", ["fluid"])
    .config(["$httpProvider", function (hp) {
        hp.interceptors.push('AuthInterceptor');
    }])
    .factory("UserFactory", ["$http", "AuthFactory", function (h, a) {

        var userFactory = {
            login: login,
            logout: logout,
            getUser: getUser,
            isAuthenticated: isAuthenticated
        };

        function login(login) {
            var encodedKey = btoa("loginKey:" + login.username + ":" + login.password);
            return h.post(withHost("session/v2/login"), encodedKey).success(function (data) {
                if (data) {
                    a.setToken(data.token);
                    a.setInfo(data.info);
                    //navigate to home
                    0;
                }
            });
        }

        function logout() {
            a.removeToken().removeInfo();
            // navigate to login  screen
        }

        function getUser() {
            return a.getInfo();
        }

        function isAuthenticated() {
            return a.getToken() != null;
        }


        return userFactory;
    }])
    .factory("AuthFactory", ["sessionService", function (ss) {

        var authFactory = {
            setToken: setToken,
            getToken: getToken,
            setInfo: setInfo,
            getInfo: getInfo,
            withTokenUrl: withTokenUrl,
            removeToken: removeToken,
            removeInfo: removeInfo
        };

        function removeToken() {
            ss.removeSessionProperty("token");
            return this;
        }

        function removeInfo() {
            ss.removeSessionProperty("info");
            return this;
        }

        function withTokenUrl(url) {
            var ret = undefined;
            if (url.indexOf("?") === -1) {
                ret = url + "?token=" + this.getToken();
            } else {
                ret = url + "&token=" + this.getToken();
            }
            return ret;
        }

        function setToken(token) {
            ss.addSessionProperty("token", token);
        }

        function getToken() {
            return ss.getSessionProperty("token");
        }

        function setInfo(info) {
            ss.addSessionProperty("info", info);
        }

        function getInfo() {
            return ss.getSessionProperty("info");
        }

        return authFactory;
    }])
    .factory("AuthInterceptor", ["AuthFactory", function (a) {
        return {
            "request": function (config) {
                if (a.getToken()) {
                    config.headers = config.headers || {};
                    config.headers.Authorization = "bearer " + a.getToken();
                    0;
                }
                return config;
            }
        }
    }]);



;/**
 * Created by rickzx98 on 8/31/15.
 */
angular.module("war.sidebar", [])
    .controller("sidebarCtl", ["$scope", "UserFactory", "userProfile", "userAppSetting", function (scope, UserFactory, up, uas) {
        scope.userProfile = up;
        scope.userFactory = UserFactory;
        scope.appSetting = uas;
    }]);;angular.module('rexTemplates', ['templates/app/header.html', 'templates/app/sidebar.html', 'templates/app/signin.html', 'templates/fluid/fluidBar.html', 'templates/fluid/fluidCheckbox.html', 'templates/fluid/fluidDatePicker.html', 'templates/fluid/fluidField.html', 'templates/fluid/fluidFrame.html', 'templates/fluid/fluidImage.html', 'templates/fluid/fluidImageUpload.html', 'templates/fluid/fluidLookup.html', 'templates/fluid/fluidModal.html', 'templates/fluid/fluidNotify.html', 'templates/fluid/fluidPanel.html', 'templates/fluid/fluidRadio.html', 'templates/fluid/fluidReportTable.html', 'templates/fluid/fluidSelect.html', 'templates/fluid/fluidTextArea.html', 'templates/fluid/fluidToolbar.html', 'templates/fluid/fluidUploader.html']);

angular.module("templates/app/header.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/app/header.html",
    "<nav id=\"topbar\" ng-controller=\"homeCtrl\" role=\"navigation\" style=\"margin-bottom: 0\" data-step=\"1\" class=\"navbar navbar-default navbar-static-top\"><div class=\"navbar-header\"><button type=\"button\" data-toggle=\"collapse\" data-target=\".sidebar-collapse\" class=\"navbar-toggle\"><span class=\"sr-only\">Toggle navigation</span><span class=\"icon-bar\"></span><span class=\"icon-bar\"></span><span class=\"icon-bar\"></span></button> <a id=\"logo\" href=\"#\" class=\"navbar-brand\"><span class=\"fa fa-rocket\"></span><span class=\"logo-text\">{{userProfile.group.groupTitle}}</span><img style=\"display: none\" ng-src=\"{{userProfile.group.emblemPath}}\" fallback-src=\"images/icons/logo.png\" height=\"46\" width=\"48\" class=\"logo-text-icon emblem\"></a></div><div class=\"topbar-main\"><a href=\"#\" id=\"menu-toggle\" href=\"javascript:void(0);\" ng-click=\"header.collapse('k')\" class=\"hidden-xs\"><i class=\"fa fa-bars\"></i></a><ul class=\"nav navabar\" ng-show=\"flowFrameSerivce.taskList.length > 10\" class=\"hidden-xs\"><li class=\"dropdown dropdown-toggle\"><a data-hover=\"dropdown\" href=\"javascript:void(0);\"><span ng-show=\"flowFrameService.taskList.length > 0\" class=\"badge badge-blue\">{{taskbar.getExcessCount(flowFrameService.taskList)}}</span>&nbsp;<span class=\"caret\"></span></a><ul class=\"dropdown-menu dropdown-user\" style=\"height:200px;overflow:auto\"><li ng-repeat=\"task in flowFrameService.taskList\" ng-show=\"$index >= 10\"><a href=\"#\"><i class=\"{{task.glyph}}\"></i>&nbsp;<span>{{task.title}}</span></a></li></ul></li></ul><ul class=\"nav navbar navbar-top-links navbar-right\"><li><fluid-loader><img src=\"images/loader/loader6.GIF\"></fluid-loader></li><li><div class=\"search-tasks\"><input class=\"animted anim-dur fadeIn\" ng-show=\"flowFrameService.isSearch\" type=\"text\" placeholder=\"Search task\" name=\"taskSearchField\" ng-model=\"flowFrameService.searchTask\"> <a href=\"#\" ng-click=\"flowFrameService.toggleSearch()\" flow-tooltip class=\"fa fa-search\" tooltip-title=\"Search tasks\"></a></div></li><li class=\"dropdown topbar-user\"><a data-toggle=\"dropdown\" href=\"javascript:void(0);\" class=\"dropdown-toggle\"><img ng-src=\"{{userProfile.avatar}}\" fallback-src=\"images/gallery/profile_default.png\" alt=\"\" class=\"img-responsive img-circle\">&nbsp;<span class=\"hidden-xs\">{{userProfile.fullName}}</span>&nbsp;<span class=\"caret\"></span></a><ul class=\"dropdown-menu dropdown-user\"><li><a href=\"#\" ng-click=\"editProfile()\"><i class=\"octicon octicon-file-media\"></i>My Profile</a></li><li class=\"divider\"></li><li><a href=\"#\" ng-click=\"logout()\"><i class=\"fa fa-key\"></i>Log Out</a></li></ul></li><li fn-bar></li><li class=\"dropdown hidden-lg hidden-md hidden-sm\"><a data-toggle=\"dropdown\" href=\"javascript:void(0);\" class=\"dropdown-toggle\"><i class=\"fa fa-th\"></i> <span ng-show=\"flowFrameService.taskList.length > 0\" class=\"badge badge-blue\">{{flowFrameService.taskList.length}}</span>&nbsp;<span class=\"caret\"></span></a><ul class=\"dropdown-menu dropdown-tasks translucent\"><li><div class=\"dropdown-slimscroll\" style=\"width:250px;height:300px;overflow:auto\"><ul><li class=\"fluid-task-item-xs {{tsk.active ? 'fluid-task-item-active':'fluid-task-item-hidden'}}\" ng-repeat=\"tsk in flowFrameService.taskList\"><a href=\"#\" ng-click=\"taskbar.open(tsk)\"><i class=\"{{tsk.glyph}}\"></i>&nbsp;&nbsp;&nbsp;<span>{{tsk.title}}</span></a></li></ul></div></li></ul></li><li id=\"dropdown-theme-setting\" class=\"dropdown hidden-xs\"><a id=\"theme-setting\" href=\"javascript:;\" ng-click=\"header.toggle('theme')\" class=\"dropdown-toggle\"><i class=\"fa fa-cogs\"></i></a><ul ng-class=\"{show:header.theme}\" class=\"dropdown-menu dropdown-theme-setting pull-right\"><li><h4 class=\"mtn\">Theme Colors</h4><ul id=\"list-color\" class=\"list-unstyled list-inline\"><li data-color=\"green-dark\" ng-click=\"theme_change('green-dark')\" title=\"Green - Dark\" class=\"green-dark\"></li><li data-color=\"red-dark\" ng-click=\"theme_change('red-dark')\" title=\"Red - Dark\" class=\"red-dark\"></li><li data-color=\"pink-dark\" ng-click=\"theme_change('pink-dark')\" title=\"Pink - Dark\" class=\"pink-dark\"></li><li data-color=\"blue-dark\" ng-click=\"theme_change('blue-dark')\" title=\"Blue - Dark\" class=\"blue-dark\"></li><li data-color=\"yellow-dark\" ng-click=\"theme_change('yellow-dark')\" title=\"Yellow - Dark\" class=\"yellow-dark\"></li><li data-color=\"green-grey\" ng-click=\"theme_change('green-grey')\" title=\"Green - Grey\" class=\"green-grey\"></li><li data-color=\"red-grey\" ng-click=\"theme_change('red-grey')\" title=\"Red - Grey\" class=\"red-grey\"></li><li data-color=\"pink-grey\" ng-click=\"theme_change('pink-grey')\" title=\"Pink - Grey\" class=\"pink-grey\"></li><li data-color=\"blue-grey\" ng-click=\"theme_change('blue-grey')\" title=\"Blue - Grey\" class=\"blue-grey\"></li><li data-color=\"yellow-grey\" ng-click=\"theme_change('yellow-grey')\" title=\"Yellow - Grey\" class=\"yellow-grey\"></li><li data-color=\"yellow-green\" ng-click=\"theme_change('yellow-green')\" title=\"Yellow - Green\" class=\"yellow-green\"></li><li data-color=\"orange-grey\" ng-click=\"theme_change('orange-grey')\" title=\"Orange - Grey\" class=\"orange-grey\"></li><li data-color=\"pink-blue\" ng-click=\"theme_change('pink-blue')\" title=\"Pink - Blue\" class=\"pink-blue\"></li><li data-color=\"pink-violet\" ng-click=\"theme_change('pink-violet')\" title=\"Pink - Violet\" class=\"pink-violet active\"></li><li data-color=\"orange-violet\" ng-click=\"theme_change('orange-violet')\" title=\"Orange - Violet\" class=\"orange-violet\"></li><li data-color=\"pink-green\" ng-click=\"theme_change('pink-green')\" title=\"Pink - Green\" class=\"pink-green\"></li><li data-color=\"pink-brown\" ng-click=\"theme_change('pink-brown')\" title=\"Pink - Brown\" class=\"pink-brown\"></li><li data-color=\"orange-blue\" ng-click=\"theme_change('orange-blue')\" title=\"Orange - Blue\" class=\"orange-blue\"></li><li data-color=\"yellow-blue\" ng-click=\"theme_change('yellow-blue')\" title=\"Yellow - Blue\" class=\"yellow-blue\"></li><li data-color=\"green-blue\" ng-click=\"theme_change('green-blue')\" title=\"Green - Blue\" class=\"green-blue\"></li></ul></li></ul></li></ul><a href=\"#\" class=\"fluidTaskBar hidden-md hidden-sm hidden-xs\" ng-class=\"task.active ? 'fluidTaskBar-icon-shown' : ''\" style=\"height:47px;width:48px; margin: 1px\" ng-repeat=\"task in flowFrameService.taskList | limitTo:10\" ng-click=\"taskbar.open(task)\" flow-bar-tooltip index=\"$index\" task=\"task\"><i class=\"fluid-bar-icon {{task.glyph}}\"></i></a><div class=\"dropdown fluidTaskBarMore hidden-md hidden-sm hidden-xs\"><a href=\"#\" data-toggle=\"dropdown\" class=\"hiddex-xs dropdown-toggle\" ng-show=\"flowFrameService.taskList.length > 10\"><i class=\"fluid-bar-icon-sub-task fa fa-th\"></i>&nbsp;<span class=\"badge badge-blue\">{{taskbar.getExcessCount(10)}}</span></a><ul class=\"dropdown-menu dropdown-tasks translucent\"><li><div class=\"dropdown-slimscroll\" style=\"width:250px;height:300px;overflow:auto\"><ul><li class=\"fluid-task-item {{tsk.active ? 'fluid-task-item-active':'fluid-task-item-hidden'}}\" ng-repeat=\"tsk in flowFrameService.taskList\" ng-hide=\"$index < 10\"><div class=\"btn-group btn-group-sm\" style=\"color:white\"><a href=\"#\" class=\"btn btn-danger btn-xs text-inverse\" ng-click=\"taskbar.close(tsk,$index)\"><i class=\"fa fa-close\"></i></a> <a href=\"#\" class=\"btn btn-info btn-xs\" ng-click=\"taskbar.hide(tsk)\"><i class=\"fa fa-angle-down\"></i></a></div><a href=\"#\" ng-click=\"taskbar.open(tsk)\"><i class=\"{{tsk.glyph}}\"></i>&nbsp;&nbsp;&nbsp;<span class=\"task-item\">{{tsk.title}}</span></a></li></ul></div></li></ul></div><a href=\"#\" class=\"fluidTaskBar hidden-lg hidden-xs\" ng-class=\"task.active ? 'fluidTaskBar-icon-shown' : ''\" style=\"height:47px;width:48px; margin: 1px\" ng-repeat=\"task in flowFrameService.taskList | limitTo:5\" ng-click=\"taskbar.open(task)\" flow-tooltip tooltip-title=\"{{task.title}}\"><i class=\"fluid-bar-icon {{task.glyph}}\"></i></a><div class=\"dropdown fluidTaskBarMore hidden-lg hidden-xs\"><a href=\"#\" data-toggle=\"dropdown\" class=\"hiddex-xs dropdown-toggle\" ng-show=\"flowFrameService.taskList.length > 5\"><i class=\"fluid-bar-icon-sub-task fa fa-th\"></i>&nbsp;<span class=\"badge badge-blue\">{{taskbar.getExcessCount(5)}}</span></a><ul class=\"dropdown-menu dropdown-tasks translucent\"><li><div class=\"dropdown-slimscroll\" style=\"width:250px;height:300px;overflow:auto\"><ul><li class=\"fluid-task-item {{tsk.active ? 'fluid-task-item-active':'fluid-task-item-hidden'}}\" ng-repeat=\"tsk in flowFrameService.taskList\" ng-hide=\"$index < 5\"><div class=\"btn-group btn-group-sm\" style=\"color:white\"><a href=\"#\" class=\"btn btn-danger btn-xs text-inverse\" ng-click=\"taskbar.close(tsk,$index)\"><i class=\"fa fa-close\"></i></a> <a href=\"#\" class=\"btn btn-info btn-xs\" ng-click=\"taskbar.hide(tsk)\"><i class=\"fa fa-angle-down\"></i></a></div><a href=\"#\" ng-click=\"taskbar.open(tsk)\"><i class=\"{{tsk.glyph}}\"></i>&nbsp;&nbsp;&nbsp;<span class=\"task-item\">{{tsk.title}}</span></a></li></ul></div></li></ul></div></div></nav>");
}]);

angular.module("templates/app/sidebar.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/app/sidebar.html",
    "<div ng-controller=\"sidebarCtl\" class=\"sidebar-collapse\"><ul id=\"side-menu\" fluid-menu class=\"nav admin-nav-main\"><li class=\"user-panel\"><div class=\"thumb\"><img fallback-src=\"images/gallery/profile_default.png\" ng-src=\"{{userProfile.avatar}}\" class=\"img-circle\"></div><div class=\"info\"><p>{{userProfile.fullName}}</p></div><div class=\"clearfix\"></div></li></ul></div>");
}]);

angular.module("templates/app/signin.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/app/signin.html",
    "<div id=\"signin-page\"><div class=\"page-form-wrapper\"></div><div class=\"page-form\"><form action=\"/#/\" class=\"form\"><div class=\"header-content\"><h1>Log In</h1></div><div class=\"body-content\"><p>Log in with a social network:</p><div class=\"row mbm text-center\"><div class=\"col-md-4\"><a href=\"javascript:void(0);\" class=\"btn btn-sm btn-twitter btn-block\"><i class=\"fa fa-twitter fa-fw\"></i>Twitter</a></div><div class=\"col-md-4\"><a href=\"javascript:void(0);\" class=\"btn btn-sm btn-facebook btn-block\"><i class=\"fa fa-facebook fa-fw\"></i>Facebook</a></div><div class=\"col-md-4\"><a href=\"javascript:void(0);\" class=\"btn btn-sm btn-google-plus btn-block\"><i class=\"fa fa-google-plus fa-fw\"></i>Google +</a></div></div><div class=\"form-group\"><div class=\"input-icon right\"><i class=\"fa fa-user\"></i> <input type=\"text\" placeholder=\"Username\" name=\"username\" class=\"form-control\"></div></div><div class=\"form-group\"><div class=\"input-icon right\"><i class=\"fa fa-key\"></i> <input type=\"password\" placeholder=\"Password\" name=\"password\" class=\"form-control\"></div></div><div class=\"form-group pull-left\"><div class=\"checkbox-list\"><label><input type=\"checkbox\">&nbsp; Keep me signed in</label></div></div><div class=\"form-group pull-right\"><button type=\"button\" onclick=\"window.location.href=&quot;/#/&quot\" class=\"btn btn-success\">Log In &nbsp;<i class=\"fa fa-chevron-circle-right\"></i></button></div><div class=\"clearfix\"></div><div class=\"forget-password\"><h4>Forgotten your Password?</h4><p>no worries, click <a href=\"javascript:void(0);\" class=\"btn-forgot-pwd\">here</a> to reset your password.</p></div><hr><p>Don't have an account? <a id=\"btn-register\" href=\"/#/extra-signup\">Register Now</a></p></div></form></div></div>");
}]);

angular.module("templates/fluid/fluidBar.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid/fluidBar.html",
    "<ul class=\"nav navbar navbar-top-links\"><li ng-class=\"task.active ? 'flow-bar-icon-active':''\" ng-repeat=\"task in taskList | limitTo:10\"><a class=\"flow-bar-icon\" href=\"#\" ng-click=\"open(task)\"><i ng-class=\"task.glyph\"></i><span class=\"hidden-lg hidden-md hidden-sm\">&nbsp;{{task.title}}</span></a></li><li class=\"hidden-xs\" class=\"dropdown\" ng-hide=\"taskList.length < 11\"><a href=\"#\" class=\"dropdown-toggle\" data-toggle=\"dropdown\"><span class=\"fa fa-angle-down\"></span></a><ul class=\"dropdown-menu\" style=\"overflow: auto\"><li ng-show=\"$index >= 10\" class=\"border\" ng-repeat=\"tsk in taskList\" ng-class=\"tsk.active ?'flow-bar-icon-active':''\"><a href=\"#\" class=\"flow-bar-task\" title=\"{{tsk.title}}\" ng-click=\"open(tsk)\"><i ng-class=\"tsk.glyph\"></i> <span>&nbsp;{{tsk.title}}</span></a></li></ul></li></ul>");
}]);

angular.module("templates/fluid/fluidCheckbox.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid/fluidCheckbox.html",
    "<div class=\"form-group flow-form\"><label ng-click=\"update()\" column=\"12\" class=\"control-label\" for=\"{{name}}\"><input style=\"position: absolute; left: -9999px; width: 1px; height: 1px\" name=\"{{name}}\" ng-model=\"model\" ng-disabled=\"disabled ? disabled : false\" ng-required=\"required ? required : false\"> <span ng-if=\"disabled ? disabled : false\" class=\"fluid-checkbox disabled\"><i ng-if=\"model\" class=\"fa fa-check-square-o\" style=\"font-size: 20px;color: #d3d3d3\"></i> <i ng-if=\"!model\" class=\"fa fa-square-o\" style=\"font-size: 20px;color: #d3d3d3\"></i></span> <span ng-if=\"disabled ? false : true\" class=\"fluid-checkbox\" type=\"button\"><i ng-if=\"model\" class=\"text-success fa fa-check-square-o\" style=\"font-size: 20px\"></i> <i ng-if=\"!model\" class=\"fa fa-square-o\" style=\"font-size: 20px;color: grey\"></i></span> {{label}} <span class=\"text-danger\" ng-show=\"required\">*</span></label></div>");
}]);

angular.module("templates/fluid/fluidDatePicker.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid/fluidDatePicker.html",
    "<div class=\"form-group flow-form\"><label column=\"12\" class=\"control-label\">{{label}}<span style=\"color: #ea520a\" ng-show=\"required\">*</span></label><div column=\"12\"><input placeholder=\"{{format}}\" name=\"{{name}}\" ng-change=\"convertToTimestamp()\" ng-disabled=\"disabled\" class=\"form-control datepicker\" ng-model=\"temp\" type=\"text\" ng-required=\"required\"></div></div>");
}]);

angular.module("templates/fluid/fluidField.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid/fluidField.html",
    "<div class=\"form-group flow-form\"><label for=\"{{name}}\" column=\"12\" class=\"control-label\">{{label}}<span class=\"text-danger\" ng-show=\"required\">*</span> <input ng-blur=\"blur()\" name=\"{{name}}\" ng-disabled=\"disabled\" class=\"form-control\" ng-model=\"model\" type=\"{{type}}\" ng-required=\"required\"></label></div>");
}]);

angular.module("templates/fluid/fluidFrame.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid/fluidFrame.html",
    "<div class=\"container-fluid frame-content\" ng-class=\"flowFrameService.fullScreen ? 'frame-fullscreen' : 'frame-fluidscreen'\"><div ng-if=\"flowFrameService.fullScreen\" class=\"container-fluid frame-content-div\" ng-show=\"flowFrameService.fullScreen\"><flow-panel task=\"flowFrameService.fullScreenTask\"></flow-panel></div><div ng-if=\"!flowFrameService.fullScreen\" class=\"container-fluid frame-content-div\" ng-hide=\"flowFrameService.fullScreen\"><div ng-init=\"initTask(task)\" ng-repeat=\"task in flowFrameService.taskList | filter:{active:true, title:flowFrameService.searchTask}\"><flow-panel task=\"task\"></flow-panel></div></div><div class=\"flow-footer portlet box color portlet-primary\" ng-show=\"flowFrameService.actionBarShowing\" ng-class=\"flowFrameService.actionBarClass\"><div class=\"portlet-header\"><div class=\"tools\"></div></div><div class=\"portlet-body\">body</div></div></div>");
}]);

angular.module("templates/fluid/fluidImage.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid/fluidImage.html",
    "<div class=\"form-group flow-form\"><label column=\"12\" class=\"control-label col-sm-2\">{{label}}<i ng-if=\"notDone\" class=\"fa fa-spinner fa-spin\"></i><span class=\"text-danger\" ng-show=\"required\">*</span><div class=\"flow-group-icon\" accept=\"image/*\" ng-model=\"preview\" ng-file-drop drag-over-class=\"{accept:'flow-group-icon-accept', reject:'flow-group-icon-error', delay:100}\"><img class=\"thumbnail\" style=\"border-radius: 5px\" width=\"198px\" height=\"173px\" ng-src=\"{{preview[0].dataUrl}}\"></div><div class=\"marginBottom5px\" ng-show=\"!disabled\"><span accept=\"image/*\" class=\"btn btn-info\" ng-show=\"!disabled\" ng-file-change=\"onFileSelect(preview[0],$files)\" ng-file-select ng-model=\"preview\"><span class=\"fa fa-image\" ng-show=\"!disabled\"></span>&nbsp;&nbsp;{{preview[0].dataUrl != null ? 'Change' : 'Attach'}}</span></div></label></div>");
}]);

angular.module("templates/fluid/fluidImageUpload.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid/fluidImageUpload.html",
    "<div class=\"image-upload\"><div class=\"img-group\"><img height=\"{{height-30}}\" width=\"{{width}}\" ngf-src=\"data\" fallback-src=\"images/gallery/profile_default.png\" ngf-accept=\"'image/*'\"></div><div class=\"img-group\"><span ngf-select ngf-change=\"change($files, $file, $event, $rejectedFiles)\" ng-model=\"data\" class=\"btn btn-primary\" accept=\"image/*\" ngf-accept=\"'image/*'\"><span ng-if=\"(model == null || model === undefined) && (data == null || data === undefined)\"><i class=\"fa fa-image\"></i> Select image</span> <span ng-if=\"(model != null || modal != undefined) || data\"><i class=\"fa fa-gear\"></i> Change</span></span></div></div>");
}]);

angular.module("templates/fluid/fluidLookup.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid/fluidLookup.html",
    "<div class=\"form-group flow-form\"><div ng-transclude></div><label column=\"12\" class=\"control-label\" for=\"{{name}}\">{{label}} <span class=\"text-danger\" ng-show=\"required\">*</span><div class=\"input-group\" name=\"{{name}}\"><input ng-disabled=\"disabled\" id=\"ctnr_{{id}}\" href=\"#\" title=\"{{label}}\" readonly class=\"form-control\" ng-required=\"required\" ng-click=\"look()\" style=\"color:#000000;background: #ffffff\"><span ng-if=\"isNotModeled()\" class=\"input-group-btn\"><button type=\"button\" ng-disabled=\"disabled\" class=\"btn btn-info\" ng-click=\"look()\"><span class=\"fa fa-search\"></span></button></span> <span ng-if=\"isModeled()\" class=\"input-group-btn\"><button type=\"button\" title=\"clear\" class=\"btn btn-info\" ng-disabled=\"disabled\" ng-click=\"clear()\"><span class=\"fa fa-eraser\"></span></button></span></div></label></div>");
}]);

angular.module("templates/fluid/fluidModal.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid/fluidModal.html",
    "<div class=\"modal fade fluid-modal\" role=\"dialog\"><div class=\"modal-dialog modal-lg\"><div class=\"modal-content\"><ng-transclude></ng-transclude></div></div></div>");
}]);

angular.module("templates/fluid/fluidNotify.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid/fluidNotify.html",
    "<li class=\"dropdown\"><a data-toggle=\"dropdown\" href=\"#\" class=\"dropdown-toggle\"><i class=\"fa fa-bell fa-fw\"></i> <span class=\"badge badge-blue\" ng-show=\"fs.alerts.length > 0\">{{fs.alerts.length}}</span></a><ul class=\"dropdown-menu dropdown-alerts\"><li><p>You have {{fs.alerts.length > 0 ? fs.alerts.length +' new' : 'no new' }} notifications</p></li><li><div class=\"dropdown-slimscroll\"><ul><li ng-repeat=\"alert in fs.top\"><a href=\"#\" ng-click=\"open(alert)\" ng-class=\"!alert.notified ?'active':''\"><div ng-class=\"getLabelScheme(alert)\" class=\"fluid-notify-icon\"><i ng-class=\"getMessageTypeGlyph(alert)\"></i></div>&nbsp;{{alert.message | characters: 25 : false}}<span class=\"pull-right text-muted small\">{{fs.interval(alert)}}</span></a></li></ul></div></li><li class=\"last\"><a href=\"#\" class=\"text-right\" ng-click=\"openNotificationCenter()\">See all alerts</a></li></ul></li>");
}]);

angular.module("templates/fluid/fluidPanel.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid/fluidPanel.html",
    "<div id=\"_id_fp_{{task.id}}\" task class=\"portlet box {{!flowFrameService.fullScreen ? 'portlet-primary' : 'portlet-default'}} fluid-panel\"><div class=\"portlet-header\" ng-show=\"!task.locked\"><div class=\"caption\"><a ng-if=\"!flowFrameService.fullScreen \" data-toggle=\"collapse\" data-target=\"#_{{task.id}}\" href=\"#\" class=\"flow-panel-heading-title\"><span ng-class=\"task.glyph\" class=\"hidden-sm hidden-md hidden-xs\"></span><span ng-if=\"task.loaded\">&nbsp;{{task.title}} - {{task.page.title}}</span></a> <span ng-if=\"task.loaded && flowFrameService.fullScreen\">&nbsp;{{task.title}} - {{task.page.title}}</span> <img ng-if=\"!task.loaded && !flowFrameService.fullScreen\" src=\"images/loader/windows_like.GIF\"> <img ng-if=\"!task.loaded && flowFrameService.fullScreen\" src=\"images/loader/windows_like_2.GIF\"></div><div class=\"tools\"><div class=\"btn-group btn-group-lg hidden-lg\"><a href=\"#\" class=\"dropdown-toggle\" data-toggle=\"dropdown\"><span ng-class=\"task.glyph\" class=\"flow-panel-icon-control\"></a><ul class=\"dropdown-menu dropdown-menu-right dropdown-menu-inverse\"><li><a href=\"#\" ng-click=\"task.refresh()\">Refresh</a></li><li class=\"divider hidden-lg hidden-sm hidden-xs\"></li><li ng-if=\"!flowFrameService.fullScreen\"><a ng-click=\"task.fullScreen()\">Fullscreen</a></li><li ng-if=\"flowFrameService.fullScreen\"><a ng-click=\"task.fluidScreen()\">Fluidscreen</a></li><li class=\"hidden-lg\"><a href=\"#\" ng-click=\"task.hide(task)\">Minimize</a></li><li ng-class=\"task.locked ?\n" +
    "                        'hidden-sm hidden-md hidden-xs' : ''\" class=\"divider\"></li><li><a ng-class=\"task.locked ? 'hidden-sm hidden-md hidden-xs' : ''\" href=\"#\" ng-click=\"task.close()\">Close</a></li></ul></div><div class=\"hidden-md hidden-xs hidden-sm btn-group btn-group-md panel-control\"><button ng-hide=\"flowFrameService.fullScreen\" ng-disabled=\"task.pinned\" title=\"Maximize - 50\" class=\"btn btn-info\" ng-click=\"task.max50()\"><i class=\"element-center fa fa-arrows-h\" style=\"transform: scaleX(0.9)\"></i></button> <button ng-hide=\"flowFrameService.fullScreen\" ng-disabled=\"task.pinned\" ng-click=\"task.max100()\" class=\"btn btn-info\"><i title=\"Maximize - 100\" class=\"element-center fa fa-arrows-h\" style=\"transform: scaleX(1.3)\"></i></button> <button ng-disabled=\"task.pinned\" title=\"Minimize\" ng-click=\"task.hide(task)\" class=\"btn {{flowFrameService.fullScreen ? 'btn-default' : 'btn-info'}}\"><i title=\"minimize\" class=\"element-center fa fa-angle-down\"></i></button> <button ng-if=\"!flowFrameService.fullScreen\" class=\"btn btn-info\" ng-click=\"task.fullScreen()\"><i title=\"Full screen\" class=\"element-center fa fa-expand\"></i></button> <button ng-if=\"flowFrameService.fullScreen\" class=\"btn {{flowFrameService.fullScreen ? 'btn-default' : 'btn-info'}}\" ng-click=\"task.fluidScreen()\"><i title=\"Fluid screen\" class=\"element-center fa fa-th\"></i></button> <button class=\"btn {{flowFrameService.fullScreen ? 'btn-default' : 'btn-info'}}\" ng-click=\"task.refresh()\"><i title=\"Refresh\" class=\"element-center fa\" ng-class=\"task.loaded ? 'fa-refresh' : 'fa-spin fa-refresh'\"></i></button> <button class=\"btn {{flowFrameService.fullScreen ? 'btn-default' : 'btn-danger'}}\" ng-disabled=\"task.pinned||task.locked\" ng-click=\"task.close()\"><i class=\"element-center fa fa-close\" title=\"Close\" title=\"close\"></i></button></div></div></div><div id=\"_{{task.id}}\" class=\"panel-collapse collapse in\"><div id=\"_id_fpb_{{task.id}}\" class=\"portlet-body minHeight flow-panel\" ng-disabled=\"!task.loaded\"><flow-message id=\"{{flow.getElementFlowId('pnl_msg')}}\"></flow-message><flow-tool size=\"medium\" flow=\"flow\" id=\"{{flow.getElementFlowId('flw_tl')}}\" ng-if=\"task.showToolBar\" task=\"task\" pages=\"task.navPages\"></flow-tool><div id=\"page_div_{{task.id}}\" class=\"flow-panel-page\" ng-style=\"!flowFrameService.fullScreen?{overflow:auto}:{}\"></div></div></div></div>");
}]);

angular.module("templates/fluid/fluidRadio.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid/fluidRadio.html",
    "<div class=\"form-group flow-form\"><label column=\"12\" class=\"control-label\" for=\"{{name}}\">{{label}} <span class=\"text-danger\" ng-show=\"required\">*</span><div name=\"{{name}}\" class=\"fluid-radio\"></div></label></div>");
}]);

angular.module("templates/fluid/fluidReportTable.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid/fluidReportTable.html",
    "<table class=\"table table-hover table-condensed\" ng-init=\"rep = []\"><thead><tr><th class=\"bg-primary header-center\"><input type=\"checkbox\" ng-model=\"task.table.isMaterialsAdvisor\" flow-tooltip tooltip-title=\"{{task.table.isMaterialsAdvisor == true ? 'Hide materials advisor' : 'Show materials advisor'}}\" tooltip-time=\"300\" tooltip-at=\"top right\" tooltip-my=\"bottom left\"></th><th class=\"bg-info\"><input type=\"checkbox\" ng-model=\"task.table.isWeek\" flow-tooltip tooltip-title=\"{{task.table.isWeek == true ? 'Hide week' : 'Show week'}}\" tooltip-time=\"300\" tooltip-at=\"top right\" tooltip-my=\"bottom left\"></th><th ng-if=\"!task.isYear\" class=\"bg-info\"><input type=\"checkbox\" ng-model=\"task.table.isYear\" flow-tooltip tooltip-title=\"{{task.table.isWeek == true ? 'Hide year' : 'Show year'}}\" tooltip-time=\"300\" tooltip-at=\"top right\" tooltip-my=\"bottom left\"></th><th class=\"bg-info header\"></th><th class=\"bg-info header\"></th><th class=\"bg-success\"></th><th class=\"bg-info\"></th><th class=\"bg-info\"></th><th class=\"bg-success\"></th><th class=\"bg-info\"></th><th class=\"bg-info\"></th><th class=\"bg-success\"></th><th class=\"bg-warning\"></th><th class=\"bg-warning\"></th><th class=\"bg-warning\"></th><th class=\"bg-warning\"></th><th class=\"bg-warning\"></th><th class=\"bg-warning\"></th><th class=\"bg-warning\"></th><th class=\"bg-warning\"></th><th class=\"bg-warning\"></th><th class=\"bg-warning\"></th></tr></thead><thead><tr><th class=\"bg-primary\">{{!task.isAgent && task.table.isMaterialsAdvisor ? 'Materials Advisor' :'Action'}}</th><th class=\"bg-info\" ng-if=\"task.table.isWeek\">Week</th><th ng-if=\"!task.isYear && task.table.isYear\" class=\"bg-info\">Year</th><th class=\"bg-info header\">Planned Target</th><th class=\"bg-info header\">Planned Actual</th><th class=\"bg-success\">Planned Call Productivity</th><th class=\"bg-info\">Unplanned Target</th><th class=\"bg-info\">Unplanned Actual</th><th class=\"bg-success\">Unplanned Call Productivity</th><th class=\"bg-info\">Total Target</th><th class=\"bg-info\">Total Actual</th><th class=\"bg-success\">Total Call Productivity</th><th class=\"bg-warning\">Exam Copies Distribution</th><th class=\"bg-warning\">Invitation to Events</th><th class=\"bg-warning\">Confirmation of Events</th><th class=\"bg-warning\">Giveaways Distribution</th><th class=\"bg-warning\">Delivery of Incentive/Donation</th><th class=\"bg-warning\">Purchase Order</th><th class=\"bg-warning\">Delivery of Add'l Order / TRM / Compli</th><th class=\"bg-warning\">Booklist</th><th class=\"bg-warning\">Updated Customer Info Sheet</th><th class=\"bg-warning\">Implemented Ex-Sem</th></tr></thead><tbody ng-repeat=\"(month , report) in task.result | groupBy: 'reportMonth'\" ng-init=\"rep.push({selectedWeek:0})\"><tr><td class=\"bg-info\" colspan=\"2\">{{month}}</td><td colspan=\"3\"><select ng-model=\"rep[$index].selectedWeek\"><option value=\"1\" label=\"Week 1\"></option><option value=\"2\" label=\"Week 2\"></option><option value=\"3\" label=\"Week 3\"></option><option value=\"4\" label=\"Week 4\"></option><option value=\"5\" label=\"Week 5\"></option><option value=\"0\" label=\"All week\"></option></select></td></tr><tr ng-show=\"rep[$index].selectedWeek == 0\" ng-repeat=\"day in report\"><td><a href=\"#\" ng-click=\"task.getCustomers(day)\"><span><i ng-class=\"(day.view ? 'fa fa-search-minus' : 'fa fa-search-plus')\"></i> {{ !task.isAgent && table.isMaterialsAdvisor ? day.materialsAdvisor : ''}}</span></a></td><td ng-if=\"table.isWeek\">{{day.week}}</td><td ng-if=\"!task.isYear\">{{day.year}}</td><td>{{day.plannedTarget}}</td><td>{{day.plannedActual}}</td><td>{{day.plannedCallProductivity | setDecimal: 2}}%</td><td>{{day.unplannedTarget}}</td><td>{{day.unplannedActual}}</td><td>{{day.unplannedCallProductivity | setDecimal: 2}}%</td><td>{{day.totalActivity}}</td><td>{{day.unplannedActual + day.unplannedActual}}</td><td>{{day.totalCallProductivity | setDecimal: 2}}%</td><td>{{day.ecd}}</td><td>{{day.ite}}</td><td>{{day.coe}}</td><td>{{day.gd}}</td><td>{{day.doi}}</td><td>{{day.po}}</td><td>{{day.daotrc}}</td><td>{{day.bookList}}</td><td>{{day.ucis}}</td><td>{{day.ies}}</td></tr></tbody></table>");
}]);

angular.module("templates/fluid/fluidSelect.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid/fluidSelect.html",
    "<div class=\"form-group flow-form\"><label column=\"12\" class=\"control-label\" for=\"{{name}}\">{{label}}<span class=\"text-danger\" ng-show=\"required\">*</span><select id=\"{{id}}_select\" data-toggle=\"select\" class=\"form-control\" ng-required=\"required\" ng-disabled=\"disabled\" name=\"{{name}}\" ng-model=\"model\" ng-options=\"{{options}}\"><option class=\"hidden-lg hidden-md\" value disabled selected>Select {{label}}</option></select></label></div>");
}]);

angular.module("templates/fluid/fluidTextArea.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid/fluidTextArea.html",
    "<div class=\"form-group flow-form\"><label column=\"12\" class=\"control-label\">{{label}}<span class=\"text-danger\" ng-show=\"required\">*</span><textarea rows=\"{{rows}}\" cols=\"{{cols}}\" name=\"{{name}}\" ng-disabled=\"disabled\" class=\"form-control\" ng-model=\"model\" type=\"{{type}}\" ng-required=\"required\"></label>\n" +
    "\n" +
    "</div>");
}]);

angular.module("templates/fluid/fluidToolbar.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid/fluidToolbar.html",
    "<div class=\"container-fluid animated fadeIn anim-dur\" style=\"overflow: auto\"><div><ul class=\"breadcrumb\"><li class=\"pull-left\" ng-repeat=\"page in task.navPages\"><a title=\"page.title\" href=\"#\" ng-click=\"goToEvent(page.name,page.param)\">{{page.title}}</a></li><div class=\"form-group pull-right\"><div class=\"btn-group {{size}}\"><button id=\"btn_tool_{{control.id}}_{{task.id}}\" ng-repeat=\"control in task.toolbars\" title=\"{{control.label}}\" class=\"btn button-tool\" ng-class=\"getClass(control.uiType)\" ng-click=\"runEvent(control)\" ng-disabled=\"control.disabled\" type=\"button\"><span ng-class=\"control.glyph\"></span></button></div></div><div class=\"clearfix\"></div></ul></div></div>");
}]);

angular.module("templates/fluid/fluidUploader.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid/fluidUploader.html",
    "<div></div>");
}]);
