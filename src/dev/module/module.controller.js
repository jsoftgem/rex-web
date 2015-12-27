(function () {
    'use strict';
    angular.module('war.dev')
        .controller('mdCtrl', ModuleCtrl);
    ModuleCtrl.$inject = ['$scope', 'DTOptionsBuilder', 'DTColumnBuilder', 'flowModalService', '$compile', 'sessionService'];
    function ModuleCtrl(s, dto, dtc, fm, c, ss) {

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

    }
})();
