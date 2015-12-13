(function () {
    'use strict';
    angular.module('war.dev')
        .controller('taskCtrl', TaskCtrl);
    TaskCtrl.$inject = ['$scope', 'DTOptionsBuilder', 'DTColumnBuilder', 'flowMessageService', 'flowModalService', '$compile', 'sessionService'];
    function TaskCtrl(s, dto, dtc, ms, fm, c, ss) {

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
    }
})();
