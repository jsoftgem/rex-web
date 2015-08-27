angular.module("regionController", ["fluid", "ngResource", "datatables"])
    .controller("regionCtrl", ["$scope", "DTOptionsBuilder", "DTColumnBuilder", "flowMessageService", "flowModalService", "$compile", "$filter", "sessionService", function (s, dto, dtc, ms, fm, c, f, ss) {

        s.deleleModalId = "regionDeleteModal";
        s.create_name = "region_create";
        s.edit_name = "region_edit";
        s.home = "region";
        s.submit_button = "region_submit";

        var create = new CreateControl();
        create.id = "region_create_ctl";
        create.action = function () {
            s.task.regionCreate = {};
            s.flow.goTo(s.create_name);
        }

        var save = new SaveControl();
        save.id = "region_save_ctl";
        save.action = function () {
            $("#" + s.flow.getElementFlowId(s.submit_button)).trigger("click");
        }

        var delCtl = new DeleteControl();
        delCtl.id = "region_del_ctl";
        delCtl.action = function () {
            fm.show(s.flow.getElementFlowId(s.deleleModalId));
        }
        s.dtOptions = new FlowOptionsGET(dto, s.flow.getHomeUrl(), s, c, ss);
        s.dtColumns = FlowColumns(dtc, undefined, undefined, "task.view");
        s.dtColumns.push(dtc.newColumn("regionCode").withTitle("Region code").withOption("searchable", true));
        s.dtColumns.push(dtc.newColumn("regionName").withTitle("Region name").withOption("searchable", true));


        s.task.view = function (region) {
            s.task.region = region;
            s.flow.openTaskBaseUrl = "services/flow_task_service/getTask?showToolBar=false&size=100&";
            s.flow.openTask("region_manager_task", "region_manager_home", undefined, false);
        }

        s.edit = function (id) {
            s.task.regionEdit = {};
            s.task.tempEdit = {};
            s.flow.goTo(s.edit_name, id);
        }

        s.delete = function (id) {
            fm.show(s.flow.getElementFlowId(s.deleleModalId));
            s.http.get("services/war/region_query/getInstance/", id).success(function (data) {
                s.task.regionEdit = data;
            });
        }

        s.save = function () {
            if (s.task.page.name === s.edit_name) {
                if (!angular.equals(s.task.regionEdit, s.task.tempEdit)) {
                    s.flow.action("put", s.task.regionEdit, s.task.regionEdit.id);
                } else {
                    s.flow.message.info(UI_MESSAGE_NO_CHANGE);
                }
            } else if (s.task.page.name === s.create_name) {
                s.flow.action("put", s.task.regionCreate);
            }
        }


        s.$on(s.flow.event.getSuccessEventId(), function (event, data, method) {

            if (method === "put") {
                if (s.task.page.name === s.edit_name) {
                    s.task.regionEdit = {};
                    angular.copy(s.task.regionEdit, s.task.tempEdit);
                    s.flow.goToHome();
                } else if (s.task.page.name === s.create_name) {
                    s.task.regionCreate = {};
                    s.flow.goToHome();
                }
            }

        });


        s.$on(s.flow.event.getRefreshId(), function () {
            if (s.dtInstance) { s.dtInstance.rerender(); }
        });


        s.flow.pageCallBack = function (page, data, source) {
            if (s.edit_name === page) {
                if (!s.task.regionEdit.id || source === "refresh") {
                    s.task.regionEdit = data;
                    angular.copy(s.task.regionEdit, s.task.tempEdit);
                }
            } else if (s.home === page) {
                if (s.dtInstance) { s.dtInstance.rerender(); }
            }

            s.flow.addControl(save, [s.edit_name, s.create_name]);
            s.flow.addControl(delCtl, s.edit_name);
            s.flow.addControl(create, s.home);
        };

        s.deleteConfirm = function () {
            s.flow.action("delete", s.task.regionEdit, s.task.regionEdit.id);
            fm.hide(s.flow.getElementFlowId("regionDeleteModal"));
            if (s.task.page.name !== s.home) {
                s.flow.goToHome();
            }
            if (s.dtInstance) { s.dtInstance.rerender(); }
        };

        s.deleteCancel = function () {
            fm.hide(s.flow.getElementFlowId("regionDeleteModal"));
        };

    }]);