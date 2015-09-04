/**
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

        s.delete = function (data) {
            s.task.pageEdit = data;
            fm.show(s.flow.getElementFlowId("pageDeleteModal"));
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

        s.delete = function (data) {
            s.task.tskEdit = data;
            fm.show(s.flow.getElementFlowId("taskDeleteModal"));

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

        s.delete = function (data) {
            s.task.mdEdit = data;
            fm.show(s.flow.getElementFlowId("mdDeleteModal"));
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

        s.delete = function (data) {
            s.task.moduleGroupEdit = data;
            fm.show(s.flow.getElementFlowId("moduleGroupDeleteModal"));

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
