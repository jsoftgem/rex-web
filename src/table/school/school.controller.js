(function () {
    'use strict';
    angular.module('war.table')
        .controller('schoolCtrl', SchoolCtrl);

    SchoolCtrl.$inject = ['$scope', 'DTOptionsBuilder', 'DTColumnBuilder', 'flowModalService', '$compile', '$filter', 'sessionService'];

    function SchoolCtrl(s, dto, dtc, fm, c, f, ss) {
        var create = new CreateControl();
        create.id = 'school_create_ctl';
        create.action = function () {
            s.task.schoolCreate = {};
            s.flow.goTo('school_create');
        };

        var save = new SaveControl();
        save.id = 'school_edit_ctl';
        save.action = function () {
            $('#' + s.flow.getElementFlowId('school_submit')).trigger('click');
        };

        var deleteCtl = new DeleteControl();
        deleteCtl.id = 'school_del_ctl';
        deleteCtl.action = function () {
            fm.show(s.flow.getElementFlowId('schoolDeleteModal'));
        };

        s.dtOptions = new FlowOptionsGET(dto, s.flow.getHomeUrl(), s, c, ss);
        s.dtColumns = FlowColumns(dtc);

        s.dtColumns.push(dtc.newColumn('name').withTitle('Name').withOption('searchable', true));
        s.dtColumns.push(dtc.newColumn('landline').withTitle('Landline').withOption('searchable', false));
        s.dtColumns.push(dtc.newColumn('email').withTitle('Email').withOption('searchable', true));
        s.dtColumns.push(dtc.newColumn('createdDt').withTitle('Created date').withOption('searchable', false).renderWith(function (data) {
            return renderDate(data, f);
        }));

        s.edit = function (id) {
            s.task.schoolEdit = {};
            s.task.tempEdit = {};
            s.flow.goTo('school_edit', id);
        };

        s.delete = function (data) {
            s.task.schoolEdit = data;
            fm.show(s.flow.getElementFlowId('schoolDeleteModal'));

        };

        s.save = function () {
            if (s.task.page.name === 'school_edit') {
                if (!angular.equals(s.task.schoolEdit, s.task.tempEdit)) {
                    s.flow.action('put', s.task.schoolEdit, s.task.schoolEdit.id);
                } else {
                    s.flow.message.info(UI_MESSAGE_NO_CHANGE);
                }
            } else if (s.task.page.name === 'school_create') {
                s.flow.action('put', s.task.schoolCreate);
            }
        };

        s.$on(s.flow.event.getSuccessEventId(), function (event, data, method) {
            if (method === 'put') {
                if (s.task.page.name === 'school_edit') {
                    s.task.schoolEdit = {};
                    angular.copy(s.task.schoolEdit, s.task.tempEdit);
                    s.flow.goToHome();
                } else if (s.task.page.name === 'school_create') {
                    s.task.schoolCreate = {};
                    s.flow.goToHome();
                }

            }
            else if (method === 'delete') {
                if (s.task.page.name === 'school_settings') {
                    if (s.dtInstance) {
                        s.dtInstance.reloadData();
                    }
                }
            }
        });


        s.$on(s.flow.event.getResizeEventId(), function (event, school, size) {
            if (school === 'school_settings') {
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
            if ('school_edit' === page) {
                if (!s.task.schoolEdit.id || source === 'refresh') {
                    s.task.schoolEdit = data;
                    angular.copy(s.task.schoolEdit, s.task.tempEdit);
                }
            } else if ('school_settings' === page) {
                if (s.dtInstance) {
                    s.dtInstance.reloadData();
                }
            }
            s.flow.addControl(save, ['school_edit', 'school_create']);
            s.flow.addControl(deleteCtl, 'school_edit');
            s.flow.addControl(create, 'school_settings');
        };

        s.deleteConfirm = function () {
            s.flow.action('delete', s.task.schoolEdit, s.task.schoolEdit.id);
            fm.hide(s.flow.getElementFlowId('schoolDeleteModal'));
            if (s.task.page.name !== 'school_settings') {
                s.flow.goToHome();
            }
            if (s.dtInstance) {
                s.dtInstance.reloadData();
            }
        };

        s.deleteCancel = function () {
            fm.hide(s.flow.getElementFlowId('schoolDeleteModal'));
        };
    }
})();