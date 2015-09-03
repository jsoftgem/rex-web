angular.module("positionController", ["fluid", "ngResource", "datatables"])
    .controller("positionCtrl", ["$scope", "DTOptionsBuilder", "DTColumnBuilder", "flowMessageService", "flowModalService", "$compile", "$filter", "sessionService", function (s, dto, dtc, ms, fm, c, f, ss) {


        s.deleleModalId = "positionDeleteModal";
        s.create_name = "position_create";
        s.edit_name = "position_edit";
        s.home = "position";
        s.submit_button = "position_submit";
        s.create_ctl_id = "position_create_ctl";
        s.save_ctl_id = "position_save_ctl";
        s.del_ctl_id = "position_del_ctl";
        s.getInstanceQuery = "services/war/position_query/getInstance/";


        var create = new CreateControl();
        create.id = s.create_ctl_id;
        create.action = function () {
            s.task.positionCreate = {};
            s.task.school = {};
            s.flow.goTo(s.create_name);
        }

        var save = new SaveControl();
        save.id = s.save_ctl_id;
        save.action = function () {
            $("#" + s.flow.getElementFlowId(s.submit_button)).trigger("click");
        }

        var delCtl = new DeleteControl();
        delCtl.id = s.del_ctl_id;
        delCtl.action = function () {
            fm.show(s.flow.getElementFlowId(s.deleleModalId));
        }


        s.dtOptions = new FlowOptionsGET(dto, s.flow.getHomeUrl(), s, c, ss);
        s.dtColumns = FlowColumns(dtc);

        s.dtColumns.push(dtc.newColumn("description").withTitle("Position").withOption("searchable", true));

        s.edit = function (id) {
            s.task.positionEdit = {};
            s.task.tempEdit = {};
            s.flow.goTo(s.edit_name, id);
        }

        s.delete = function (id) {
            fm.show(s.flow.getElementFlowId(s.deleleModalId));
            s.http.get(s.getInstanceQuery, id).success(function (data) {
                s.task.positionEdit = data;
            });
        }

        s.save = function () {
            if (s.task.page.name === s.edit_name) {
                if (!angular.equals(s.task.positionEdit, s.task.tempEdit)) {
                    s.flow.action("put", s.task.positionEdit, s.task.positionEdit.id);
                } else {
                    s.flow.message.info(UI_MESSAGE_NO_CHANGE);
                }
            } else if (s.task.page.name === s.create_name) {
                s.flow.action("put", s.task.positionCreate);
            }
        }


        s.$on(s.flow.event.getSuccessEventId(), function (event, data, method) {

            if (method === "put") {
                if (s.task.page.name === s.edit_name) {
                    s.task.positionEdit = {};
                    angular.copy(s.task.positionEdit, s.task.tempEdit);
                    s.flow.goToHome();
                } else if (s.task.page.name === s.create_name) {
                    s.task.positionCreate = {};
                    s.flow.goToHome();
                }
            }

        });


        s.$on(s.flow.event.getRefreshId(), function () {
            if (s.dtInstance) { s.dtInstance.reloadData(); }
        });

        s.flow.pageCallBack = function (page, data, source) {
            if (s.edit_name === page) {
                if (!s.task.positionEdit.id || source === "refresh") {
                    s.task.positionEdit = data;
                    angular.copy(s.task.positionEdit, s.task.tempEdit);
                }
            } else if (s.home === page) {
                if (s.dtInstance) { s.dtInstance.reloadData(); }
            }

            s.flow.addControl(save, [s.edit_name, s.create_name]);
            s.flow.addControl(delCtl, s.edit_name);
            s.flow.addControl(create, s.home);
        };

        s.deleteConfirm = function () {
            s.flow.action("delete", s.task.positionEdit, s.task.positionEdit.id);
            fm.hide(s.flow.getElementFlowId("positionDeleteModal"));
            if (s.task.page.name !== s.home) {
                s.flow.goToHome();
            }
            if (s.dtInstance) { s.dtInstance.reloadData(); }
        };

        s.deleteCancel = function () {
            fm.hide(s.flow.getElementFlowId("positionDeleteModal"));
        };

    }]);