(function () {
    'use strict';
    angular.module('war.activity')
        .controller('schoolYearCtrl', SchoolYearCtrl);
    SchoolYearCtrl.$inject = ['$scope', 'DTOptionsBuilder', 'DTColumnBuilder', 'flowModalService', '$compile', 'sessionService'];
    function SchoolYearCtrl(s, dto, dtc, fm, c, ss) {
        s.dtInstance = {};
        s.task.deleleModalId = "schoolYearDeleteModal";
        s.task.create_name = "school_year_create";
        s.task.edit_name = "school_year_edit";
        s.task.home = "school_year";
        s.task.submit_button = "school_year_submit";
        s.task.create_ctl_id = "school_year_create_ctl";
        s.task.save_ctl_id = "school_year_save_ctl";
        s.task.del_ctl_id = "school_year_del_ctl";
        s.task.getInstanceQuery = "services/war/school_year_query/getInstance/";

        s.flow.controls = [new CreateControl(), new SaveControl(), new DeleteControl()];
        s.flow.controls[0].id = s.task.create_ctl_id;
        s.flow.controls[0].action = function () {
            s.task.modelCreate = {};
            s.flow.goTo(s.task.create_name);
        };
        s.flow.controls[0].pages = s.task.home;
        s.flow.controls[1].id = s.task.save_ctl_id;
        s.flow.controls[1].action = function () {
            $("#" + s.flow.getElementFlowId(s.task.submit_button)).trigger("click");
        };
        s.flow.controls[1].pages = [s.task.create_name, s.task.edit_name];

        s.flow.controls[2].id = s.task.del_ctl_id;
        s.flow.controls[2].action = function () {
            fm.show(s.flow.getElementFlowId(s.task.deleleModalId));
        };
        s.flow.controls[2].pages = [s.task.edit_name];

        s.task.edit = function (id) {
            s.task.modelEdit = {};
            s.task.tempEdit = {};
            s.flow.goTo(s.task.edit_name, id);
        };

        s.task.delete = function (data) {
            fm.show(s.flow.getElementFlowId(s.task.deleleModalId));
            s.task.modelEdit = data;
        };


        s.$on(s.flow.event.getSuccessEventId(), function (event, data, method) {

            if (method === "put") {
                if (s.task.page.name === s.task.edit_name) {
                    s.task.modelEdit = {};
                    angular.copy(s.task.modelEdit, s.task.tempEdit);
                    s.flow.goToHome();
                } else if (s.task.page.name === s.task.create_name) {
                    s.task.modelCreate = {};
                    s.flow.goToHome();
                }
            }
        });


        s.$on(s.flow.event.getRefreshId(), function () {
            if (s.dtInstance.reloadData) {
                s.dtInstance.reloadData();
            }
        });


        s.flow.pageCallBack = function (page, data, source) {
            if (s.task.edit_name === page) {
                if (!s.task.modelEdit.id || source === "refresh") {
                    s.task.modelEdit = data;
                    s.http.get("services/flow_user_query/getInstance/", s.task.modelEdit.createByUserId).success(function (data) {
                        s.task.edit.createUserFullName = data.flowUserDetail.fullName;
                    });
                    angular.copy(s.task.modelEdit, s.task.tempEdit);


                }
            } else if (s.task.home === page) {
                if (s.dtInstance.reloadData) {
                    s.dtInstance.reloadData();
                }
            }
        };


        s.task.deleteConfirm = function () {
            s.flow.action("delete", s.task.modelEdit, s.task.modelEdit.id);
            fm.hide(s.flow.getElementFlowId(s.task.deleleModalId));
            if (s.task.page.name !== s.home) {
                s.flow.goToHome();
            }
            if (s.dtInstance.reloadData) {
                s.dtInstance.reloadData();
            }
        };

        s.task.deleteCancel = function () {
            fm.hide(s.flow.getElementFlowId(s.task.deleleModalId));
        };

        s.dtOptions = new FlowOptionsGET(dto, s.flow.getHomeUrl(), s, c, ss);
        s.dtColumns = FlowColumns(dtc, "task.edit", "task.delete");
        s.dtColumns.push(dtc.newColumn("description").withTitle("School Year").withOption("searchable", true));

    }
})();
