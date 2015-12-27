(function () {
    'use strict';
    angular.module('war.admin')
        .controller('profileCtrl', ProfileCtrl);
    ProfileCtrl.$inject = ['$scope', 'DTOptionsBuilder', 'DTColumnBuilder', 'flowMessageService', 'flowModalService', '$compile', '$filter', 'sessionService'];
    function ProfileCtrl(s, dto, dtc, ms, fm, c, f, ss) {

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

        s.delete = function (data) {
            s.task.profileEdit = data;
            fm.show(s.flow.getElementFlowId("profileDeleteModal"));

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

    }
})();
