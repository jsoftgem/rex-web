(function () {
    'use strict';
    angular.module('war.activity')
        .controller('dailyEditCtl', DailyEditCtl);
    DailyEditCtl.$inject = ['$scope', 'userProfile'];
    function DailyEditCtl(s, up) {
        activate();
        function activate() {
            s.task.isEnabled = isEnabled;
            if (s.task.origin) {
                s.task.tempEdit = {};
                s.flow.pageCallBack = function (page, data, source) {
                    console.info(page, data);
                    if ('daily_edit' === page) {
                        console.info('daily_edit', data);
                        if (!s.task.modelEdit.id || source === 'refresh') {
                            s.task.modelEdit = data;
                            angular.copy(s.task.modelEdit, s.task.tempEdit);
                        }
                    }
                };
            }
            s.save = function () {
                if (!angular.equals(s.task.modelEdit, s.task.tempEdit)) {
                    s.flow.action('put', s.task.modelEdit, s.task.modelEdit.id);
                } else {
                    s.flow.message.info(UI_MESSAGE_NO_CHANGE);
                }
            };
            s.$on(s.flow.event.getSuccessEventId(), function (event, data, method) {
                console.info('daily_edit_getSuccessEventId', data + '-' + method);

                if (method === 'put') {
                    if (s.task.origin) {
                        s.task.close();
                        s.flow.navToTask(s.task.origin);
                        s.task.origin.refresh();
                    } else {
                        if (s.task.page.name === s.task.edit_name) {
                            s.task.modelEdit = {};
                            angular.copy(s.task.modelEdit, s.task.tempEdit);
                            s.flow.goToHome();
                        } else if (s.task.page.name === s.task.create_name) {
                            s.task.modelCreate = {};
                            s.flow.goToHome();
                        }
                    }

                }
            });
        }

        function isEnabled(date) {
            return !isPastWeek(date) || (up.isAdmin() || up.isManager() || up.isGeneralManager());
        }

    }
})();
