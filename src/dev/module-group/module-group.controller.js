(function () {
    'use strict';
    angular.module('war.dev')
        .controller('moduleGroupCtrl', ModuleGroupCtrl);

    ModuleGroupCtrl.$inject = ['$scope', 'DTOptionsBuilder', 'DTColumnBuilder', 'flowModalService', '$compile', 'sessionService'];

    function ModuleGroupCtrl(s, dto, dtc, fm, c, ss) {
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

    }

})();
