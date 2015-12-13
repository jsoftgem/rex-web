(function () {
    'use strict';
    angular.module('war.dev')
        .controller('pageCtrl', PageCtrl);

    PageCtrl.$inject = ['$scope', 'DTOptionsBuilder', 'DTColumnBuilder', 'flowModalService', '$filter', '$compile', 'sessionService'];

    function PageCtrl(s, dto, dtc, fm, f, c, ss) {

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
    }
})();
