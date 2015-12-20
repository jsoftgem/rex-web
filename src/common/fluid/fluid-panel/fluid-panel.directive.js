(function () {
    'use strict';
    angular.module('war.commons')
        .directive('flowPanel', FlowPanel);

    FlowPanel.$inject = ['flowFrameService', 'flowHttpService', '$compile', 'flowMessageService', '$rootScope', '$q',
        '$timeout', 'sessionService'];

    function FlowPanel(f, f2, c, ms, rs, q, t, ss) {
        return {
            scope: {task: '='},
            restrict: 'E',
            templateUrl: 'src/templates/fluid/fluidPanel.html',
            replace: true,
            link: {
                pre: function (scope, element) {
                    /* Initialize variables*/

                    element.ready(function () {
                        $('.frame-content').scrollTo(element, 200);
                    });
                    scope.pathRegexPattern = /{[\w|\d]*}/;
                    scope.generateUrl = function (url, param) {
                        if (isJson(param)) {
                            param = JSON.parse(param);
                        }
                        for (var key in param) {
                            if (param.hasOwnProperty(key)) {
                                var reg = new RegExp('{' + key + '}', 'g');
                                url = url.replace(reg, param[key]);
                            }
                        }
                        return url;
                    };

                    scope.flowFrameService = f;
                    console.info('fullScreen', scope.flowFrameService.fullScreen);
                    console.info('fluidPanel-task', scope.task);
                    scope.userTask = {};
                    scope.userTask.closed = false;
                    scope.flow = {};
                    scope.task.toolbars = [
                        {
                            'id': 'home',
                            'glyph': 'fa fa-home',
                            'label': 'home',
                            'disabled': false,
                            'uiType': 'info',
                            'action': function () {
                                scope.flow.goToHome();
                            }
                        },
                        {
                            'id': 'back',
                            'glyph': 'fa fa-arrow-left',
                            'label': 'back',
                            'disabled': true,
                            'uiType': 'info',
                            'action': function () {
                                if (scope.task.navPages.length > 0 && scope.task.navPages.length > scope.currentPageIndex) {
                                    var i = --scope.currentPageIndex;
                                    var count = scope.task.navPages.length - (i + 1);
                                    var page = scope.task.navPages[i];
                                    scope.task.navPages.splice((i + 1), count);
                                    scope.flow.navTo(page.name);
                                } else {
                                    this.disabled = true;
                                }
                            }
                        },
                        {
                            'id': 'forward',
                            'glyph': 'fa fa-arrow-right',
                            'label': 'forward',
                            'disabled': true,
                            'uiType': 'info',
                            'action': function () {
                                if (scope.task.navPages.length - 1 > scope.currentPageIndex) {
                                    var page = scope.task.navPages[++scope.currentPageIndex];
                                    scope.flow.navTo(page.name);
                                } else {
                                    this.disabled = true;
                                }
                            }
                        }
                    ];

                    /* Page Event */
                    scope.flow.event = {};

                    scope.flow.message = {};

                    scope.flow.message.duration = 3000;
                    scope.http = {};
                    scope.currentPageIndex = 0;
                    /*   scope.flow.pageCallBack = function (page, data) {
                     console.info('generic callBack', page);
                     };*/
                    scope.flow.onPageChanging = function (page, param) {
                        return true;
                    };

                    scope.flow.onRefreshed = function () {
                    };
                    scope.flow.onOpenPinned = function (page, param) {

                    };

                    scope.flow.navToTask = function (task) {

                        var $index = {index: 0};

                        angular.forEach(f.taskList, function (tsk, index) {
                            if (tsk.id === task.id) {
                                this.index = index;
                            }
                        }, $index);

                        t(function () {
                            $('.frame-content').scrollTo($('div.box[task]:eq(' + $index.index + ') div'), 200);
                        });
                    };

                    scope.flow.openTaskBaseUrl = 'services/flow_task_service/getTask?';

                    scope.flow.openTask = function (name, page, param, newTask, origin, size) {

                        var url = scope.flow.openTaskBaseUrl;

                        if (size) {
                            url += 'size=' + size + '&'
                        } else {
                            url += 'size=100&'
                        }

                        url += 'active=true&name=' + name;
                        if (page) {

                            url += '&page=' + page;
                        }
                        if (param) {
                            url += '&page-path=' + param;
                        }

                        if (newTask) {
                            url += '&newTask=' + newTask;
                        }
                        console.info('openTask', url);

                        f.addTask(url, origin ? origin : scope.task, true);
                    };

                    var parent = element.parent();
                    /***********/


                    /* Getters for IDs */

                    scope.flow.getHomeUrl = function () {
                        return f2.host + scope.homeUrl;
                    };

                    scope.flow.getElementFlowId = function (id) {
                        return id + '_' + scope.task.id;
                    };

                    scope.flow.getEventId = function (id) {
                        return id + '_fp_' + scope.task.id;
                    };

                    scope.flow.event.getResizeEventId = function () {
                        return scope.flow.getEventId('rsz_evt_id_');
                    };

                    scope.flow.event.getPageCallBackEventId = function () {
                        return 'task_flow_page_call_back_event_id_' + scope.task.id;
                    };

                    scope.flow.event.getOnTaskLoadedEventId = function () {
                        return scope.flow.getEventId('on_ld_tsk_evt_id_');
                    };

                    scope.flow.event.getGoToEventId = function () {
                        return goToEventID + scope.task.id;
                    };

                    scope.flow.event.getRefreshId = function () {
                        return scope.flow.getEventId('tsk_rfh_id_');
                    };

                    scope.flow.event.getSuccessEventId = function () {
                        return scope.flow.getEventId('suc_evt_id_');
                    };

                    scope.flow.event.getErrorEventId = function () {
                        return scope.flow.getEventId('err_evt_id_');
                    };

                    /********************/


                    /* Integrated Alerts */
                    var messageId = scope.flow.getElementFlowId('pnl_msg');

                    scope.flow.message.info = function (msg) {
                        ms.info(messageId, msg, scope.flow.message.duration).open();
                    };

                    scope.flow.message.warning = function (msg) {
                        ms.warning(messageId, msg, scope.flow.message.duration).open();
                    };

                    scope.flow.message.danger = function (msg) {
                        ms.danger(messageId, msg, scope.flow.message.duration).open();
                    };

                    scope.flow.message.success = function (msg) {
                        ms.success(messageId, msg, scope.flow.message.duration).open();
                    };

                    /*********************/


                    /* Controls */
                    scope.flow.controls = undefined; //register controls


                    /* HTTP API */
                    scope.http.get = function (url, param) {
                        if (param) {
                            if (url.search(scope.pathRegexPattern) > 0) {
                                url = scope.generateUrl(url, param);
                            } else {
                                url = url + param;
                            }

                        }
                        return f2.get(url, scope.task);
                    };

                    scope.http.delete = function (url, param) {
                        if (param) {
                            if (url.search(scope.pathRegexPattern) > 0) {
                                url = scope.generateUrl(url, param);
                            } else {
                                url = url + param;
                            }
                        }
                        return f2.delete(url, scope.task);
                    };

                    scope.http.post = function (url, data, param) {
                        if (param) {
                            if (url.search(scope.pathRegexPattern) > 0) {
                                url = scope.generateUrl(url, param);
                            } else {
                                url = url + param;
                            }
                        }
                        return f2.post(url, data, scope.task);
                    };

                    scope.http.put = function (url, data, param) {
                        if (param) {
                            if (url.search(scope.pathRegexPattern) > 0) {
                                url = scope.generateUrl(url, param);
                            } else {
                                url = url + param;
                            }
                        }
                        return f2.put(url, data, scope.task);
                    };

                    /*********************/

                    /* Action */

                    scope.loadProperties = function () {
                        if (scope.flow.controls) {
                            angular.forEach(scope.flow.controls, function (control) {
                                if (control.pages) {
                                    scope.flow.addControl(control, control.pages);
                                }
                            });
                        }
                    };
                    scope.loadGet = function () {
                        //adds control for page
                        if (!rs.$$phase) {
                            scope.$apply();
                        }

                        if (scope.task.prevPage) {
                            if (scope.task.prevPage.destroy) {
                                scope.task.prevPage.destroy();
                            }
                        }


                        console.info('autoget-page', scope.task.page);
                        return q(function (resolve, reject) {
                            if ((scope.task.page !== undefined && scope.task.page !== null) && (scope.task.page.autoGet !== null && scope.task.page.autoGet === true)) {
                                scope.task.currentPage = scope.task.page.name;
                                var url = scope.homeUrl;
                                if (scope.task.page.getParam) {
                                    if (scope.homeUrl.search(scope.pathRegexPattern) > 0) {
                                        url = scope.generateUrl(scope.homeUrl, scope.task.page.getParam);
                                    } else {
                                        url = scope.homeUrl + scope.task.page.getParam;
                                    }
                                }
                                f2.get(url, scope.task)
                                    .success(function (data) {
                                        console.info('autoget', data);
                                        resolve({page: scope.task.page.name, value: data});
                                    });
                            } else if ((scope.task.page !== undefined && scope.task.page !== null) && (scope.task.page.autoGet === null || scope.task.page.autoGet === false)) {
                                scope.task.currentPage = scope.task.page.name;
                                console.info('autoget false', false);
                                resolve({page: scope.task.page.name});
                            }
                        }).then(function (data) {
                            scope.task.pageLoaded = true;
                            var pagePanel = element.find('.flow-panel-page');
                            console.info('page-panel', pagePanel);
                            console.info('page-panel-task', scope.task);
                            pagePanel.html('<fluid-include url="{{task.page.home}}" name="{{flow.getElementFlowId(task.page.name)}}" taskid="{{task.id}}"></fluid-include>');
                            c(pagePanel.contents())(scope);
                            scope.onLoad = function () {
                                if (scope.task.pinned) {
                                    scope.task.loaded = true;
                                    scope.flow.onOpenPinned(scope.task.page, scope.task.pageParam);
                                } else {

                                    if (!scope.task.page.load && scope.flow.pageCallBack) {
                                        scope.flow.pageCallBack(data.page, data.value);
                                        if (!rs.$$phase) {
                                            scope.$apply();
                                        }
                                        scope.task.loaded = true;
                                    } else {
                                        if (scope.task.page.load) {
                                            scope.task.page.load(data.value);
                                        }
                                        if (!rs.$$phase) {
                                            scope.$apply();
                                        }

                                        scope.task.loaded = true;
                                    }

                                }

                                scope.loadProperties();
                                console.debug('loadProperties', scope.task);
                            };
                        }, function (response) {
                            scope.task.pageLoaded = true;
                            scope.task.loaded = true;
                            var pagePanel = element.find('.flow-panel-page');
                            pagePanel.html('<fluid-include url="{{task.page.home}}" name="{{flow.getElementFlowId(task.page.name)}}" taskid="{{task.id}}"></fluid-include>');
                            c(pagePanel.contents())(scope);
                        });
                    };


                    scope.$on(EVENT_PAGE_SUCCESS, function (event, name, taskId) {
                        var current = scope.flow.getElementFlowId(scope.task.page.name);
                        if (taskId === scope.task.id && !scope.task.loaded) {
                            if (scope.task.preLoaded === undefined || scope.task.preLoaded === false) {
                                scope.task.preLoad();
                                scope.task.preLoaded = true;
                            }
                            if (scope.task.preLoaded) {
                                scope.task.load();
                                scope.task.loaded = true;
                            }
                            scope.task.postLoad();
                        }
                        if (name === current) {
                            if (scope.onLoad) {
                                scope.onLoad();
                            } else {
                                scope.loadProperties();
                            }

                            scope.task.taskLoadRetryCount = 0;
                        }
                    });

                    scope.flow.addControl = function (control, pageName) {
                        var exists = false;

                        angular.forEach(scope.task.toolbars, function (ctl) {
                            if (control.id === ctl.id) {
                                exists = true;
                            }
                        });

                        if (Array.isArray(pageName)) {

                            var index = pageName.indexOf(scope.task.page.name);
                            if (index > -1) {
                                if (!exists) {
                                    scope.task.toolbars.push(control);
                                }
                            } else {
                                if (exists) {
                                    for (var t = scope.task.toolbars.length - 1; t > 0; t--) {
                                        var toolbar = scope.task.toolbars[t];
                                        if (toolbar.id === control.id) {
                                            scope.task.toolbars.splice(t, 1);
                                        }
                                    }
                                }

                            }
                        }

                        else if (scope.task.page.name === pageName) {
                            if (!exists) {
                                scope.task.toolbars.push(control);
                            }
                        } else if (exists) {
                            for (var t = scope.task.toolbars.length - 1; t > 0; t--) {
                                var toolbar = scope.task.toolbars[t];
                                if (toolbar.id === control.id) {
                                    scope.task.toolbars.splice(t, 1);
                                    break;
                                }
                            }

                        }
                    };
                    scope.navToPage = function (name) {
                        return q(function (resolve) {
                            angular.forEach(scope.task.navPages, function (page) {
                                if (name === page.name) {
                                    scope.task.prevPage = scope.task.page;
                                    scope.task.page = page;

                                    var uri = page.get;

                                    if (scope.task.page.param !== undefined && scope.task.page.param != null) {
                                        if (uri.search(scope.pathRegexPattern) > 0) {
                                            uri = scope.generateUrl(uri, scope.task.page.param);
                                        } else {
                                            uri = uri + scope.task.page.param;
                                        }
                                    }

                                    scope.homeUrl = uri;

                                    if (scope.task.pinned === true) {
                                        scope.userTask.page = scope.task.page.name;
                                        scope.userTask.param = scope.task.page.param;

                                        if (scope.task.generic === false) {
                                            if (scope.task.id.indexOf('gen') === -1) {
                                                scope.userTask.flowTaskId = scope.task.id.split('_')[0];
                                                scope.userTask.flowId = scope.task.flowId;
                                                scope.userTask.pinned = scope.task.pinned;
                                                f2.post('services/flow_user_task_crud/save_task_state?field=pin', scope.userTask, scope.task);
                                            }
                                        }
                                    }

                                    for (var i = 0; i < scope.task.navPages.length; i++) {
                                        if (scope.task.navPages[i].name === name) {
                                            scope.currentPageIndex = i;
                                            break;
                                        }
                                    }

                                    for (var i = 0; i < scope.task.toolbars.length; i++) {
                                        if (scope.task.toolbars[i].id === 'back') {
                                            scope.task.toolbars[i].disabled = !(scope.currentPageIndex > 0);
                                        }
                                        if (scope.task.toolbars[i].id === 'forward') {
                                            scope.task.toolbars[i].disabled = !(scope.currentPageIndex < scope.task.navPages.length - 1);
                                        }
                                    }
                                    resolve();
                                }
                            });
                        });
                    };
                    scope.flow.navTo = function (name) {
                        if (scope.flow.onPageChanging(name)) {
                            return scope.navToPage(name).then(scope.loadGet());
                        }
                    };
                    scope.getToPage = function (name, param) {
                        console.info('getToPage', scope.task.pages);
                        return q(function (resolve, reject) {
                            angular.forEach(scope.task.pages, function (page) {
                                    if (name === page.name) {
                                        scope.task.prevPage = {};
                                        angular.copy(scope.task.page, scope.task.prevPage);
                                        scope.task.page = page;
                                        var uri = page.get;

                                        if (param !== undefined && param !== 'null') {

                                            page.param = param;
                                            if (uri.search(scope.pathRegexPattern) > 0) {
                                                uri = scope.generateUrl(uri, param);
                                            } else {
                                                uri = uri + param;
                                            }
                                        } else if (page.param) {
                                            if (uri.search(scope.pathRegexPattern) > 0) {
                                                uri = scope.generateUrl(uri, param);
                                            } else {
                                                uri = uri + param;
                                            }
                                        }


                                        scope.homeUrl = uri;

                                        if (scope.task.pinned === true) {
                                            scope.userTask.page = scope.task.page.name;
                                            scope.userTask.param = scope.task.page.param;

                                            if (scope.task.generic === false) {
                                                if (scope.task.id.indexOf('gen') === -1) {
                                                    scope.userTask.flowTaskId = scope.task.id.split('_')[0];
                                                    scope.userTask.flowId = scope.task.flowId;
                                                    scope.userTask.pinned = scope.task.pinned;
                                                    f2.post('services/flow_user_task_crud/save_task_state?field=pin', scope.userTask, scope.task);
                                                }
                                            }
                                        }


                                        var contains = false;

                                        for (var i = 0; i < scope.task.navPages.length; i++) {
                                            if (scope.task.navPages[i].name === name) {
                                                contains = true;
                                                scope.currentPageIndex = i;
                                                break;
                                            }
                                        }

                                        if (contains === false) {
                                            scope.task.navPages.push(page);
                                            scope.currentPageIndex = scope.task.navPages.length - 1;
                                        }

                                        for (var i = 0; i < scope.task.toolbars.length; i++) {
                                            if (scope.task.toolbars[i].id === 'back') {
                                                scope.task.toolbars[i].disabled = !(scope.currentPageIndex > 0);
                                            }
                                            if (scope.task.toolbars[i].id === 'forward') {
                                                scope.task.toolbars[i].disabled = !(scope.currentPageIndex < scope.task.navPages.length - 1);
                                            }
                                        }
                                        resolve();
                                    }
                                }
                            )
                        });
                    };
                    scope.flow.goTo = function (name, param) {
                        console.info('goTo', name);
                        if (scope.flow.onPageChanging(name, param)) {
                            return scope.getToPage(name, param).then(scope.loadGet());
                        }
                    };

                    scope.$watch(function (scope) {
                            return scope.task.currentPage;
                        },
                        function (newValue) {
                            if (newValue) {
                                scope.flow.goTo(newValue.name, newValue.param);
                            }
                        });

                    scope.flow.action = function (method, data, param) {
                        if (method) {
                            var uri = "";
                            if (method.toLowerCase() === 'put') {
                                uri = scope.task.page.put;
                                if (param !== undefined && param !== 'null') {
                                    if (uri.search(scope.pathRegexPattern) > 0) {
                                        uri = scope.generateUrl(uri, param);
                                    } else {
                                        uri = uri + param;
                                    }
                                }
                                f2.put(uri, data, scope.task)
                                    .success(function (rv) {
                                        rs.$broadcast(scope.flow.event.getSuccessEventId(), rv, method);
                                    })
                                    .error(function (data) {
                                        if (data) {
                                            scope.flow.message.danger(data.msg);
                                        } else {
                                            scope.flow.message.danger('Error creating request to ' + uri);
                                        }

                                        rs.$broadcast(scope.flow.event.getErrorEventId(), data, method);
                                    });

                            } else if (method.toLowerCase() === 'get') {
                                uri = scope.task.page.get;
                                if (param !== undefined && param !== 'null') {
                                    if (uri.search(scope.pathRegexPattern) > 0) {
                                        uri = scope.generateUrl(uri, param);
                                    } else {
                                        uri = uri + param;
                                    }
                                }
                                f2.get(uri, scope.task)
                                    .success(function (rv) {
                                        if (rv) {
                                            if (rv.msg) {
                                                scope.flow.message.success(rv.msg);
                                            }
                                        }
                                        rs.$broadcast(scope.flow.event.getSuccessEventId(), rv, method);
                                    })
                                    .error(function (data) {
                                        if (data) {
                                            scope.flow.message.danger(data.msg);
                                        }
                                        rs.$broadcast(scope.flow.event.getErrorEventId(), data, method);
                                    });

                            } else if (method.toLowerCase() === 'delete') {
                                uri = scope.task.page.delURL;
                                if (param !== undefined && param !== 'null') {
                                    if (uri.search(scope.pathRegexPattern) > 0) {
                                        uri = scope.generateUrl(uri, param);
                                    } else {
                                        uri = uri + param;
                                    }
                                }
                                f2.delete(uri, scope.task)
                                    .success(function (rv) {
                                        if (rv) {
                                            if (rv) {
                                                if (rv.msg) {
                                                    scope.flow.message.success(rv.msg);
                                                }
                                            }
                                            rs.$broadcast(scope.flow.event.getSuccessEventId(), rv, method);
                                        }
                                    })
                                    .error(function (data) {
                                        if (data) {
                                            scope.flow.message.danger(data.msg);
                                        }
                                        rs.$broadcast(scope.flow.event.getErrorEventId(), data, method);
                                    });
                            } else if (method.toLowerCase() === 'post') {
                                uri = scope.task.page.post;

                                if (param !== undefined && param !== 'null') {
                                    if (uri.search(scope.pathRegexPattern) > 0) {
                                        uri = scope.generateUrl(uri, param);
                                    } else {
                                        uri = uri + param;
                                    }
                                }

                                f2.post(uri, data, scope.task)
                                    .success(function (rv) {
                                        if (rv) {
                                            if (rv.msg) {
                                                scope.flow.message.success(rv.msg);
                                            }
                                        }
                                        rs.$broadcast(scope.flow.event.getSuccessEventId(), rv, method);
                                    })
                                    .error(function (data) {
                                        if (data) {
                                            scope.flow.message.danger(data.msg);
                                        }
                                        rs.$broadcast(scope.flow.event.getErrorEventId(), data, method);
                                    });
                            }

                        }

                    };

                    scope.flow.goToHome = function () {
                        angular.forEach(scope.task.pages, function (page) {
                            if (page.isHome) {
                                scope.task.page = page;
                                scope.homeUrl = page.get;

                                if (page.param) {
                                    scope.homeUrl = scope.homeUrl + page.param;
                                }

                                for (var i = 0; i < scope.task.toolbars.length; i++) {
                                    if (scope.task.toolbars[i].id === 'back') {
                                        scope.task.toolbars[i].disabled = true;
                                    }
                                    if (scope.task.toolbars[i].id === 'forward') {
                                        scope.task.toolbars[i].disabled = true;
                                    }
                                }
                                scope.currentPageIndex = 0;
                                scope.task.navPages = [page];

                                scope.loadGet();
                            }
                        });

                    };

                    /*********************/

                    /*Instance creation*/


                    scope.$watch(function (scope) {
                        return scope.task;
                    }, function (task) {
                        if (task) {
                            if (task.generic) {
                                scope.task.page = undefined;
                                console.info('flow-panel-session', ss);
                                scope.baseTask = ss.getSessionProperty(scope.task.url);

                                if (scope.baseTask) {
                                    console.info('flow-panel-base-task-cache', scope.baseTask);
                                    var newTask = scope.task.newTask;
                                    var $task = {};
                                    scope.copy = {};
                                    angular.copy(scope.task, scope.copy);
                                    console.info('flow-panel-cache-task', scope.baseTask);
                                    if (!f.fullScreen) {

                                        angular.forEach(f.taskList, function (task, key) {

                                            if (task.id === scope.task.id) {
                                                this.task = task;
                                                this.index = key;
                                            }

                                        }, $task);

                                        f.taskList[$task.index] = f.buildTask(scope.baseTask);
                                        f.taskList[$task.index].id = f.taskList[$task.index].id + '_' + $task.index;
                                        f.taskList[$task.index].origin = scope.task.origin;
                                        scope.task = f.taskList[$task.index];
                                    } else {
                                        scope.task = f.buildTask(scope.baseTask);
                                        scope.task.id = 'fullscreen_' + scope.baseTask.id;
                                    }
                                    scope.task.generic = false;
                                    scope.task.newTask = newTask;
                                    scope.task.flowHttpService = f2;
                                } else {
                                    console.info('flow-panel-base-task-new', scope.baseTask);
                                    f2.get(scope.task.url, scope.task).success(function (d) {
                                        ss.addSessionProperty(scope.task.url, d);
                                        var newTask = scope.task.newTask;
                                        var $task = {};
                                        scope.copy = {};
                                        angular.copy(scope.task, scope.copy);
                                        console.info('generated-taskp', d);
                                        if (!f.fullScreen) {

                                            angular.forEach(f.taskList, function (task, key) {

                                                if (task.id === scope.task.id) {
                                                    this.task = task;
                                                    this.index = key;
                                                }

                                            }, $task);

                                            f.taskList[$task.index] = f.buildTask(d);
                                            f.taskList[$task.index].id = f.taskList[$task.index].id + '_' + $task.index;
                                            f.taskList[$task.index].origin = scope.task.origin;
                                            scope.task = f.taskList[$task.index];
                                        } else {
                                            scope.task = f.buildTask(d);
                                            scope.task.id = 'fullscreen_' + d.id;
                                        }
                                        scope.task.generic = false;
                                        scope.task.newTask = newTask;
                                        scope.task.flowHttpService = f2;
                                        console.info('task-initialization-finished', scope.task);
                                        console.info('generated-task-pages', scope.task.pages);
                                    });
                                }
                            }
                        }

                    });

                    /*********************/

                },
                post: function (scope, element) {

                    var parent = element.parent();

                    scope.$on(scope.flow.getEventId('navTo'), function (event, name) {
                        scope.flow.navTo(name);
                    });

                    scope.$on(scope.flow.getEventId('selectPage'), function (event, name) {
                        var i = scope.currentPageIndex;
                        for (var index = 0; i < scope.task.navPages.length; i++) {
                            if (scope.task.navPages[index].name == name) {
                                i = index;
                                break;
                            }
                        }
                        var count = scope.task.navPages.length - (i + 1);
                        var page = scope.task.navPages[i];
                        scope.task.navPages.splice((i + 1), count);
                        scope.flow.navTo(name);
                        scope.task.page = page;
                    });

                    scope.$on(scope.flow.event.getGoToEventId(), function (event, name, param) {
                        scope.flow.goTo(name, param);
                    });

                    scope.$on(scope.flow.event.getOnTaskLoadedEventId(), function (event) {

                    });

                    /*scope.$on(scope.flow.event.getPageCallBackEventId, function (event, page, data) {
                     scope.flow.pageCallBack(page, data);
                     });*/

                    scope.$on(EVENT_NOT_ALLOWED + scope.task.id, function (event, msg) {
                        scope.flow.message.danger(msg);
                        angular.forEach(scope.task.navPages, function (page, key) {

                            if (page.name === scope.task.navPages.name) {
                                scope.task.navPages.splice(key, 1);
                                scope.flow.goTo(scope.task.prevPage.name);
                            }
                        });

                    });

                    /*******************/


                    /* Post creation */


                    scope.$watch(function (scope) {
                        if (scope.task) {
                            return scope.task;
                        }
                    }, function (task) {
                        if (task) {
                            console.info('post-task-watcher', task);
                            if (task.generic === false) {

                                t(function () {
                                    generateTask(scope, t, f2);
                                });

                                scope.task.refresh = function () {
                                    if (scope.task.page.autoGet) {
                                        scope.task.loaded = false;
                                        f2.get(scope.homeUrl, scope.task)
                                            .success(function (data) {
                                                if (scope.task.page.load) {
                                                    scope.task.page.load(data, 'refresh');
                                                }
                                                if (scope.flow.pageCallBack) {
                                                    scope.flow.pageCallBack(scope.task.page.name, data, 'refresh');
                                                }
                                                scope.task.loaded = true;
                                            })
                                            .error(function (data) {
                                                scope.task.loaded = true;
                                            });
                                    } else {
                                        rs.$broadcast(scope.flow.event.getRefreshId());
                                        scope.flow.onRefreshed();
                                    }
                                };
                                scope.task.max25 = function (clientState) {
                                    scope.task.size = 25;
                                    parent.removeClass('col-lg-12');
                                    parent.removeClass('col-lg-8');
                                    parent.removeClass('col-lg-6');
                                    parent.addClass('col-lg-4');
                                    if (clientState === undefined || clientState === false) {
                                        if (scope.task.page && scope.task) {
                                            rs.$broadcast(scope.flow.event.getResizeEventId(), scope.task.page.name, scope.task.size);
                                        }
                                        scope.userTask.size = scope.task.size;
                                        if (scope.task.generic === false) {
                                            if (scope.task.id.indexOf('gen') === -1) {
                                                scope.userTask.flowTaskId = scope.task.id.split('_')[0];
                                                scope.userTask.flowId = scope.task.flowId;
                                                f2.post('services/flow_user_task_crud/save_task_state?field=size', scope.userTask, scope.task)
                                                    .then(function () {
                                                        t(function () {
                                                            generateTask(scope, t, f2);
                                                        });
                                                    });
                                            }
                                        }
                                    }

                                };
                                scope.task.max50 = function (clientState) {
                                    scope.task.size = 50;
                                    parent.removeClass('col-lg-12');
                                    parent.removeClass('col-lg-8');
                                    parent.removeClass('col-lg-4');
                                    parent.addClass('col-lg-6');
                                    if (clientState === undefined || clientState === false) {
                                        if (scope.task.page && scope.task) {
                                            rs.$broadcast(scope.flow.event.getResizeEventId(), scope.task.page.name, scope.task.size);
                                        }
                                        scope.userTask.size = scope.task.size;
                                        if (scope.task.generic === false) {
                                            if (scope.task.id.indexOf('gen') === -1) {
                                                scope.userTask.flowTaskId = scope.task.id.split('_')[0];
                                                scope.userTask.flowId = scope.task.flowId;
                                                f2.post('services/flow_user_task_crud/save_task_state?field=size', scope.userTask, scope.task)
                                                    .then(function () {
                                                        t(function () {
                                                            generateTask(scope, t, f2);
                                                        });
                                                    });
                                            }
                                        }
                                    }
                                };
                                scope.task.max75 = function (clientState) {
                                    scope.task.size = 75;
                                    parent.removeClass('col-lg-12');
                                    parent.removeClass('col-lg-6');
                                    parent.removeClass('col-lg-4');
                                    parent.addClass('col-lg-8');
                                    if (clientState === undefined || clientState === false) {
                                        if (scope.task.page && scope.task) {
                                            rs.$broadcast(scope.flow.event.getResizeEventId(), scope.task.page.name, scope.task.size);
                                        }
                                        scope.userTask.size = scope.task.size;
                                        if (scope.task.generic === false) {
                                            if (scope.task.id.indexOf('gen') === -1) {
                                                scope.userTask.flowTaskId = scope.task.id.split('_')[0];
                                                scope.userTask.flowId = scope.task.flowId;
                                                f2.post('services/flow_user_task_crud/save_task_state?field=size', scope.userTask, scope.task);
                                                console.log('max75');
                                            }
                                        }
                                    }

                                };
                                scope.task.max100 = function (clientState) {
                                    scope.task.size = 100;
                                    parent.removeClass('col-lg-8');
                                    parent.removeClass('col-lg-6');
                                    parent.removeClass('col-lg-4');
                                    parent.addClass('col-lg-12');
                                    if (clientState === undefined || clientState === false) {
                                        if (scope.task.page && scope.task) {
                                            rs.$broadcast(scope.flow.event.getResizeEventId(), scope.task.page.name, scope.task.size);
                                        }
                                        scope.userTask.size = scope.task.size;
                                        if (scope.task.generic === false) {
                                            if (scope.task.id.indexOf('gen') === -1) {
                                                scope.userTask.flowTaskId = scope.task.id.split('_')[0];
                                                scope.userTask.flowId = scope.task.flowId;
                                                f2.post('services/flow_user_task_crud/save_task_state?field=size', scope.userTask, scope.task)
                                                    .then(function () {
                                                        t(function () {
                                                            generateTask(scope, t, f2);
                                                        });
                                                    });

                                            }
                                        }
                                    }
                                };
                                scope.task.hide = function () {
                                    if (scope.task.onWindowHiding(scope.task.page)) {
                                        if (scope.flowFrameService.fullScreen) {
                                            scope.task.fluidScreen();
                                        }
                                        scope.task.active = false;
                                        scope.userTask.active = scope.task.active;
                                        if (scope.task.generic === false) {
                                            if (scope.task.id.indexOf('gen') === -1) {
                                                scope.userTask.flowTaskId = scope.task.id.split('_')[0];
                                                scope.userTask.flowId = scope.task.flowId;
                                                f2.post('services/flow_user_task_crud/save_task_state?field=active', scope.userTask, scope.task);

                                            }

                                        }
                                    }

                                };
                                scope.task.close = function () {
                                    if (scope.task.onWindowClosing(scope.task.page)) {

                                        if (scope.task.generic === false) {
                                            if (scope.task.id.indexOf('gen') === -1) {
                                                scope.userTask.closed = true;
                                                scope.userTask.flowTaskId = scope.task.id.split('_')[0];
                                                scope.userTask.flowId = scope.task.flowId;
                                                f2.post('services/flow_user_task_crud/save_task_state?field=close', scope.userTask, scope.task)
                                                    .success(function (data) {
                                                        for (var i = 0; i < f.taskList.length; i++) {
                                                            var task = f.taskList[i];
                                                            if (scope.task.id === task.id) {
                                                                f.taskList.splice(i, 1);
                                                            }
                                                            if (scope.flowFrameService.fullScreen) {
                                                                scope.task.fluidScreen();
                                                            }
                                                            if (!rs.$$phase) {
                                                                scope.$apply();
                                                            }
                                                        }
                                                    })
                                                    .error(function (data) {

                                                    })
                                                    .then(function (data) {
                                                        scope.$destroy();
                                                    });

                                            }
                                        }
                                    }

                                };
                                scope.task.pin = function () {
                                    scope.task.pinned = !scope.task.pinned;
                                    if (scope.task.pinned === true) {
                                        scope.userTask.page = scope.task.page.name;
                                        scope.userTask.param = scope.task.page.param;
                                        scope.task.onWindowPinned(scope.task.page);
                                    } else {
                                        scope.userTask.page = "";
                                        scope.userTask.param = "";
                                    }

                                    if (scope.task.generic === false) {
                                        if (scope.task.id.indexOf('gen') === -1) {
                                            scope.userTask.flowTaskId = scope.task.id.split('_')[0];
                                            scope.userTask.flowId = scope.task.flowId;
                                            scope.userTask.pinned = scope.task.pinned;
                                            f2.post('services/flow_user_task_crud/save_task_state?field=pin', scope.userTask, scope.task);
                                        }
                                    }
                                };
                                scope.task.fullScreen = function () {
                                    f.toggleFullscreen(scope.task);
                                    if (!rs.$$phase) {
                                        scope.$apply();
                                    }
                                };
                                scope.task.fluidScreen = function () {
                                    f.toggleFluidscreen();
                                    if (!rs.$$phase) {
                                        scope.$apply();
                                    }
                                };
                                if (scope.task && !scope.flowFrameService.fullscreen) {
                                    if (scope.task.size) {
                                        if (scope.task.size == '25') {
                                            scope.task.max25(true);
                                        } else if (scope.task.size == '50') {
                                            scope.task.max50(true);
                                        } else if (scope.task.size == '75') {
                                            scope.task.max75(true);
                                        } else if (scope.task.size == '100') {
                                            scope.task.max100(true);
                                        }
                                    }
                                }
                            }


                            if (scope.flowFrameService.fullScreen) {
                                parent.addClass('col-lg-12');
                                parent.removeClass('col-lg-8');
                                parent.removeClass('col-lg-4');
                                parent.removeClass('col-lg-6');
                            }
                        }

                    });


                    scope.$watch(function (scope) {
                        return (!scope.task.generic && scope.flowFrameService.fullScreen);
                    }, function (fullScreen) {
                        if (fullScreen) {
                            var height = window.innerHeight;
                            height = estimateHeight(height) - 50;
                            var panel = $('#_id_fp_' + scope.task.id + '.portlet');
                            var panelBody = panel.find('.portlet-body');
                            panel.height(height);
                            var headerHeight = panel.find('div.portlet-header').height();
                            panelBody.height(height - headerHeight);
                            panelBody.css('overflow', 'auto');
                        }
                        if (scope.task.generic === false) {
                            scope.task.loaded = false;
                            var loadGetFn = function () {
                                if (scope.task) {
                                    scope.task.preLoad();
                                    scope.task.preLoaded = true;

                                    scope.loadGet();
                                    if (scope.task.preLoaded) {
                                        scope.task.load();

                                        scope.task.loaded = true;
                                    }
                                    scope.task.postLoad();
                                }
                            };

                            loadGetFn();
                        }

                    });

                    $(window).on('resize', function () {
                        if (scope.flowFrameService.fullScreen) {
                            var height = window.innerHeight;

                            height = estimateHeight(height) - 50;

                            scope.flowFrameService.getFrame().css('overflow', 'hidden');

                            var panel = $('#_id_fp_' + scope.task.id + '.portlet');

                            var panelBody = panel.find('.portlet-body');

                            panel.height(height);

                            var headerHeight = panel.find('div.portlet-header').height();

                            panelBody.height(height - headerHeight);

                            panelBody.css('overflow', 'auto');

                            console.info('panelBody', panelBody);

                            console.info('headerHeight', headerHeight);

                        }
                    });


                    element.ajaxStart(function () {
                        t(function () {
                            scope.task.loaded = false;
                            console.info('ajax-' + scope.task.name + 'started:', scope.task);
                        });
                    });

                    element.ajaxStop(function () {
                        t(function () {
                            scope.task.loaded = true;
                            console.info('ajax-' + scope.task.name + 'stopped:', scope.task);
                        });
                    })


                    /********************/
                }

            }

        }
    }
})();
