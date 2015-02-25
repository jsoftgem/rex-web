/**Flow Components v0.0.1
 * Created by Jerico de Guzman
 * October 2014**/
var flowComponents = angular.module("fluid", ["ngCookies", "angularFileUpload", "oc.lazyLoad"]);

flowComponents.config(["$httpProvider", function (h) {
    h.interceptors.push("flowInjector");
}]);
flowComponents.run(["$templateCache", function (tc) {
    tc.put("flowBar.html", "<div><ul class='nav navbar-nav col-lg-7 task-glyph-size'><li  ng-class=\"task.active ? 'flow-bar-icon-active':''\" ng-repeat='task in taskList | limitTo:10' ><a class='flow-bar-icon' task='task' flow-bar-tooltip tooltip-title='{{task.title}}' href='#' ng-click='open(task)'><span class='flow-bar-icon-span hidden-xs' ng-class='task.glyph'></span><p  style='text-align: left' class='hidden-lg hidden-md hidden-sm'><span ng-class='task.glyph' class='task-glyph-size'></span> <span>{{task.title}}</span></p></a></li><li class='dropdown' ng-hide='taskList.length < 11'><a href='#' class='dropdown-toggle' data-toggle='dropdown'><span class='fui-triangle-down'></span></a><ul  class='dropdown-menu flow-bar-task-collapse' style='overflow: auto'><li ng-show='$index >= 10' class='border' ng-class=\"tsk.active ? 'active':''\" ng-repeat='tsk in taskList'><a href='#' class='flow-bar-task' title='{{tsk.title}}' ng-click='open(tsk)'<p> <span ng-class='tsk.glyph' class='task-glyph-size'></span> <span>{{tsk.title}}</span></p></a></ul></li></ul></div></div>")
    tc.put("flowPanel.html", "<div id='_id_fp_{{task.id}}' class=\"panel panel-primary {{task.freeze ? 'freeze' :''}}\" ><div class='panel-heading'><a data-toggle='collapse' data-target='#_{{task.id}}' href='#' class='flow-panel-heading-title text-inverse'><span  ng-class='task.glyph'class='flow-panel-icon-control hidden-sm hidden-md hidden-xs'></span>&nbsp;{{task.title}}</a><div class='pull-right btn-group hidden-lg'><a href='#' class='dropdown-toggle' data-toggle='dropdown'><span ng-class='task.glyph'class='flow-panel-icon-control text-primary'/></a><ul class='dropdown-menu dropdown-menu-right dropdown-menu-inverse'><li><a href='#' ng-click='refresh()'>Refresh</a></li><li class='divider hidden-lg hidden-sm hidden-xs'></li><li class='hidden-lg hidden-sm hidden-xs'><a href='#' ng-click='max25()'>Maximize - 25</a> </li><li class='hidden-lg hidden-sm hidden-xs'><a href='#' ng-click='max50()'>Maximize - 50</a> </li><li class='hidden-lg hidden-sm hidden-xs'><a href='#' ng-click='max75()'>Maximize - 75</a></li><li class='hidden-lg hidden-sm hidden-xs'><a href='#' ng-click='max100()'>Maximize - 100</a> </li><li ng-class=\"task.locked ? 'hidden-sm hidden-md hidden-xs' : ''\" class='divider'></li><li><a ng-class=\"task.locked ? 'hidden-sm hidden-md hidden-xs' : ''\" href='#' ng-click='close()'>Close</a></li></ul></div><div class='hidden-md hidden-xs hidden-sm btn-group btn-group-xs pull-right panel-control'><!-- ToDo: Allow panel to freeze. <button class='btn btn-info fa fa-paperclip' ng-click='freeze(task)'ng-class=\"task.freeze ? 'active' :''\" title='Clip'></button>--><button type='button' class='btn btn-info octicon octicon-pin' ng-click='pin()'ng-class=\"task.pinned ? 'active' :''\" title='Pin'></button><button type='button' ng-disabled='task.pinned' class='btn btn-info fa fa-arrows-h size25pc' ng-click='max25()'></button><button type='button' ng-disabled='task.pinned' class='btn btn-info fa fa-arrows-h size50pc' ng-click='max50()'></button><button type='button' ng-disabled='task.pinned' class='btn btn-info fa fa-arrows-h size75pc'  ng-click='max75()'></button><button type='button' ng-disabled='task.pinned' class='btn btn-info fa fa-arrows-h size100pc' ng-click='max100()'></button><button type='button' title='minimize' ng-disabled='task.pinned' class='btn btn-info fui-triangle-down-small' ng-click='hide(task)'></button><button type='button' id='rfh_btn_{{task.id}}' title='refresh' ng-click='refresh()' class='btn btn-info'><span class='fa fa-spin fa-refresh'></span></button><button type='button' ng-disabled='task.pinned||task.locked' class='btn btn-danger fa fa-close' title='close' ng-click='close()'></button></div></div><div id='_{{task.id}}'class='panel-collapse collapse in'><div id='_id_fpb_{{task.id}}'  class='panel-body minHeight flow-panel'><flow-message id=\"{{flow.getElementFlowId('pnl_msg')}}\"></flow-message><flow-tool id=\"{{flow.getElementFlowId('flw_tl')}}\" ng-show='showToolBar' controls='toolbars' task='task' pages='pages'></flow-tool><div id='page_div_{{task.id}}' class=' flow-panel-page' style='overflow: auto;' ng-include='page.home'></div></div></div></div>");
    tc.put("flowFrame.html", "<div><div><div ng-repeat='task in flowFrameService.taskList | filter:{active:true}'><fluid-panel task='task'></fluid-panel></div></div></div>");
    tc.put("flowField.html", "<div class='form-group flow-form'><label class='col-sm-2 control-label'>{{label}}<span style='color: #ea520a' ng-show='required'>*</span></label><div class='col-sm-10'><input name='{{name}}' ng-disabled='disabled' class='form-control' ng-model='model' type='{{type}}' ng-required='required'/></div></div>");
    tc.put("flowTextArea.html", "<div class='form-group'><label class='col-sm-2 control-label'>{{label}}<span style='color: #ea520a' ng-show='required'>*</span></label><div class='col-sm-10'><textarea rows='{{rows}}' cols='{{cols}}' name='{{name}}' ng-disabled='disabled' class='form-control' ng-model='model' type='{{type}}' ng-required='required'/></div></div>");
    tc.put("flowCheck.html", "<label class='checkbox' ng-class=\"'checked':model\"><input class='custom-checkbox' type='checkbox' ng-model='model' ng-required='required' ng-disabled='disabled' name='{{name}}' data-toggle='checkbox'><span class='icons marginBottom5px'><span class='text-info icon-checked'></span><span class='text-info icon-unchecked'></span></span>{{label}}</label>");
}]);
flowComponents
    .directive("flowPanel", ["flowFrameService", "flowHttpProvider", "$templateCache", "$compile", "flowMessageService", "$rootScope", "$q", "$timeout", "$ocLazyLoad",
        function (f, f2, tc, c, ms, rs, q, t, oc) {
            return {
                scope: {task: '='},
                restrict: "E",
                templateUrl: "templates/fluid/fluidPanel.html",
                replace: true,
                link: {
                    pre: function (scope, element) {
                        /* Initialize variables*/
                        scope.userTask = {};
                        scope.userTask.closed = false;
                        scope.showToolBar = scope.task.showToolBar;
                        scope.pages = [];
                        scope.page = scope.task.page;
                        scope.flow = {};
                        scope.toolbars = [
                            {"id": 'home', "glyph": "fa fa-home", "label": "home", "disabled": false, uiType: "info"},
                            {
                                "id": 'back',
                                "glyph": "fa fa-arrow-left",
                                "label": "back",
                                "disabled": true,
                                uiType: "info"
                            },
                            {
                                "id": 'forward',
                                "glyph": "fa fa-arrow-right",
                                "label": "forward",
                                "disabled": true,
                                uiType: "info"
                            }
                        ];

                        /* Page Event */
                        scope.flow.event = {};
                        scope.flow.message = {};
                        scope.flow.message.duration = 3000;
                        scope.http = {};
                        scope.currentPageIndex = 0;
                        scope.flow.pageCallBack = function (page, data) {
                        };
                        scope.flow.onPageChanging = function (page, param) {
                            return true;
                        }
                        scope.flow.onRefreshed = function () {
                        };
                        scope.flow.onOpenPinned = function (page, param) {

                        }
                        var parent = element.parent();
                        /***********/


                        /* Getters for IDs */

                        scope.flow.getHomeUrl = function () {
                            return f2.host + scope.homeUrl;
                        };

                        scope.flow.getElementFlowId = function (id) {
                            return id + "_" + scope.task.id;
                        };

                        scope.flow.getEventId = function (id) {
                            return id + "_fp_" + scope.task.id;
                        };

                        scope.flow.event.getResizeEventId = function () {
                            return scope.flow.getEventId("rsz_evt_id_");
                        };

                        scope.flow.event.getPageCallBackEventId = function () {
                            return "task_flow_page_call_back_event_id_" + scope.task.id;
                        };

                        scope.flow.event.getOnTaskLoadedEventId = function () {
                            return scope.flow.getEventId("on_ld_tsk_evt_id_");
                        };

                        scope.flow.event.getGoToEventId = function () {
                            return goToEventID + scope.task.id;
                        };

                        scope.flow.event.getRefreshId = function () {
                            return scope.flow.getEventId("tsk_rfh_id_");
                        };

                        scope.flow.event.getSuccessEventId = function () {
                            return scope.flow.getEventId("suc_evt_id_");
                        };

                        scope.flow.event.getErrorEventId = function () {
                            return scope.flow.getEventId("err_evt_id_");
                        };

                        /********************/


                        /* Integrated Alerts */
                        var messageId = scope.flow.getElementFlowId("pnl_msg");

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
                                url = url + param;
                            }
                            return f2.get(url, scope.task);
                        };
                        scope.http.delete = function (url, param) {
                            if (param) {
                                url = url + param;
                            }
                            return f2.delete(url, scope.task);
                        };
                        scope.http.post = function (url, data, param) {
                            if (param) {
                                url = url + param;
                            }
                            return f2.post(url, data, scope.task);
                        };
                        scope.http.put = function (url, data, param) {
                            if (param) {
                                url = url + param;
                            }
                            return f2.put(url, data, scope.task);
                        };

                        /*********************/

                        /* Action */
                        scope.loadGet = function () {
                            //adds control for page
                            if (scope.flow.controls) {
                                angular.forEach(scope.flow.controls, function (control) {
                                    if (control.pages) {
                                        scope.flow.addControl(control, control.pages);
                                    }
                                });
                            }

                            return q(function (resolve, reject) {
                                if ((scope.page !== undefined && scope.page !== null) && (scope.page.autoGet !== null && scope.page.autoGet === true)) {
                                    scope.task.currentPage = scope.page.name;
                                    f2.get(scope.homeUrl, scope.task)
                                        .success(function (data) {
                                            resolve({page: scope.page.name, value: data});
                                        });
                                } else if ((scope.page !== undefined && scope.page !== null) && (scope.page.autoGet === null || scope.page.autoGet === false)) {
                                    scope.task.currentPage = scope.page.name;
                                    resolve({page: scope.page.name});
                                }
                            }).then(function (data) {
                                if (scope.task.pinned) {
                                    scope.flow.onOpenPinned(scope.task.page, scope.task.pageParam);
                                } else {
                                    scope.flow.pageCallBack(data.page, data.value);
                                }
                            });
                        };

                        scope.flow.addControl = function (control, pageName) {
                            var exists = false;

                            angular.forEach(scope.toolbars, function (ctl) {
                                if (control.id === ctl.id) {
                                    exists = true;
                                }
                            });

                            if (Array.isArray(pageName)) {

                                var index = pageName.indexOf(scope.page.name);
                                if (index > -1) {
                                    if (!exists) {
                                        scope.toolbars.push(control);
                                    }
                                } else {
                                    if (exists) {
                                        for (var t = scope.toolbars.length - 1; t > 0; t--) {
                                            var toolbar = scope.toolbars[t];
                                            if (toolbar.id === control.id) {
                                                scope.toolbars.splice(t, 1);
                                            }
                                        }
                                    }

                                }
                            }

                            else if (scope.page.name === pageName) {
                                if (!exists) {
                                    scope.toolbars.push(control);
                                }
                            } else if (exists) {
                                for (var t = scope.toolbars.length - 1; t > 0; t--) {
                                    var toolbar = scope.toolbars[t];
                                    if (toolbar.id === control.id) {
                                        scope.toolbars.splice(t, 1);
                                        break;
                                    }
                                }

                            }
                        };
                        scope.navToPage = function (name) {
                            return q(function (resolve) {
                                angular.forEach(scope.pages, function (page) {
                                    if (name === page.name) {
                                        scope.prevPage = scope.page;
                                        scope.page = page;

                                        var uri = page.get;

                                        if (scope.page.param !== undefined) {
                                            uri = uri + scope.page.param;
                                        }

                                        scope.homeUrl = uri

                                        if (scope.task.pinned === true) {
                                            scope.userTask.page = scope.page.name;
                                            scope.userTask.param = scope.page.param;

                                            if (scope.task.generic === false) {
                                                if (scope.task.id.indexOf("gen") === -1) {
                                                    scope.userTask.flowTaskId = scope.task.id.split("_")[0];
                                                    scope.userTask.flowId = scope.task.flowId;
                                                    scope.userTask.pinned = scope.task.pinned;
                                                    f2.post("services/flow_user_task_crud/save_task_state?field=pin", scope.userTask, scope.task);
                                                }
                                            }
                                        }

                                        for (var i = 0; i < scope.pages.length; i++) {
                                            if (scope.pages[i].name === name) {
                                                scope.currentPageIndex = i;
                                                break;
                                            }
                                        }

                                        for (var i = 0; i < scope.toolbars.length; i++) {
                                            if (scope.toolbars[i].id === 'back') {
                                                scope.toolbars[i].disabled = !(scope.currentPageIndex > 0);
                                            }
                                            if (scope.toolbars[i].id === 'forward') {
                                                scope.toolbars[i].disabled = !(scope.currentPageIndex < scope.pages.length - 1);
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
                            return q(function (resolve, reject) {
                                angular.forEach(scope.task.pages, function (page) {
                                        if (name === page.name) {
                                            scope.prevPage = scope.page;
                                            scope.page = page;
                                            var uri = page.get;

                                            if (param !== undefined && param !== "null") {

                                                page.param = param;
                                                uri = uri + param;
                                            } else if (page.param) {
                                                uri = uri + page.param;
                                            }


                                            scope.homeUrl = uri;

                                            if (scope.task.pinned === true) {
                                                scope.userTask.page = scope.page.name;
                                                scope.userTask.param = scope.page.param;

                                                if (scope.task.generic === false) {
                                                    if (scope.task.id.indexOf("gen") === -1) {
                                                        scope.userTask.flowTaskId = scope.task.id.split("_")[0];
                                                        scope.userTask.flowId = scope.task.flowId;
                                                        scope.userTask.pinned = scope.task.pinned;
                                                        f2.post("services/flow_user_task_crud/save_task_state?field=pin", scope.userTask, scope.task);
                                                    }
                                                }
                                            }


                                            var contains = false;

                                            for (var i = 0; i < scope.pages.length; i++) {
                                                if (scope.pages[i].name === name) {
                                                    contains = true;
                                                    scope.currentPageIndex = i;
                                                    break;
                                                }
                                            }

                                            if (contains === false) {
                                                scope.pages.push(page);
                                                scope.currentPageIndex = scope.pages.length - 1;

                                            }

                                            for (var i = 0; i < scope.toolbars.length; i++) {
                                                if (scope.toolbars[i].id === 'back') {
                                                    scope.toolbars[i].disabled = !(scope.currentPageIndex > 0);
                                                }
                                                if (scope.toolbars[i].id === 'forward') {
                                                    scope.toolbars[i].disabled = !(scope.currentPageIndex < scope.pages.length - 1);
                                                }
                                            }
                                            resolve();
                                        }
                                    }
                                )
                            });
                        };
                        scope.flow.goTo = function (name, param) {
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
                                if (method.toLowerCase() === "put") {
                                    uri = scope.page.put;
                                    if (param !== undefined && param !== "null") {
                                        uri = uri + param;
                                    }
                                    f2.put(uri, data, scope.task)
                                        .success(function (rv) {
                                            rs.$broadcast(scope.flow.event.getSuccessEventId(), rv, method);
                                        })
                                        .error(function (data) {
                                            if (data) {
                                                scope.flow.message.danger(data.msg);
                                            } else {
                                                scope.flow.message.danger("Error creating request to " + uri);
                                            }

                                            rs.$broadcast(scope.flow.event.getErrorEventId(), data, method);
                                        });

                                } else if (method.toLowerCase() === "get") {
                                    uri = scope.page.get;
                                    if (param !== undefined && param !== "null") {
                                        uri = uri + param;
                                    }
                                    f2.get(uri, scope.task)
                                        .success(function (rv) {
                                            if (rv) {
                                                scope.flow.message.success(rv.msg);
                                            }
                                            rs.$broadcast(scope.flow.event.getSuccessEventId(), rv, method);
                                        })
                                        .error(function (data) {
                                            if (data) {
                                                scope.flow.message.danger(data.msg);
                                            }
                                            rs.$broadcast(scope.flow.event.getErrorEventId(), data, method);
                                        });

                                } else if (method.toLowerCase() === "delete") {
                                    uri = scope.page.delURL;
                                    if (param !== undefined && param !== "null") {
                                        uri = uri + param;
                                    }
                                    f2.delete(uri, scope.task)
                                        .success(function (rv) {
                                            if (rv) {
                                                if (rv) {
                                                    scope.flow.message.success(rv.msg);
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
                                } else if (method.toLowerCase() === "post") {
                                    uri = scope.page.post;

                                    if (param !== undefined && param !== "null") {
                                        uri = uri + param;
                                    }

                                    f2.post(uri, data, scope.task)
                                        .success(function (rv) {
                                            if (rv) {
                                                scope.flow.message.success(rv.msg);
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
                                    scope.page = page;
                                    scope.homeUrl = page.get;

                                    if (page.param) {
                                        scope.homeUrl = scope.homeUrl + page.param;
                                    }

                                    for (var i = 0; i < scope.toolbars.length; i++) {
                                        if (scope.toolbars[i].id === 'back') {
                                            scope.toolbars[i].disabled = true;
                                        }
                                        if (scope.toolbars[i].id === 'forward') {
                                            scope.toolbars[i].disabled = true;
                                        }
                                    }
                                    scope.currentPageIndex = 0;
                                    scope.pages = [page];

                                    scope.loadGet();
                                }
                            });

                        };
                        scope.task.refresh = function () {

                            if (scope.page.autoGet) {
                                $("#rfh_btn_" + scope.task.id).find("span").addClass("fa-spin");
                                f2.get(scope.homeUrl, scope.task)
                                    .success(function (data) {
                                        scope.flow.pageCallBack(scope.page.name, data, "refresh");
                                        $("#rfh_btn_" + scope.task.id).find("span").removeClass("fa-spin");
                                    })
                                    .error(function (data) {
                                        $("#rfh_btn_" + scope.task.id).find("span").removeClass("fa-spin");
                                    });
                            } else {
                                rs.$broadcast(scope.flow.event.getRefreshId());
                                scope.flow.onRefreshed();
                            }
                        };
                        scope.task.max25 = function (clientState) {
                            scope.task.size = 25;
                            parent.removeClass("col-lg-12");
                            parent.removeClass("col-md-12");
                            parent.removeClass("col-lg-8");
                            parent.removeClass("col-md-8");
                            parent.removeClass("col-lg-6");
                            parent.removeClass("col-md-6");
                            parent.addClass("col-lg-4");
                            parent.addClass("col-md-4");
                            if (clientState === undefined || clientState === false) {
                                if (scope.page && scope.task) {
                                    rs.$broadcast(scope.flow.event.getResizeEventId(), scope.page.name, scope.task.size);
                                }
                                scope.userTask.size = scope.task.size;
                                if (scope.task.generic === false) {
                                    if (scope.task.id.indexOf("gen") === -1) {
                                        scope.userTask.flowTaskId = scope.task.id.split("_")[0];
                                        scope.userTask.flowId = scope.task.flowId;
                                        f2.post("services/flow_user_task_crud/save_task_state?field=size", scope.userTask, scope.task);
                                    }
                                }
                            }

                        };
                        scope.task.max50 = function (clientState) {
                            scope.task.size = 50;
                            parent.removeClass("col-lg-12");
                            parent.removeClass("col-md-12");
                            parent.removeClass("col-lg-8");
                            parent.removeClass("col-md-8");
                            parent.removeClass("col-lg-4");
                            parent.removeClass("col-md-4");
                            parent.addClass("col-lg-6");
                            parent.addClass("col-md-6");
                            if (clientState === undefined || clientState === false) {
                                if (scope.page && scope.task) {
                                    rs.$broadcast(scope.flow.event.getResizeEventId(), scope.page.name, scope.task.size);
                                }
                                scope.userTask.size = scope.task.size;
                                if (scope.task.generic === false) {
                                    if (scope.task.id.indexOf("gen") === -1) {
                                        scope.userTask.flowTaskId = scope.task.id.split("_")[0];
                                        scope.userTask.flowId = scope.task.flowId;
                                        f2.post("services/flow_user_task_crud/save_task_state?field=size", scope.userTask, scope.task);

                                    }
                                }
                            }
                        };
                        scope.task.max75 = function (clientState) {
                            scope.task.size = 75;
                            parent.removeClass("col-lg-12");
                            parent.removeClass("col-md-12");
                            parent.removeClass("col-lg-6");
                            parent.removeClass("col-md-6");
                            parent.removeClass("col-lg-4");
                            parent.removeClass("col-md-4");
                            parent.addClass("col-lg-8");
                            parent.addClass("col-md-8");
                            if (clientState === undefined || clientState === false) {
                                if (scope.page && scope.task) {
                                    rs.$broadcast(scope.flow.event.getResizeEventId(), scope.page.name, scope.task.size);
                                }
                                scope.userTask.size = scope.task.size;
                                if (scope.task.generic === false) {
                                    if (scope.task.id.indexOf("gen") === -1) {
                                        scope.userTask.flowTaskId = scope.task.id.split("_")[0];
                                        scope.userTask.flowId = scope.task.flowId;
                                        f2.post("services/flow_user_task_crud/save_task_state?field=size", scope.userTask, scope.task);
                                        console.log("max75");
                                    }
                                }
                            }

                        };
                        scope.task.max100 = function (clientState) {
                            scope.task.size = 100;
                            parent.removeClass("col-lg-8");
                            parent.removeClass("col-md-8");
                            parent.removeClass("col-lg-6");
                            parent.removeClass("col-md-6");
                            parent.removeClass("col-lg-4");
                            parent.removeClass("col-md-4");
                            parent.addClass("col-lg-12");
                            parent.addClass("col-md-12");
                            if (clientState === undefined || clientState === false) {
                                if (scope.page && scope.task) {
                                    rs.$broadcast(scope.flow.event.getResizeEventId(), scope.page.name, scope.task.size);
                                }
                                scope.userTask.size = scope.task.size;
                                if (scope.task.generic === false) {
                                    if (scope.task.id.indexOf("gen") === -1) {
                                        scope.userTask.flowTaskId = scope.task.id.split("_")[0];
                                        scope.userTask.flowId = scope.task.flowId;
                                        f2.post("services/flow_user_task_crud/save_task_state?field=size", scope.userTask, scope.task);

                                    }
                                }
                            }
                        };
                        scope.task.hide = function () {
                            if (scope.task.onWindowHiding(scope.task.page)) {
                                scope.task.active = false;
                                scope.userTask.active = scope.task.active;
                                if (scope.task.generic === false) {
                                    if (scope.task.id.indexOf("gen") === -1) {
                                        scope.userTask.flowTaskId = scope.task.id.split("_")[0];
                                        scope.userTask.flowId = scope.task.flowId;
                                        f2.post("services/flow_user_task_crud/save_task_state?field=active", scope.userTask, scope.task);

                                    }
                                }

                            }

                        };
                        scope.task.close = function () {
                            if (scope.task.onWindowClosing(scope.task.page)) {


                                if (scope.task.generic === false) {
                                    if (scope.task.id.indexOf("gen") === -1) {
                                        scope.userTask.closed = true;
                                        scope.userTask.flowTaskId = scope.task.id.split("_")[0];
                                        scope.userTask.flowId = scope.task.flowId;
                                        f2.post("services/flow_user_task_crud/save_task_state?field=close", scope.userTask, scope.task)
                                            .success(function (data) {
                                                for (var i = 0; i < f.taskList.length; i++) {
                                                    var task = f.taskList[i];
                                                    if (scope.task.id === task.id) {
                                                        f.taskList.splice(i, 1);
                                                    }
                                                }
                                            })
                                            .error(function (data) {

                                            });

                                    }
                                }
                            }

                        };
                        scope.task.pin = function () {
                            scope.task.pinned = !scope.task.pinned;
                            if (scope.task.pinned === true) {
                                scope.userTask.page = scope.page.name;
                                scope.userTask.param = scope.page.param;
                                scope.task.onWindowPinned(scope.task.page);
                            } else {
                                scope.userTask.page = "";
                                scope.userTask.param = "";
                            }

                            if (scope.task.generic === false) {
                                if (scope.task.id.indexOf("gen") === -1) {
                                    scope.userTask.flowTaskId = scope.task.id.split("_")[0];
                                    scope.userTask.flowId = scope.task.flowId;
                                    scope.userTask.pinned = scope.task.pinned;
                                    f2.post("services/flow_user_task_crud/save_task_state?field=pin", scope.userTask, scope.task);
                                }
                            }
                        };
                        /*********************/

                        /*Instance creation*/
                        if (scope.task.generic) {
                            f2.get(scope.task.url, scope.task).success(function (d) {

                                var $task = {};
                                scope.copy = {};
                                angular.copy(scope.task, scope.copy);
                                angular.forEach(f.taskList, function (task, key) {

                                    if (task.id === scope.task.id) {
                                        this.task = task;
                                        this.index = key;
                                    }

                                }, $task);

                                f.taskList[$task.index] = f.buildTask(d);
                                f.taskList[$task.index].id = f.taskList[$task.index].id + "_" + $task.index;
                                f.taskList[$task.index].origin = scope.task.origin;

                                var newTask = scope.task.newTask;
                                scope.task = f.taskList[$task.index];
                                scope.task.generic = false;
                                scope.task.newTask = newTask;

                            })
                        }
                        /*********************/

                    },
                    post: function (scope) {



                        /*events*/

                        scope.$on(scope.flow.getEventId('home'), function () {
                            scope.flow.goToHome();
                        });

                        scope.$on(scope.flow.getEventId('back'), function () {

                            if (scope.pages.length > 0 && scope.pages.length > scope.currentPageIndex) {
                                var i = --scope.currentPageIndex;
                                var count = scope.pages.length - (i + 1);
                                var page = scope.pages[i];
                                scope.pages.splice((i + 1), count);
                                scope.flow.navTo(page.name);

                            }
                        });

                        scope.$on(scope.flow.getEventId('forward'), function () {
                            if (scope.pages.length - 1 > scope.currentPageIndex) {
                                var page = scope.pages[++scope.currentPageIndex];
                                scope.flow.navTo(page.name);
                            }

                        });


                        scope.$on(scope.flow.getEventId("navTo"), function (event, name) {
                            scope.flow.navTo(name);
                        });

                        scope.$on(scope.flow.getEventId("selectPage"), function (event, name) {
                            var i = scope.currentPageIndex;
                            for (var index = 0; i < scope.pages.length; i++) {
                                if (scope.pages[index].name == name) {
                                    i = index;
                                    break;
                                }
                            }
                            var count = scope.pages.length - (i + 1);
                            var page = scope.pages[i];
                            scope.pages.splice((i + 1), count);
                            scope.flow.navTo(name);
                        });

                        scope.$on(scope.flow.event.getGoToEventId(), function (event, name, param) {
                            scope.flow.goTo(name, param);
                        });

                        scope.$on(scope.flow.event.getOnTaskLoadedEventId(), function (event) {

                        });

                        scope.$on(scope.flow.event.getPageCallBackEventId, function (event, page, data) {
                            scope.flow.pageCallBack(page, data);
                        });

                        scope.$on(EVENT_NOT_ALLOWED + scope.task.id, function (event, msg) {
                            scope.flow.message.danger(msg);
                            angular.forEach(scope.pages, function (page, key) {

                                if (page.name === scope.page.name) {
                                    scope.pages.splice(key, 1);
                                    scope.flow.goTo(scope.prevPage.name);
                                }
                            });

                        });

                        /*******************/


                        /* Post creation */

                        if (scope.task) {
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

                        if (!scope.task.generic) {

                            if (scope.task.lazyLoad === true) {
                                var pathArr = undefined;
                                if (scope.task.moduleFiles.indexOf(",") > 0) {
                                    pathArr = scope.task.moduleFiles.split(",");
                                }

                                var files = [];
                                if (pathArr) {
                                    for (var i = 0; i < pathArr.length; i++) {
                                        files.push(pathArr[i]);
                                    }
                                } else {
                                    files.push(scope.task.moduleFiles);
                                }
                                oc.load({
                                    name: scope.task.moduleJS,
                                    files: files
                                }).then(function () {
                                    generateTask(scope, t, f2);
                                });
                            } else {
                                generateTask(scope, t, f2);
                            }

                        }

                        /********************/
                    }

                }

            }
        }])
    .directive("flowFrame", ["flowFrameService", "$window", "$rootScope", "$timeout", function (f, w, rs, t) {
        return {
            restrict: "E",
            transclude: true,
            scope: true,
            templateUrl: "templates/fluid/fluidFrame.html",
            replace: true,
            link: function (scope, element) {


                scope.frame = {};
                scope.flowFrameService = f;

                var frameDiv = $(element.find("div.form-group")[1]);

                var height = window.innerHeight;

                var _00pc = height >= 800 ? height * 0.05 : height <= 800 && height > 600 ? height * 0.07 : height <= 600 && height > 400 ? height * 0.09 : height <= 400 ? height * 0.15 : height * 0.50;

                height = height - _00pc;
                if (scope.flowFrameService.isSearch) {

                    frameDiv.attr("style", "height:" + height + "px;overflow:auto");
                } else {

                    element.attr("style", "height:" + height + "px;overflow:auto");
                }

                $("body").attr("style", "height: " + (height - 6) + "px;overflow:hidden");

                scope.show = function (task) {
                    if (!task.pinned) {
                        task.active = !task.active;
                    }
                };

                $(window).on("resize", function () {

                    var height = window.innerHeight;

                    var _00pc = height >= 800 ? height * 0.05 : height <= 800 && height > 600 ? height * 0.07 : height <= 600 && height > 400 ? height * 0.09 : height <= 400 ? height * 0.15 : height * 0.50;

                    height = height - _00pc;

                    $("body").attr("style", "height: " + height + "px;overflow:hidden");
                    if (scope.flowFrameService.isSearch) {
                        frameDiv.attr("style", "height:" + (height - 6) + "px;overflow:auto");
                    } else {
                        element.attr("style", "height:" + (height - 6) + "px;overflow:auto");
                    }

                });


                scope.initTask = function (task) {
                    scope.$watch(function () {
                        return task.active;
                    }, function (newValue, oldValue) {
                        if (true === newValue) {
                            if (task.onWindowOpening()) {
                                task.onWindowOpened();
                            } else {
                                task.active = false;
                            }
                        }

                    });
                }
            }
        };
    }])
    .directive("flowTool", ["$rootScope", "$compile", function (r, c) {

        return {
            scope: {task: '=', controls: '=', pages: '='},
            restrict: "E",
            replace: true,
            templateUrl: "templates/fluid/fluidToolbar.html",
            link: function (scope, element, attr) {
                scope.runEvent = function (control) {
                    if (control.action) {
                        control.action();
                    } else {
                        var event = control.id + "_fp_" + scope.task.id;
                        r.$broadcast(event);
                    }

                };


                scope.goToEvent = function (name, param) {
                    var event = "navTo_fp_" + scope.task.id;
                    r.$broadcast(event, name);

                };

                scope.getClass = function (uiType) {
                    if (uiType.toLowerCase() === "info") {
                        return "btn-info";
                    } else if (uiType.toLowerCase() === "danger") {
                        return "btn-danger";
                    } else if (uiType.toLowerCase() === "warning") {
                        return "btn-warning";
                    } else if (uiType.toLowerCase() === "inverse") {
                        return "btn-inverse";
                    } else if (uiType.toLowerCase() === "success") {
                        return "btn-success";
                    } else if (uiType.toLowerCase() === "primary") {
                        return "btn-primary";
                    } else {
                        return "btn-default";
                    }
                }
            }
        }
    }])
    .directive("flowBar", ["flowFrameService", "$templateCache", "$compile", "flowHttpProvider", function (f, tc, c, f2) {

        return {
            restrict: "AEC",
            link: function (scope, element) {

                scope.taskList = f.taskList;

                scope.open = function (task) {
                    if (task.active === true) {
                        scope.scroll(task);
                    } else {
                        task.active = true;
                        if (task.id.indexOf("gen") === -1) {
                            scope.userTask = {};
                            scope.userTask.flowTaskId = task.id.split("_")[0];
                            scope.userTask.active = task.active;
                            scope.userTask.flowId = task.flowId;
                            f2.post("services/flow_user_task_crud/save_task_state?field=active", scope.userTask, task);
                        }
                    }

                };
                scope.scroll = function (task) {
                    $("body").scrollTo($("#_id_fp_" + task.id), 800);

                }
            },
            replace: true,
            templateUrl: "templates/fluid/fluidBar2.html"
        };
    }])
    .directive("flowField", ["$templateCache", function (tc) {
        return {
            restrict: "AE",
            scope: {
                name: "@",
                model: "=",
                label: "@",
                type: "@",
                required: "=",
                disabled: "="
            },
            template: tc.get("flowField.html"),
            replace: true,
            link: function (scope, elem, attr) {
                if (!scope.name) {
                    scope.name = scope.label.trim();
                }
                if (scope.type === undefined) {
                    scope.type = "text";
                }
            }
        }
    }])
    .directive("flowTextArea", ["$templateCache", function (tc) {
        return {
            restrict: "AE",
            scope: {
                name: "@",
                model: "=",
                label: "@",
                required: "=",
                disabled: "=",
                rows: "=",
                cols: "="
            },
            template: tc.get("flowTextArea.html"),
            replace: true,
            link: function (scope, elem, attr) {
                if (!scope.name) {
                    scope.name = scope.label.trim();
                }
            }
        }
    }])
    .directive("flowCheck", ["$compile", function (c) {
        return {
            restrict: "AE",
            scope: {model: "=", label: "@", required: "=", disabled: "="},
            templateUrl: "templates/fluid/fluidCheckbox.html",
            link: function (scope, element) {

                if (scope.required === undefined) {
                    scope.required = false;
                }

                if (scope.disabled === undefined) {
                    scope.disabled = false;
                }

                if (scope.model === undefined) {
                    scope.model = false;
                }

            },
            replace: true
        }
    }])
    .directive("flowMessage", [function () {
        return {
            restrict: "AE",
            replace: true,
            template: "<div></div>"

        }
    }])
    .directive("flowModal", [function () {
        return {
            restrict: "AE",
            template: "<div class='overlay hidden animated fadeIn anim-dur'><div ng-style='style' class='flow-modal animated pulse anim-dur'><div ng-transclude></div></div></div>",
            replace: true,
            transclude: true,
            link: function (scope, element, attr) {
                scope.style = {};

                if (attr.height) {
                    scope.style.height = attr.height;
                }

                if (attr.width) {
                    scope.style.width = attr.width;
                }
            }
        }
    }])
    .directive("flowSubTable", ["$compile", "flowModalService", "flowHttpProvider", "flowFrameService", "$rootScope", function (c, fm, f, f2, rs) {
        return {
            restrict: "AE",
            transclude: true,
            replace: true,
            scope: {
                task: "=",
                flow: "=",
                lookUp: "@",
                targetList: "=",
                targetUrl: "@",
                id: "@",
                title: "@",
                keyVar: "@",
                idField: "@",
                sourceUrl: "@",
                editUrl: "@",
                editEvent: "@",
                createEvent: "@"


            },
            template: "<div class='form-group'><div class='panel panel-primary'><div class='panel-heading'><a href='#' class='flow-panel-heading-title' data-toggle='collapse' data-target='#{{id}}_collapse'>{{title}}</a><div class='pull-right'><div class='btn-group btn-group-xs'><button type='button' class='btn btn-info flow-sub-table-control' ng-click='create()' ng-show='createEnabled'><span class='fa fa-plus'></span></button><button ng-show=\"lookUp == 'true'\" type='button' class='btn btn-info flow-sub-table-control' ng-click='look()'><span class='fa fa-search'></span></button></div></div></div><div class='panel-collapse collapse in' id='{{id}}_collapse'><div class='panel-body' ><div ng-transclude></div><div class='container-fluid' style='overflow-y: auto'><table class='table table-responsive table-hover'></table></div></div></div></div>",
            link: function (scope, element) {
                if (!scope.lookUp) {
                    scope.lookUp = "true";
                }

                if (scope.createEvent) {
                    scope.createEnabled = true;
                } else {
                    scope.createEnabled = false;
                }
                if (scope.editEvent || scope.editUrl) {
                    scope.editEnabled = true;
                } else {
                    scope.editEnabled = false;
                }


                if (scope.id === undefined) {

                    var parent = $(element[0]).parent();

                    var size = $(parent).find("flow-sub-table").length;

                    scope.id = "sb_tbl_" + size + "_" + scope.task.id;
                }
                if (!scope.targetList) {
                    scope.targetList = [];
                }
                var parent = $(element[0]).parent().get();

                var modal = $("<div>").attr("id", "{{id}}_add_tbl_mdl").addClass("overlay hidden animated fadeIn anim-dur").appendTo(parent).get();

                var modalContent = $("<div>").addClass("flow-modal animated anim-dur").attr("id", "{{id}}_mdl_cnt").appendTo(modal).get();

                var modalPanel = $("<div>").addClass("panel panel-primary").appendTo(modalContent).get();

                var modalPanelHeading = $("<div>").addClass("panel-heading").appendTo(modalPanel).get();

                var spanTitle = $("<span>").addClass("text-inverse").addClass("col-lg-5 col-md-5 col-sm-3 col-xs-3").html("Select " + scope.title).appendTo(modalPanelHeading).get();

                var inputGroup = $("<div>").addClass("col-lg-7 col-md-7 col-sm-9 col-xs-9").addClass("input-group").appendTo(modalPanelHeading).get();

                var inputSearch = $("<input>").addClass("form-control").attr("type", "text").attr("ng-model", "search").appendTo(inputGroup).get();

                var inputSpan = $("<span>").addClass("input-group-addon").appendTo(inputGroup).get();

                $("<i>").addClass("fa fa-search").appendTo(inputSpan);

                var modalPanelBody = $("<div>").addClass("panel-body").attr("style", "overflow:auto;height:200px").appendTo(modalPanel).get();

                var modalPanelFooter = $("<div>").addClass("panel-footer").attr("style", "height:50px").appendTo(modalPanel).get();

                var pullRightFooterDiv = $("<div>").addClass("pull-right").appendTo(modalPanelFooter).get();

                var buttonGroup = $("<div>").addClass("btn-group btn-group-sm").appendTo(pullRightFooterDiv).get();

                var closeButton = $("<button>").addClass("btn btn-info").attr("ng-click", "close()").attr("type", "button").html("close").appendTo(buttonGroup).get();

                var columns = element.find("flow-sub-column");

                var table = element.find("table");

                var thead = $("<thead>").appendTo(table).get();

                var theadRow = $("<tr>").appendTo(thead).get();

                var tbody = $("<tbody>").appendTo(table).get();

                var modalTable = $("<table>").addClass("table table-responsive table-hovered table-bordered").appendTo(modalPanelBody).get();

                var mThead = $("<thead>").appendTo(modalTable).get();

                var mTheadRow = $("<tr>").appendTo(mThead).get();

                var mTbody = $("<tbody>").appendTo(modalTable).get();

                var tr = $("<tr>").addClass("animated").addClass("slideInDown").addClass("anim-dur").attr("ng-repeat", scope.keyVar + " in targetList").appendTo(tbody).get();

                var mTr = $("<tr>").attr("ng-repeat", scope.keyVar + " in sourceList | filter:search").attr("ng-click", "addToList(" + scope.keyVar + ")").appendTo(mTbody).get();

                if (scope.targetUrl !== undefined) {
                    f.get(scope.targetUrl, scope.task).success(function (data) {
                        scope.targetList = data;
                    });
                }

                $("<th>").html("Action").appendTo(theadRow);

                var tdAction = $("<td>").appendTo(tr).get();

                var buttonGroupDiv = $("<div>").addClass("btn-group").addClass("btn-group-xs").appendTo(tdAction).get();

                if (scope.editEnabled) {
                    var editButton = $("<button>").addClass("btn btn-info").addClass("glyphicon glyphicon-edit").addClass("horizontalSpace").attr("type", "button").attr("title", "edit").attr("ng-click", "edit(" + scope.keyVar + "." + scope.idField + ",$index)").appendTo(buttonGroupDiv).get();
                }

                var removeButton = $("<button>").addClass("btn btn-danger").addClass("glyphicon glyphicon-minus").addClass("horizontalSpace").attr("type", "button").attr("title", "remove").attr("ng-click", "remove($index)").appendTo(buttonGroupDiv).get();


                for (var i = 0; i < columns.length; i++) {
                    var col = $(columns[i]);
                    $("<th>").addClass(col.attr("column-class")).html(col.attr("title")).appendTo(theadRow);
                    $("<th>").addClass(col.attr("column-class")).html(col.attr("title")).appendTo(mTheadRow);
                    if (col.attr("render-with") !== undefined) {
                        $("<td>").addClass(col.attr("column-class")).html(col.attr("render-with")).appendTo(tr);
                        $("<td>").addClass(col.attr("column-class")).html(col.attr("render-with")).appendTo(mTr);
                    } else {
                        $("<td>").addClass(col.attr("column-class")).html("{{" + col.attr("model") + "}}").appendTo(tr);
                        $("<td>").addClass(col.attr("column-class")).html("{{" + col.attr("model") + "}}").appendTo(mTr);
                    }


                }

                scope.create = function () {
                    rs.$broadcast(scope.createEvent + "_fp_" + scope.task.id);
                };

                scope.edit = function (param, index) {
                    if (scope.editUrl) {
                        f2.addTask(scope.editUrl + param, scope.task, true);
                    } else if (scope.editEvent) {
                        rs.$broadcast(scope.editEvent + "_fp_" + scope.task.id, param, index);
                    }


                };


                scope.look = function () {
                    if (scope.sourceUrl) {
                        f.get(scope.sourceUrl, scope.task).success(function (data) {
                            scope.sourceList = data;
                        });
                    }
                    fm.show(scope.id + "_add_tbl_mdl");
                    $(modalContent).addClass("pulse");
                    $(modalContent).one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", function () {
                        $(modalContent).removeClass("pulse");
                    });
                };


                scope.remove = function (index) {
                    scope.targetList.splice(index, 1);
                };

                scope.addToList = function (item) {
                    if (scope.targetList !== undefined) {
                        var exists = false;
                        for (var i = 0; i < scope.targetList.length; i++) {
                            var it = scope.targetList[i];
                            if (item.id === it.id) {
                                exists = true;
                                break;
                            }
                        }
                        if (!exists) {
                            scope.targetList.push(item);
                            scope.close();
                        } else {
                            $(modalContent).addClass("shake");
                            $(modalContent).one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", function () {
                                $(modalContent).removeClass("shake");
                            });
                        }
                    } else {
                        $(modalContent).addClass("shake");
                        $(modalContent).one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", function () {
                            $(modalContent).removeClass("shake");
                        });
                    }

                };

                scope.close = function () {
                    fm.hide(scope.id + "_add_tbl_mdl", scope.id);
                };

                $(element.find("div[ng-transclude]")).remove();

                c(table)(scope);
                c(modal)(scope);

            }
        }
    }])
    .directive("flowSubColumn", [function () {
        return {
            restrict: "AE",
            scope: {title: "@", model: "=", columnClass: "@", renderWith: "@"}

        }
    }])
    .directive("flowLookUp", ["$compile", "flowModalService", "flowHttpProvider", "flowFrameService", "$timeout", function (c, fm, f, f2, t) {
        return {
            restrict: "AE",
            scope: {
                task: "=",
                model: "=",
                sourceUrl: "@",
                label: "@",
                fieldLabel: "@",
                disabled: "=",
                required: "=",
                id: "@",
                keyVar: "@",
                fieldValue: "@",
                parentId: "@"
            },
            link: function (scope, element) {


                /*TODO: must return the object when model is a field value */
                if (scope.id === undefined) {
                    var currentElement = $(element).get();
                    var index = $(currentElement).index();
                    scope.id = "lookUp_modal_" + index + "_" + scope.task.id;

                }


                t(function () {


                    scope.sourceList = [];

                    var parent = $(element[0]).parent().get();


                    if (scope.parentId) {

                        while ($(parent).attr("id") !== scope.parentId) {
                            parent = $(parent).parent().get();
                            if (parent === undefined)break;
                        }

                    }

                    var modal = $("<div>").attr("id", "{{id}}_add_tbl_mdl").addClass("overlay hidden animated fadeIn anim-dur").appendTo(parent).get();

                    var modalContent = $("<div>").addClass("flow-modal animated anim-dur").attr("id", "{{id}}_mdl_cnt").appendTo(modal).get();

                    var modalPanel = $("<div>").addClass("panel panel-primary").appendTo(modalContent).get();

                    var modalPanelHeading = $("<div>").addClass("panel-heading").appendTo(modalPanel).get();

                    var spanTitle = $("<span>").addClass("text-inverse").addClass("col-lg-5 col-md-5 col-sm-3 col-xs-3").html("Select " + scope.label).appendTo(modalPanelHeading).get();

                    var inputGroup = $("<div>").addClass("col-lg-7 col-md-7 col-sm-9 col-xs-9").addClass("input-group").appendTo(modalPanelHeading).get();

                    var inputSearch = $("<input>").addClass("form-control").attr("type", "text").attr("ng-model", "search").appendTo(inputGroup).get();

                    var inputSpan = $("<span>").addClass("input-group-addon").appendTo(inputGroup).get();

                    $("<i>").addClass("fa fa-search").appendTo(inputSpan);

                    var modalPanelBody = $("<div>").addClass("panel-body").attr("style", "overflow:auto;height:200px").appendTo(modalPanel).get();

                    var modalPanelFooter = $("<div>").addClass("panel-footer").attr("style", "height:50px").appendTo(modalPanel).get();

                    var pullRightFooterDiv = $("<div>").addClass("pull-right").appendTo(modalPanelFooter).get();

                    var buttonGroup = $("<div>").addClass("btn-group btn-group-sm").appendTo(pullRightFooterDiv).get();

                    var closeButton = $("<button>").addClass("btn btn-info").attr("ng-click", "close()").attr("type", "button").html("close").appendTo(buttonGroup).get();

                    var columns = element.find("flow-sub-column");

                    var modalTable = $("<table>").addClass("table table-responsive table-hover").appendTo(modalPanelBody).get();

                    var mThead = $("<thead>").appendTo(modalTable).get();

                    var mTheadRow = $("<tr>").appendTo(mThead).get();

                    var mTbody = $("<tbody>").appendTo(modalTable).get();
                    var mTr = null;
                    if (!scope.fieldValue) {
                        if (scope.fieldLabel) {
                            mTr = $("<tr>").attr("ng-repeat", scope.keyVar + " in sourceList | filter:search").attr("ng-click", "select(" + scope.keyVar + "," + scope.keyVar + "." + scope.fieldLabel + ")").appendTo(mTbody).get();
                        } else {
                            mTr = $("<tr>").attr("ng-repeat", scope.keyVar + " in sourceList | filter:search").attr("ng-click", "select(" + scope.keyVar + ")").appendTo(mTbody).get();
                        }
                    } else {
                        if (scope.fieldLabel) {
                            mTr = $("<tr>").attr("ng-repeat", scope.keyVar + " in sourceList | filter:search").attr("ng-click", "select(" + scope.keyVar + "." + scope.fieldValue + "," + scope.keyVar + "." + scope.fieldLabel + ")").appendTo(mTbody).get();
                        } else {
                            mTr = $("<tr>").attr("ng-repeat", scope.keyVar + " in sourceList | filter:search").attr("ng-click", "select(" + scope.keyVar + "." + scope.fieldValue + ")").appendTo(mTbody).get();
                        }

                    }

                    for (var i = 0; i < columns.length; i++) {
                        var col = $(columns[i]);
                        $("<th>").addClass(col.attr("column-class")).html(col.attr("title")).appendTo(mTheadRow);

                        if (col.attr("render-with") !== undefined) {
                            $("<td>").addClass(col.attr("column-class")).html(col.attr("render-with")).appendTo(mTr);
                        } else {
                            $("<td>").addClass(col.attr("column-class")).html("{{" + col.attr("model") + "}}").appendTo(mTr);
                        }
                    }
                    var ctnr = undefined;


                    if (scope.fieldLabel) {
                        ctnr = element.find("input").attr("ng-model", "model." + scope.fieldLabel);
                    } else {
                        ctnr = element.find("input").attr("ng-model", "model");
                    }

                    $(element.find("div[ng-transclude]")).remove();
                    c(ctnr)(scope);
                    c(modal)(scope);


                    scope.look = function () {
                        if (scope.sourceUrl) {
                            f.get(scope.sourceUrl, scope.task).success(function (data) {
                                scope.sourceList = data;
                            });
                        }
                        fm.show(scope.id + "_add_tbl_mdl");
                        $(modalContent).addClass("pulse");
                        $(modalContent).one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", function () {
                            $(modalContent).removeClass("pulse");
                        });
                    };

                });


                scope.close = function () {
                    fm.hide(scope.id + "_add_tbl_mdl", scope.id);
                };


                scope.select = function (item, label) {
                    scope.model = item;
                    scope.modelLabel = label;
                    scope.close();
                };

                scope.reset = function (event) {
                    var value = $(event.target).attr("value");
                    $(event.target).attr("value", value);
                };


                scope.isModeled = function () {
                    return scope.model !== undefined;
                };

                scope.isNotModeled = function () {
                    return scope.model === undefined;
                };

                scope.clear = function () {
                    scope.model = undefined;
                };


            },
            templateUrl: "templates/fluid/fluidLookup.html",
            replace: true,
            transclude: true
        }
    }])
    .directive("flowSelect", ["flowHttpProvider", "$compile", "$timeout", "browser", function (f, c, t, b) {
        return {
            scope: {
                id: "@",
                task: "=",
                model: "=",
                label: "@",
                fieldGroup: "@",
                fieldValue: "@",
                fieldLabel: "@",
                sourceUrl: "@",
                disabled: "=",
                required: "=",
                change: "&"
            },
            link: function (scope, element, attr) {

                if (!scope.id) {
                    scope.id = "fl_slt_" + scope.task.id;
                }
                if (scope.required === undefined || scope.required === "undefined") {
                    scope.required = false;
                }

                if (scope.disabled === undefined || scope.disabled === "undefined") {
                    scope.disabled = false;
                }


                var options = "";

                if (scope.fieldValue === undefined) {
                    options = "item";
                } else {
                    options = "item." + scope.fieldValue;
                }

                if (scope.fieldLabel === undefined) {
                } else {
                    options += " as item." + scope.fieldLabel;
                }

                if (scope.fieldGroup) {
                    options += " group by item." + scope.fieldGroup;
                }

                options += " for item in sourceList";

                var select = element.find("select").attr("ng-options", options).attr("ng-model", "model").get();

                if (!scope.sourceList) {
                    f.get(scope.sourceUrl, scope.task).success(function (sourceList) {
                        t(function () {
                            scope.sourceList = sourceList;
                        });
                    });
                }



                // for IE ng-disabled issue
                scope.$watch(function (scope) {
                        return scope.disabled;
                    },
                    function (newValue) {
                        if (newValue === false) {
                            element.removeAttr("disabled");
                        }
                    });

                scope.$watch(function (scope) {
                    return scope.model;
                 }, function (newValue) {
                    scope.change({item:newValue});
                 });

            

               
                 c(element.contents())(scope);
            },
            template: "<div class='form-group'><label class='col-sm-2 control-label'>{{label}}<span style='color: #ea520a' ng-show='required'>*</span></label><div class='col-sm-10'><select id='{{id}}_select' data-toggle='select' class='form-control' ng-required='required' ng-disabled='disabled'><option class='hidden-lg hidden-md' value='' disabled selected>Select {{label}}</option></select></div></div>",
            replace: true
        }
    }])
    .directive("flowPermissionEnabled", ["flowHttpProvider", "$compile", "$cookies", function (f, c, cc) {
        return {
            restrict: "A",
            scope: {task: "=", page: "="},
            link: function (scope, element, attr) {

                if (!scope.task.permssionCache) {
                    scope.task.permssionCache = [];
                }
                if (attr.method) {
                    scope.method = attr.method;
                }

                var contains = false;

                for (var i = 0; i < scope.task.permssionCache.length; i++) {
                    var perm = scope.task.permssionCache[i];

                    if (perm.key === scope.page.name + "_" + scope.method) {
                        contains = true;
                        if (!perm.value) {
                            element.attr("disabled", "");
                        }
                        break;
                    }

                }
                if (!contains) {
                    f.get(f.permissionUrl + "?authorization=" + cc.authorization + "&pageName=" + scope.page.name + "&method=" + scope.method, scope.task)
                        .success(function (data) {
                            if (!data) {
                                scope.task.permssionCache.push({
                                    key: scope.page.name + "_" + scope.method,
                                    value: data
                                });
                                element.attr("disabled", "");

                            }
                        });

                }
            }

        }
    }])
    .directive("flowPermissionVisible", ["flowHttpProvider", "$compile", "$cookies", function (f, c, cc) {
        return {
            restrict: "A",
            scope: {task: "=", page: "="},
            link: function (scope, element, attr) {

                if (!scope.task.permssionCache) {
                    scope.task.permssionCache = [];
                }
                if (attr.method) {
                    scope.method = attr.method;
                }


                var contains = false;

                for (var i = 0; i < scope.task.permssionCache.length; i++) {
                    var perm = scope.task.permssionCache[i];

                    if (perm.key === scope.page.name + "_" + scope.method) {
                        contains = true;
                        if (!perm.value) {
                            element.addClass("hidden");
                        }
                        break;
                    }

                }
                if (!contains) {
                    f.get(f.permissionUrl + "?authorization=" + cc.authorization + "&pageName=" + scope.page.name + "&method=" + scope.method, scope.task)
                        .success(function (data) {
                            if (!data) {
                                scope.task.permssionCache.push({
                                    key: scope.page.name + "_" + scope.method,
                                    value: data
                                });
                                element.addClass("hidden");
                            }
                        });

                }
            }

        }
    }])
    .directive("flowTooltip", [function () {
        return {
            restrict: "A",
            link: function (scope, element, attr) {

                scope.tooltipTime = 400;

                if (attr.tooltipTime) {
                    scope.tooltipTime = attr.tooltipTime;
                }

                if (attr.tooltipHeaderTitle) {
                    scope.tooltipHeaderTitle = attr.tooltipHeaderTitle;
                }

                if (attr.tooltipPosition) {
                    scope.tooltipPosition = attr.tooltipPosition;
                }

                if (attr.tooltipEvent) {
                    scope.tooltipEvent = attr.tooltipEvent;
                }

                if (attr.tooltipTitle) {
                    scope.tooltipTitle = attr.tooltipTitle;
                }


                if (attr.tooltipMy) {
                    scope.my = attr.tooltipMy;
                }

                if (attr.tooltipAt) {
                    scope.at = attr.tooltipAt;
                }


                if (!scope.tooltipPosition) {
                    scope.tooltipPosition = "{\"my\":\"top center\",\"at\":\"bottom center\"}";
                }


                if (!scope.tooltipEvent) {
                    scope.tooltipEvent = "hover";
                }

                scope.position = JSON.parse(scope.tooltipPosition);

                if (scope.my) {
                    scope.position.my = scope.my;
                }

                if (scope.at) {
                    scope.position.at = scope.at;
                }

                scope.tooltip = $(element[0]).qtip({
                        content: {
                            title: scope.tooltipHeaderTitle,
                            text: scope.tooltipTitle
                        },
                        position: {
                            at: scope.position.at,
                            my: scope.position.my,
                            adjust: {
                                method: "none shift"
                            }
                        }, hide: {
                            event: 'click',
                            inactive: scope.tooltipTime
                        },
                        style: "qtip-dark"
                    }
                );

                scope.api = scope.tooltip.qtip("api");

                scope.$watch(function () {
                    return $(element[0]).attr("tooltip-title")
                }, function (newValue) {
                    scope.api.set(
                        "content.text", newValue
                    );
                });


            }

        }
    }])
    .directive("flowEdit", [function () {
        return {
            restrict: "AE",
            replace: true,
            transclude: true,
            template: "<div class='form-group'><label class='control-label col-sm-2'>{{label}}<span style='color: #ea520a' ng-show='required'>*</span></label><div class='col-sm-10 marginBottom5px' ng-transclude></div></div>",
            link: function (scope, element, attr) {
                if (attr.label) {
                    scope.label = attr.label;
                }

                if (attr.required) {
                    if (attr.required.toLowerCase() === "true") {
                        scope.required = true;
                    } else {
                        scope.required = false;
                    }
                }
            }
        }
    }])
    .directive("flowImage", ["$timeout", "$upload", "$cookies", "flowHttpProvider", function (t, u, ck, fh) {
        return {
            scope: {
                model: "=",
                label: "@",
                required: "=",
                url: "@",
                method: "@",
                task: "=",
                sourceUrl: "@",
                fileChanged: "&"
            },
            replace: true,
            template: "<div class='form-group'><label class='control-label col-sm-2'>{{label}}<span style='color: #ea520a' ng-show='required'>*</span></label>" +
            "<div class='col-sm-10'><div class='flow-group-icon' accept='image/*' ng-model='preview' ng-file-drop drag-over-class=\"{accept:'flow-group-icon-accept', reject:'flow-group-icon-error', delay:100}\">" +
            "<img class='thumbnail' style='border-radius: 5px' width='198px' height='173px' ng-src='{{preview[0].dataUrl}}'/></div>" +
            "<div class='marginBottom5px'><span accept='image/*' class='btn btn-info' ng-file-change='onFileSelect(preview[0],$files)' ng-file-select ng-model='preview'>" +
            "<span class='fa fa-image'></span>&nbsp;&nbsp;{{preview[0].dataUrl != null ? 'Change' : 'Attach'}}</span></span></div></div></div>",
            link: function (scope) {
                scope.fileReaderSupported = window.FileReader != null && (window.FileAPI == null || FileAPI.html5 != false);
                scope.preview = [];
                var tries = 0;
                scope.refresh = function () {
                    t(function () {
                        if (scope.model) {
                            if (scope.sourceUrl) {
                                scope.preview[0] = {};
                                scope.preview[0].dataUrl = fh.host + scope.sourceUrl + scope.model;
                            }
                        } else {
                            if (tries == 3) {
                                tries = 0;
                            } else {
                                tries++;
                                scope.refresh();
                            }
                        }
                    }, 800);
                };
                scope.refresh();

                scope.onFileSelect = function (file) {

                    if (file != null) {
                        if (scope.fileReaderSupported && file.type.indexOf('image') > -1) {
                            t(function () {
                                var fileReader = new FileReader();
                                fileReader.readAsDataURL(file);
                                fileReader.onload = function (e) {
                                    t(function () {
                                        file.dataUrl = e.target.result;
                                    });
                                };
                                var bufferRead = new FileReader();

                                bufferRead.readAsArrayBuffer(file);
                                bufferRead.onload = function (e) {
                                    t(function () {
                                        file.data = e.target.result;
                                        u.upload({
                                            url: fh.host + scope.url,
                                            method: scope.method,
                                            headers: {
                                                "flow-container-id": "_id_fpb_" + scope.task.id,
                                                "Authorization": "Basic " + ck.authorization,
                                                "flowPage": scope.task.currentPage,
                                                "flowUploadFileId": scope.model
                                            },
                                            data: {file: file}
                                        }).progress(function (evt) {
                                            file.progress = parseInt(100.0 * evt.loaded / evt.total);
                                        }).success(function (data, status, headers, config) {
                                            $("#_id_fpb_" + scope.task.id).loadingOverlay("remove");
                                            scope.model = data.id;
                                            scope.fileChanged();

                                        }).error(function (data, status, headers, config) {
                                            $("#_id_fpb_" + scope.task.id).loadingOverlay("remove");
                                        });
                                    });

                                }
                            });
                        }
                    }
                };

            }
        }
    }])
    .directive("flowLoader", ["flowLoaderService", function (fls) {

        return {
            restrict: "AE",
            scope: {loaderClass: "@"},
            transclude: true,
            template: "<span><i class='text-inverse' ng-show='!flowLoaderService.loaded' ng-class='loaderClass'></i><span ng-show='flowLoaderService.loaded' ng-transclude></span></span>",
            replace: true,
            link: function (scope, element) {
                scope.flowLoaderService = fls;
                scope.flowLoaderService.loaded = true;
            }

        }

    }])
    .directive("fluidLoader", ["flowLoaderService", function (fls) {

        return {
            restrict: "AE",
            scope: {idleClass: "@"},
            transclude: true,
            template: "<span><i class='text-inverse' ng-show='flowLoaderService.loaded' ng-class='idleClass'></i><span ng-show='!flowLoaderService.loaded' ng-transclude></span></span>",
            replace: true,
            link: function (scope, element) {
                scope.flowLoaderService = fls;
                scope.flowLoaderService.loaded = true;
            }

        }

    }])
    .directive("flowDatePicker", ["$filter", function (f) {
        return {
            restrict: "AE",
            scope: {
                name: "@",
                model: "=",
                label: "@",
                format: "@",
                required: "=",
                disabled: "="
            },
            templateUrl: "templates/fluid/fluidDatePicker.html",
            replace: true,
            link: function (scope, elem, attr) {

                if (scope.model) {
                    scope.temp = scope.model;
                }

                if (scope.format === undefined) {
                    scope.format = "mm/dd/yyyy";
                }

                var inDatepicker = $(elem[0]).find(".datepicker").datepicker({
                    format: scope.format,
                    forceParse: false,
                    language: "en"
                });

                if (!scope.name) {
                    scope.name = scope.label.trim();
                }

                scope.convertToTimestamp = function () {
                    var date = $(elem[0]).find(".datepicker").datepicker("getDate");
                    var convertedDate = new Date(date).getTime();
                    scope.model = convertedDate;
                }

            }

        }
    }])
    .directive("flowRadio", ["$compile", function (c) {
        return {
            scope: {
                name: "@",
                model: "=",
                label: "@",
                required: "=",
                disabled: "=",
                direction: "@",
                group: "@",
                options: "="
            },
            restrict: "AE",
            replace: true,
            templateUrl: "templates/fluid/fluidRadio.html",
            link: function (scope, element) {

                if (scope.group === undefined) {
                    scope.group = "optRadio";
                }
                if (scope.direction === undefined) {
                    scope.direction = "horizontal";
                }

                var parent = element[0];
                var parentDiv = $(element[0]).find(".fluid-radio").get();
                var div = undefined;

                for (var i = 0; i < scope.options.length; i++) {
                    var option = scope.options[i];

                    if (div) {
                        if (scope.direction === "vertical") {
                            div = $("<div>").addClass("radio").appendTo(parentDiv);
                        }
                    } else {
                        div = $("<div>").addClass("radio").appendTo(parentDiv);
                        if (scope.direction === "horizontal") {
                            $(div).addClass("fluid-radio-horizontal");
                        }
                    }


                    if (scope.disabled) {
                        option.disabled = scope.disabled;
                    }

                    if (scope.required) {
                        option.required = scope.required;
                    }

                    var label = $("<label>").html(option.label).appendTo(div).get();

                    var radio = $("<input>").attr("name", scope.group).attr("type", "radio").attr("ng-click", "select('" + option.value + "')").prependTo(label).get();


                    if (option.disabled) {
                        $(radio).attr("ng-disabled", option.disabled);
                    }

                    if (option.required) {
                        $(radio).attr("ng-required", option.required);
                    }

                    if (scope.model) {
                        if (option.value === scope.model) {
                            $(radio).prop("checked", true);
                        }
                    }

                }

                scope.select = function (value) {
                    scope.model = value;
                }

                c(element.contents())(scope);
            }
        }
    }]);


function setChildIndexIds(element, taskId, suffix, depth) {
    var children = $(element).children();
    var id = $(element).attr("id");
    if (id) {
        id = id + "{{$index}}tsk" + taskId + "suf" + suffix + "dep" + depth;

    } else {
        id = "grid{{$index}}tsk" + taskId + "suf" + suffix + "dep" + depth;
    }
    ++depth;
    $(element).attr("id", id);
    if (children.length > 0) {
        for (var i = 0; i < children.length; i++) {
            var element = children[i];
            setChildIndexIds(element, taskId, suffix + "_" + i, depth);
        }
    } else {
        return;
    }
}

flowComponents
    .service("flowFrameService", ["$cookies", "$timeout", function (c, t) {
        this.isSearch = false;
        this.searchTask = "";
        if (this.taskList === undefined) {
            this.taskList = [];
            c.taskList = this.taskList;
        }

        this.pushTask = function (task) {
            this.taskList.push(task);
        };

        this.addTask = function (url, origin, newTask) {

            var genericTask = this.createGenericTask();

            genericTask.origin = origin;

            this.taskList.push(genericTask);

            genericTask.index = this.taskList.length - 1;

            genericTask.url = url;

            genericTask.newTask = newTask;

            var index = this.taskList.length - 1;

            t(function () {
                $(".frame-content").scrollTo($("div.box[task]:eq(" + index + ") div"), 200);
            });
        };

        this.toggleSearch = function () {
            this.isSearch = !this.isSearch;
            if (this.isSearch === false) {
                this.searchTask = "";
            }
        }


        this.createGenericTask = function () {

            var genericTask = Task();

            genericTask.id = "gen_id_";

            var countGeneric = 0;

            angular.forEach(this.taskList, function (task) {
                if ((task.id + "").indexOf("gen_id_") > -1) {
                    countGeneric++;
                }
            });

            genericTask.id = genericTask.id + "" + countGeneric;


            genericTask.size = 50;

            genericTask.active = true;

            genericTask.glyph = "fa fa-tasks";

            genericTask.title = "...";

            genericTask.generic = true;


            return genericTask;
        };


        this.buildTask = function (task) {

            /* Task event */
            task.preLoad = function () {
            };
            task.load = function () {
            };
            task.postLoad = function () {
            }
            task.onWindowClosing = function (page) {
                return true;
            }
            task.onWindowHiding = function (page) {
                return true;
            }
            task.onWindowOpening = function () {
                return true;
            }
            task.onWindowOpened = function () {
            }
            task.onWindowPinned = function (page) {

            }
            task.onWindowActive = function (page) {
            }

            return task;
        }

        return this;

    }])
    .service("flowHttpProvider", ["$rootScope", "$http", "flowLoaderService", "$cookies", "$resource", function (rs, h, fl, c, r) {

        this.post = function (url, data, task) {
            var promise = null;
            if (this.host) {
                url = this.host + url;
            }

            var headers = {"flow-container-id": "_id_fpb_" + task.id, "Content-type": "application/json"};

            if (task.currentPage) {
                headers.method = "post";
                headers.flowPage = task.currentPage;
            }


            if (data === undefined) {
                promise = h({
                    method: "post",
                    url: url,
                    headers: headers
                });


                promise.success(function (config) {
                    $("#_id_fpb_" + task.id).loadingOverlay("remove");
                });

                promise.error(function (data, status, headers, config) {
                    $("#_id_fpb_" + task.id).loadingOverlay("remove");
                    if (status === 401) {
                        rs.$broadcast("NOT_AUTHENTICATED", data.msg);
                    } else if (status === 403) {
                        rs.$broadcast(EVENT_NOT_ALLOWED + task.id, data.msg);
                    }
                });


                return promise;
            }

            promise = h({
                method: "post",
                url: url,
                data: data,
                headers: headers
            });

            promise.success(function (config) {
                $("#_id_fpb_" + task.id).loadingOverlay("remove");
            });

            promise.error(function (data, status, headers, config) {
                $("#_id_fpb_" + task.id).loadingOverlay("remove");
                if (status === 401) {
                    rs.$broadcast("NOT_AUTHENTICATED");
                } else if (status === 403) {
                    rs.$broadcast("NOT_ALLOWED");
                }
            });


            return promise;
        };


        this.postGlobal = function (url, data) {
            var promise = null;
            if (this.host) {
                url = this.host + url;
            }


            if (data === undefined) {
                promise = h({
                    method: "post",
                    url: url
                });

                return promise;
            }

            promise = h({
                method: "post",
                url: url,
                data: data
            });

            return promise;
        };


        this.put = function (url, data, task) {
            var promise = null;
            if (this.host) {
                url = this.host + url;
            }

            var headers = {"flow-container-id": "_id_fpb_" + task.id, "Content-type": "application/json"};

            if (task.currentPage) {
                headers.method = "put";
                headers.flowPage = task.currentPage;
            }

            if (data === undefined) {
                promise = h({
                    method: "put",
                    url: url,
                    headers: headers
                });

                promise.success(function (config) {
                    $("#_id_fpb_" + task.id).loadingOverlay("remove");
                });

                promise.error(function (data, status, headers, config) {
                    $("#_id_fpb_" + task.id).loadingOverlay("remove");
                    if (status === 401) {
                        rs.$broadcast("NOT_AUTHENTICATED", data.msg);
                    } else if (status === 403) {
                        rs.$broadcast(EVENT_NOT_ALLOWED + task.id, data.msg);
                    }
                });

                return promise;
            }
            promise = h({
                method: "put",
                url: url,
                data: data,
                headers: headers
            });

            promise.success(function (config) {
                $("#_id_fpb_" + task.id).loadingOverlay("remove");
            });

            promise.error(function (data, status, headers, config) {
                $("#_id_fpb_" + task.id).loadingOverlay("remove");
                if (status === 401) {
                    rs.$broadcast("NOT_AUTHENTICATED");
                } else if (status === 403) {
                    rs.$broadcast(EVENT_NOT_ALLOWED + task.id, data.msg);
                }
            });

            return promise;
        };
        this.putGlobal = function (url, data) {
            var promise = null;
            if (this.host) {
                url = this.host + url;
            }

            var headers = {"Content-type": "application/json"};


            if (data === undefined) {
                promise = h({
                    method: "put",
                    url: url,
                    headers: headers
                });

                promise.error(function (data, status, headers, config) {
                    if (status === 401) {
                        rs.$broadcast("NOT_AUTHENTICATED", data.msg);
                    }
                });

                return promise;
            }

            promise = h({
                method: "put",
                url: url,
                data: data,
                headers: headers
            });

            promise.error(function (data, status, headers, config) {
                if (status === 401) {
                    rs.$broadcast("NOT_AUTHENTICATED");
                }
            });

            return promise;
        };
        this.getLocal = function (url) {
            if (this.host) {
                url = this.host + url;
            }
            var promise = h({
                method: "get",
                url: url
            });
            promise.error(function (data, status, headers, config) {
                if (status === 401) {
                    rs.$broadcast("NOT_AUTHENTICATED", data.msg);
                } else if (status === 403) {
                    rs.$broadcast("NOT_ALLOWED", data.msg);
                }
            });

            return promise;
        };
        this.getGlobal = function (url, progress) {

            fl.enabled = progress;

            if (this.host) {
                url = this.host + url;
            }

            var promise = h({
                method: "get",
                url: url
            });

            promise.error(function (data, status, headers, config) {
                if (status === 401) {
                    rs.$broadcast("NOT_AUTHENTICATED", data.msg);
                } else if (status === 403) {
                    rs.$broadcast("NOT_ALLOWED", data.msg);
                }
            });

            return promise;
        };
        this.get = function (url, task) {

            if (this.host) {
                url = this.host + url;
            }
            var headers = {
                "flow-container-id": "_id_fpb_" + task.id,
                "Content-type": "application/json",
                "Authorization": "Basic " + c.authorization
            };

            if (task.currentPage) {
                headers.method = "get";
                headers.flowPage = task.currentPage;
            }
            var promise = h({
                method: "get",
                url: url,
                headers: headers
            });

            promise.success(function (config) {
                $("#_id_fpb_" + task.id).loadingOverlay("remove");
            });

            promise.error(function (data, status, headers, config) {
                $("#_id_fpb_" + task.id).loadingOverlay("remove");
                if (status === 401) {
                    rs.$broadcast("NOT_AUTHENTICATED", data.msg);
                } else if (status === 403) {
                    rs.$broadcast(EVENT_NOT_ALLOWED + task.id, data.msg);
                }
            });

            return promise;
        };
        this.delete = function (url, task) {
            if (this.host) {
                url = this.host + url;
            }
            var headers = {"flow-container-id": "_id_fpb_" + task.id, "Content-type": "application/json"};

            if (task.currentPage) {
                headers.method = "delete";
                headers.flowPage = task.currentPage;
            }
            var promise = null;

            promise = h({
                method: "delete",
                url: url,
                headers: headers
            });

            promise.success(function (config) {
                $("#_id_fpb_" + task.id).loadingOverlay("remove");
            });

            promise.error(function (data, status, headers, config) {
                $("#_id_fpb_" + task.id).loadingOverlay("remove");
                if (status === 401) {
                    rs.$broadcast("NOT_AUTHENTICATED", data.msg);
                } else if (status === 403) {
                    rs.$broadcast(EVENT_NOT_ALLOWED + task.id, data.msg);
                }
            });

            return promise;
        };

        this.getResource = function (url, task) {

            /*   var headers = {
             "flow-container-id": "_id_fpb_" + task.id,
             "Content-type": "application/json",
             "Authorization": "Basic " + c.authorization
             };

             if (task.currentPage) {
             headers.method = "get";
             headers.flowPage = task.currentPage;
             }
             var promise = h({
             method: "get",
             url: url,
             headers: headers
             });

             promise.success(function (config) {
             $("#_id_fpb_" + task.id).loadingOverlay("remove");
             });

             promise.error(function (data, status, headers, config) {
             $("#_id_fpb_" + task.id).loadingOverlay("remove");
             if (status === 401) {
             rs.$broadcast("NOT_AUTHENTICATED", data.msg);
             } else if (status === 403) {
             rs.$broadcast(EVENT_NOT_ALLOWED + task.id, data.msg);
             }
             });*/

            return r(url);
        }
        this.updateResource = function (url, data, task) {
            var headers = {"flow-container-id": "_id_fpb_" + task.id, "Content-type": "application/json"};

            if (task.currentPage) {
                headers.method = "get";
                headers.flowPage = task.currentPage;
            }
            console.log(url);

            if (data === undefined) {
                promise = h({
                    method: "get",
                    url: url,
                    headers: headers
                });

                promise.success(function (config) {
                    $("#_id_fpb_" + task.id).loadingOverlay("remove");
                });

                promise.error(function (data, status, headers, config) {
                    $("#_id_fpb_" + task.id).loadingOverlay("remove");
                    if (status === 401) {
                        rs.$broadcast("NOT_AUTHENTICATED", data.msg);
                    } else if (status === 403) {
                        rs.$broadcast(EVENT_NOT_ALLOWED + task.id, data.msg);
                    }
                });

                return promise;
            }
            promise = h({
                method: "get",
                url: url,
                data: data,
                headers: headers
            });

            promise.success(function (config) {
                $("#_id_fpb_" + task.id).loadingOverlay("remove");
            });

            promise.error(function (data, status, headers, config) {
                $("#_id_fpb_" + task.id).loadingOverlay("remove");
                if (status === 401) {
                    rs.$broadcast("NOT_AUTHENTICATED");
                } else if (status === 403) {
                    rs.$broadcast(EVENT_NOT_ALLOWED + task.id, data.msg);
                }
            });

            return promise;
        }
        return this;

    }])
    .service("flowControlService", [function () {

        this.controls = [];

        return this;
    }])
    .service("flowMessageService", ["$timeout", function (t) {
        var flowMessageService = {};

        flowMessageService.duration = 1000;

        flowMessageService.info = function (id, message, duration) {
            flowMessageService.id = id;
            flowMessageService.message = message;
            flowMessageService.alertType = "alert alert-info";
            flowMessageService.duration = duration;
            return flowMessageService;
        };

        flowMessageService.warning = function (id, message, duration) {
            flowMessageService.id = id;
            flowMessageService.message = message;
            flowMessageService.alertType = "alert alert-warning";
            flowMessageService.duration = duration;
            return flowMessageService;
        };

        flowMessageService.danger = function (id, message, duration) {
            flowMessageService.id = id;
            flowMessageService.message = message;
            flowMessageService.alertType = "alert alert-danger";
            flowMessageService.duration = duration;
            return flowMessageService;
        };

        flowMessageService.success = function (id, message, duration) {
            flowMessageService.id = id;
            flowMessageService.message = message;
            flowMessageService.alertType = "alert alert-success";
            flowMessageService.duration = duration;
            return flowMessageService;
        };

        flowMessageService.open = function () {
            var messageId = "#" + flowMessageService.id;

            var alerts = $(messageId).find("div[flow-msg]").get();

            var index = 0;
            if (alerts) {
                index = alerts.length;
            }

            var alertContainer = $(messageId).get();
            var alert = $("<div>").attr("flow-msg", index).addClass("animated pulse anim-dur").addClass(flowMessageService.alertType).appendTo(alertContainer).get();

            $("<button>").attr("type", "button").addClass("close icon-cross").attr("data-dismiss", "alert").appendTo(alert).get();

            $("<span>").html(flowMessageService.message).appendTo(alert);

            t(function () {
                $(alert).remove();
            }, flowMessageService.duration);
        };

        flowMessageService.close = function (messageId) {
            $(messageId).find("p").html("");
            $(messageId).removeClass(flowMessageService.alertType);
            $(messageId).alert('close');
        };

        return flowMessageService;
    }])
    .service("flowModalService", [function () {
        var flowModalService = {};

        flowModalService.show = function (id) {
            $("#" + id).removeClass("hidden");
            $(".frame-content").scrollTo($("#" + id), 800);
        };

        flowModalService.hide = function (id, sourceId) {
            $("#" + id).addClass("hidden");
            if (sourceId) {
                $(".frame-content").scrollTo($("#" + sourceId), 800);
            }
        };

        return flowModalService;
    }])
    .service("flowLoaderService", [function () {
        this.loaded = true;
        this.enabled = true;
        return this;
    }])
    .service("flowNotificationService", [function () {

        this.flowNotifications = [];

        return this;


    }])
    .service("browser", ["$window", function (w) {

        return function () {

            var userAgent = w.navigator.userAgent;

            var browsers = {chrome: /chrome/i, safari: /safari/i, firefox: /firefox/i, ie: /internet explorer/i};


            for (var key in browsers) {
                if (browsers[key].test(userAgent)) {
                    return key;
                }
            }


            return 'unknown';
        }

    }]);

flowComponents
    .factory("flowInjector", ["$q", "$rootScope", "$cookies", "flowLoaderService", "responseEvent", function (q, rs, c, fls, r) {

        return {
            "request": function (config) {
                if (fls.enabled) {
                    fls.loaded = false;
                }
                if (config.headers['flow-container-id'] !== undefined) {
                    $('#' + config.headers['flow-container-id']).loadingOverlay();
                    config.headers["Access-Control-Allow-Origin"] = "*";

                }
                if (c.authorization !== undefined) {
                    config.headers['Authorization'] = "Basic " + c.authorization;
                }
                return config;
            }
            ,
            "requestError": function (rejection) {
                fls.loaded = true;
                fls.enabled = true;
                return q.reject(rejection);
            },
            "response": function (response) {
                fls.loaded = true;
                fls.enabled = true;
                r.callEvent(response);
                return response;
            },
            "responseError": function (rejection) {
                fls.loaded = true;
                fls.enabled = true;
                return q.reject(rejection);
            }
        };
    }])
    .factory("responseEvent", ["$location", "$rootScope", function (l, rs) {

        var responseEvent = {};
        responseEvent.responses = [];
        responseEvent.addResponse = function (evt, statusCode, redirect, path) {

            responseEvent.responses.push({
                "evt": evt,
                "statusCode": statusCode,
                "redirect": redirect,
                "path": path
            });

        }

        responseEvent.callEvent = function (res) {

            angular.forEach(responseEvent.responses, function (response) {
                if (response.statusCode === res.statusCode) {
                    if (response.evt) {
                        rs.$broadcast(response.evt, response.data, response.statusText);
                    } else if (response.redirect) {
                        l.path(response.path);
                    }

                }
            });
        }

        return responseEvent;

    }]);


/**Prototypes**/
function Task() {
    var task = {};

    task.id = undefined;

    task.glyph = undefined;

    task.title = undefined;

    task.active = undefined;

    task.size = undefined;

    task.pinned = undefined;

    task.locked = undefined;

    this.url = undefined;

    return task;
}

function Control() {
    var control = {};
    control.id = undefined;
    control.glyph = undefined;
    control.label = undefined;
    control.disabled = undefined;
    return control;
}


var eventInterceptorId = "event_interceptor_id_";
var goToEventID = "event_got_id_";
var EVENT_NOT_ALLOWED = "not_allowed_";


function generateTask(scope, t, f2) {

    if (scope.page === undefined || scope.page === null) {
        if (scope.task.pages) {
            var $page = getHomePageFromTaskPages(scope.task);
            scope.page = $page.page;
            scope.homeUrl = $page.page.get;
            scope.home = $page.page.name;
            scope.pages = [$page.page];
        }
    } else {
        scope.homeUrl = scope.page.get;
        scope.page.param = scope.task.pageParam;
        var page = scope.task.page;

        if (scope.page.isHome === false) {
            if (scope.task.pages) {
                var $page = getHomePageFromTaskPages(scope.task);
                scope.home = $page.page.name;
                scope.pages = [$page.page];
            }
        } else {
            scope.pages = [page];
        }

        if (scope.page.param && scope.page.param !== "null") {
            scope.homeUrl = scope.page.get + scope.page.param;
        }

        if (scope.pages.indexOf(page) > -1) {
            scope.currentPageIndex = getPageIndexFromPages(scope.page.name, scope.pages).index;
        } else {
            scope.pages.push(page);
            scope.currentPageIndex = scope.pages.length - 1;
        }

        for (var i = 0; i < scope.toolbars.length; i++) {
            if (scope.toolbars[i].id === 'back') {
                scope.toolbars[i].disabled = !(scope.currentPageIndex > 0);
            }
            if (scope.toolbars[i].id === 'forward') {
                scope.toolbars[i].disabled = !(scope.currentPageIndex < scope.pages.length - 1);
            }
        }
    }

    scope.userTask.flowId = scope.task.flowId;

    if (scope.task.id.indexOf("gen") === -1 && scope.task.newTask === true) {
        scope.userTask.flowTaskId = scope.task.id.split("_")[0];
        scope.userTask.flowId = scope.task.flowId;
        f2.post("services/flow_user_task_crud/save_task_state?newTask=true", scope.userTask, scope.task);
    }

    var loadGetFn = function () {

        /*pre-load*/


        if (scope.task.preLoaded === undefined || scope.task.preLoaded === false) {
            scope.task.preLoad();
            scope.task.preLoaded = true;
        }
        scope.loadGet();
        $("#rfh_btn_" + scope.task.id).find("span").removeClass("fa-spin");

        if (scope.task.preLoaded) {
            scope.task.load();
        }
        scope.task.postLoad();

    };


    t(loadGetFn, 500);
}