(function () {
    'use strict';
    angular.module('war.table')
        .controller('levelCtrl', LevelCtrl);

    LevelCtrl.$inject = ['$scope', 'DTOptionsBuilder', 'DTColumnBuilder', 'flowModalService', '$compile', 'sessionService'];

    function LevelCtrl(s, dto, dtc, fm, c, ss) {

        s.deleleModalId = 'levelDeleteModal';
        s.create_name = 'level_create';
        s.edit_name = 'level_edit';
        s.home = 'level';
        s.submit_button = 'level_submit';
        s.create_ctl_id = 'level_create_ctl';
        s.save_ctl_id = 'level_save_ctl';
        s.del_ctl_id = 'level_del_ctl';
        s.getInstanceQuery = 'services/war/level_query/getInstance/';


        var create = new CreateControl();
        create.id = s.create_ctl_id;
        create.action = function () {
            s.task.levelCreate = {};
            s.task.school = {};
            s.flow.goTo(s.create_name);
        };
        create.pages = s.home;

        var save = new SaveControl();
        save.id = s.save_ctl_id;
        save.action = function () {
            $('#' + s.flow.getElementFlowId(s.submit_button)).trigger('click');
        };
        save.pages = [s.edit_name, s.create_name];

        var delCtl = new DeleteControl();
        delCtl.id = s.del_ctl_id;
        delCtl.action = function () {
            fm.show(s.flow.getElementFlowId(s.deleleModalId));
        };
        delCtl.pages = s.edit_name;

        s.flow.controls = [create, save, delCtl];

        s.dtOptions = new FlowOptionsGET(dto, s.flow.getHomeUrl(), s, c, ss);
        s.dtColumns = FlowColumns(dtc);

        s.dtColumns.push(dtc.newColumn('description').withTitle('Education level').withOption('searchable', true));
        s.dtColumns.push(dtc.newColumn('levelCourse').withTitle('Level course').withOption('searchable', true));

        s.edit = function (id) {
            s.task.levelEdit = {};
            s.task.tempEdit = {};
            s.flow.goTo(s.edit_name, id);
        };

        s.delete = function (data) {
            s.task.levelEdit = data;
            fm.show(s.flow.getElementFlowId(s.deleleModalId));
        };

        s.save = function () {
            if (s.task.page.name === s.edit_name) {
                if (!angular.equals(s.task.levelEdit, s.task.tempEdit)) {
                    s.flow.action('put', s.task.levelEdit, s.task.levelEdit.id);
                } else {
                    s.flow.message.info(UI_MESSAGE_NO_CHANGE);
                }
            } else if (s.task.page.name === s.create_name) {
                s.flow.action('put', s.task.levelCreate);
            }
        };


        s.$on(s.flow.event.getSuccessEventId(), function (event, data, method) {

            if (method === 'put') {
                if (s.task.page.name === s.edit_name) {
                    s.task.levelEdit = {};
                    angular.copy(s.task.levelEdit, s.task.tempEdit);
                    s.flow.goToHome();
                } else if (s.task.page.name === s.create_name) {
                    s.task.levelCreate = {};
                    s.flow.goToHome();
                }
            }

        });


        s.$on(s.flow.event.getRefreshId(), function () {
            if (s.dtInstance) {
                s.dtInstance.reloadData();
            }
        });

        s.task.page.load = function (data, source) {
            var page = this.name;
            if (s.edit_name === page) {
                if (!s.task.levelEdit.id || source === 'refresh') {
                    s.task.levelEdit = data;
                    angular.copy(s.task.levelEdit, s.task.tempEdit);
                }
            } else if (s.home === page) {
                if (s.dtInstance) {
                    s.dtInstance.reloadData();
                }
            }
        };

        s.deleteConfirm = function () {
            s.flow.action('delete', s.task.levelEdit, s.task.levelEdit.id);
            fm.hide(s.flow.getElementFlowId('levelDeleteModal'));
            if (s.task.page.name !== s.home) {
                s.flow.goToHome();
            }
            if (s.dtInstance) {
                s.dtInstance.reloadData();
            }
        };

        s.deleteCancel = function () {
            fm.hide(s.flow.getElementFlowId('levelDeleteModal'));
        };

    }
})();
