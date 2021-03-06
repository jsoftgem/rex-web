(function () {
    'use strict';
    angular.module('war.activity')
        .controller('dailyCtl', DailyCtl);
    DailyCtl.$inject = ['$scope', 'DTOptionsBuilder', 'DTColumnBuilder', 'flowModalService', '$compile', '$filter', 'sessionService'];
    function DailyCtl(s, dto, dtc, fm, c, f, ss) {
        s.dtInstance = {};
        s.task.deleleModalId = 'dailyDeleteModal';
        s.task.create_name = 'daily_create';
        s.task.edit_name = 'daily_edit';
        s.task.home = 'daily';
        s.task.submit_button = 'daily_submit';
        s.task.create_ctl_id = 'daily_create_ctl';
        s.task.save_ctl_id = 'daily_save_ctl';
        s.task.del_ctl_id = 'daily_del_ctl';
        s.task.getInstanceQuery = 'services/war/activity_query/getInstance/';
        s.task.tempEdit = {};
        s.flow.controls = [new SaveControl(), new DeleteControl()];
        s.flow.controls[0].id = s.task.save_ctl_id;
        s.flow.controls[0].action = function () {
            $('#' + s.flow.getElementFlowId(s.task.submit_button)).trigger('click');
        };
        s.flow.controls[0].pages = [s.task.create_name, s.task.edit_name];

        s.flow.controls[1].id = s.task.del_ctl_id;

        s.flow.controls[1].action = function () {
            fm.show(s.flow.getElementFlowId(s.task.deleleModalId));
        };

        s.flow.controls[1].pages = [s.task.edit_name];

        s.task.edit = function (id) {
            s.task.modelEdit = {};
            s.task.tempEdit = {};
            s.flow.goTo(s.task.edit_name, id);
        };

        s.task.delete = function (data) {
            s.task.modelEdit = data;
            fm.show(s.flow.getElementFlowId(s.task.deleleModalId));
        };

        s.task.deleteConfirm = function () {
            s.flow.action('delete', s.task.modelEdit, s.task.modelEdit.id);
            fm.hide(s.flow.getElementFlowId(s.task.deleleModalId));
            if (s.task.page.name !== s.task.home) {
                s.flow.goToHome();
            }
            if (s.dtInstance.reloadData) {
                s.dtInstance.reloadData();
            }
        };

        s.task.deleteCancel = function () {
            fm.hide(s.flow.getElementFlowId(s.task.deleleModalId));
        };

        s.flow.pageCallBack = function (page, data, source) {
            console.info(page, data);
            if (s.task.edit_name === page) {
                console.info('daily_edit', data);
                if (!s.task.modelEdit.id || source === 'refresh') {
                    s.task.modelEdit = data;
                    angular.copy(s.task.modelEdit, s.task.tempEdit);
                }
            } else if (s.task.home === page) {
                if (s.dtInstance.reloadData) {
                    s.dtInstance.reloadData();
                }
            }
        };

        s.$on(s.flow.event.getRefreshId(), function () {
            if (s.dtInstance.reloadData) {
                s.dtInstance.reloadData();
            }
        });

        s.dtOptions = FlowOptionsGET(dto, s.flow.getHomeUrl(), s, c, ss);

        s.dtColumns = FlowColumns(dtc, 'task.edit', 'task.delete');

        s.dtColumns.push(dtc.newColumn('description').withTitle('Customer').withOption('searchable', true));

        s.dtColumns.push(dtc.newColumn('materialAdviser').withTitle('Materials Advisor').withOption('searchable', true));

        s.dtColumns.push(dtc.newColumn('startDt').withTitle('Date').withOption('searchable', false).renderWith(function (data) {
            return renderDateSmall(data, f);
        }));

        s.dtColumns.push(dtc.newColumn('startDt').withTitle('Month').withOption('searchable', false).renderWith(function (data) {
            return renderMonth(data, f);
        }));

        s.dtColumns.push(dtc.newColumn('schoolYearDescription').withTitle('School Year').withOption('searchable', false));

    }
})();
