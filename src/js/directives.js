/**
 * Created by Jerico on 11/29/2014.
 */
var directives = angular.module("flowAppDirectives", ["fluid", "ngFileUpload"]);


/* Framework Helper */
directives.directive("addPages", ["flowHttpService", "flowModalService", "$compile", function (f, fm, c) {
    return {
        scope: {task: "=", pageUrl: "@", targetList: "=", id: "@", disabled: "="},
        restrict: "AE",
        replace: true,
        template: "<button ng-disabled='disabled' type='button' ng-click='look()' class='btn btn-info'>Add pages</button>",
        link: function (scope, element) {


            if (!scope.id) {
                scope.id = "pg_pf_ed_" + scope.task.id;
            }

            var parent = $(element[0]).parent().get();

            var modal = $("<div>").attr("id", "{{id}}_pge_slt_mdl").addClass("modal fade fluid-modal").appendTo(parent).get();

            var modalContent = $("<div>").addClass("modal-dialog modal-lg").attr("id", "{{id}}_mdl_cnt").appendTo(modal).get();

            var modalPanel = $("<div>").addClass("panel panel-default").appendTo(modalContent).get();

            var modalPanelHeading = $("<div>").addClass("panel-heading").appendTo(modalPanel).get();

            var spanTitle = $("<span>").addClass("text-info").addClass("col-lg-5 col-md-5 col-sm-3 col-xs-3").html("Select a page").appendTo(modalPanelHeading).get();

            var inputGroup = $("<div>").addClass("col-lg-7 col-md-7 col-sm-9 col-xs-9").addClass("input-group").appendTo(modalPanelHeading).get();

            var inputSearch = $("<input>").addClass("form-control").attr("type", "text").attr("ng-model", "search").appendTo(inputGroup).get();

            var inputSpan = $("<span>").addClass("input-group-addon").appendTo(inputGroup).get();

            $("<i>").addClass("fa fa-search").appendTo(inputSpan);

            var modalPanelBody = $("<div>").addClass("panel-body").attr("style", "overflow:auto;height:200px").appendTo(modalPanel).get();

            var modalPanelFooter = $("<div>").addClass("panel-footer").attr("style", "height:50px").appendTo(modalPanel).get();

            var pullRightFooterDiv = $("<div>").addClass("pull-right").appendTo(modalPanelFooter).get();

            var buttonGroup = $("<div>").addClass("btn-group btn-group-sm").appendTo(pullRightFooterDiv).get();

            var closeButton = $("<button>").addClass("btn btn-info").attr("ng-click", "close()").attr("type", "button").html("close").appendTo(buttonGroup).get();

            var modalTable = $("<table>").addClass("table table-responsive table-hover").appendTo(modalPanelBody).get();

            var mThead = $("<thead>").appendTo(modalTable).get();

            var mTheadRow = $("<tr>").appendTo(mThead).get();

            var mTbody = $("<tbody>").appendTo(modalTable).get();

            var mTr = $("<tr>").attr("ng-repeat", "page in pages | filter:search").attr("ng-click", "addToList(page)").appendTo(mTbody).get();

            var td = $("<td>").html("{{page.name}}").appendTo(mTr).get();

            scope.close = function () {
                fm.hide(scope.id + "_pge_slt_mdl");
            };

            scope.addToList = function (page) {
                var flowPermission = {
                    "flowPageId": page.id,
                    "flowPageName": page.name,
                    "put": true,
                    "get": true,
                    "post": true,
                    "del": true
                };
                var contains = false;
                for (var i = 0; i < scope.targetList.length; i++) {
                    var fp = scope.targetList[i];
                    if (fp.flowPageName === flowPermission.flowPageName) {
                        contains = true;
                        break;
                    }
                }

                if (!contains) {
                    scope.targetList.push(flowPermission);
                    scope.pages.splice(scope.pages.indexOf(page), 1);
                } else {
                    $(modalContent).addClass("shake");
                    $(modalContent).one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", function () {
                        $(modalContent).removeClass("shake");
                    });
                }
            };

            scope.look = function () {
                f.get(scope.pageUrl, scope.task).success(function (pages) {
                    scope.pages = pages;
                    angular.forEach(scope.targetList, function (pp) {
                        angular.forEach(scope.pages, function (p, key) {
                            if (p.id === pp.flowPageId) {
                                scope.pages.splice(key, 1);
                            }
                        });
                    });
                    fm.show(scope.id + "_pge_slt_mdl");
                });
            };

            c(modal)(scope);

        }
    }
}]);
directives.directive("addAllPages", ["flowHttpService", function (f) {

    return {
        scope: {task: "=", pageUrl: "@", targetList: "=", id: "@", disabled: "="},
        restrict: "AE",
        replace: true,
        template: "<button ng-disabled='disabled' type='button' ng-click='addAll()' class='btn btn-info'>Add all pages</button>",
        link: function (scope) {


            scope.addAll = function () {
                f.get(scope.pageUrl, scope.task).success(function (pages) {
                    scope.pages = pages;

                    angular.forEach(scope.pages, function (page) {
                        var flowPermission = {
                            "flowPageId": page.id,
                            "flowPageName": page.name,
                            "put": true,
                            "get": true,
                            "post": true,
                            "del": true
                        };
                        var contains = false;
                        for (var i = 0; i < scope.targetList.length; i++) {
                            var fp = scope.targetList[i];
                            if (fp.flowPageName === flowPermission.flowPageName) {
                                contains = true;
                                break;
                            }
                        }

                        if (!contains) {
                            scope.targetList.push(flowPermission);
                            scope.pages.splice(scope.pages.indexOf(page), 1);
                        }
                    });
                });
            }

        }
    }
}]);
directives.directive("fluidMenu", function ($parse, $compile, $timeout, flowHttpService, flowFrameService, UserFactory) {
    return {
        link: function ($scope, element, attributes) {
            $scope._menu = {status: [], collapse: {}, hover: []};
            $scope.dataMap = [];
            $scope._menu.mouseleave = function () {
                for (var j = 0; j < $scope._menu.hover.length; j++) {
                    $scope._menu.hover[j] = '';
                }
            };
            $scope._menu.mouseover = function (i) {
                for (var j = 0; j < $scope._menu.hover.length; j++) {
                    $scope._menu.hover[j] = '';
                }
                $scope._menu.hover[i] = 'nav-hover';
            };
            $scope._menu.collapse = function (i) {
                $scope._menu.status[i] = !$scope._menu.status[i];

                var current = attributes.$$element.find('a[index=' + i + ']');

                current.parent('li').addClass('active').siblings().removeClass('active').children('ul').each(function () {
                    $scope._menu.status[$(this).attr('index')] = true;
                });

                if (current.hasClass('btn-fullscreen')) {
                    if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
                        if (document.documentElement.requestFullscreen) {
                            document.documentElement.requestFullscreen();
                        } else if (document.documentElement.msRequestFullscreen) {
                            document.documentElement.msRequestFullscreen();
                        } else if (document.documentElement.mozRequestFullScreen) {
                            document.documentElement.mozRequestFullScreen();
                        } else if (document.documentElement.webkitRequestFullscreen) {
                            document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
                        }
                    } else {
                        if (document.exitFullscreen) {
                            document.exitFullscreen();
                        } else if (document.msExitFullscreen) {
                            document.msExitFullscreen();
                        } else if (document.mozCancelFullScreen) {
                            document.mozCancelFullScreen();
                        } else if (document.webkitExitFullscreen) {
                            document.webkitExitFullscreen();
                        }
                    }
                }
            };

            $scope.$watch(function (scope) {
                return UserFactory.isAuthenticated();
            }, function (authenticated) {
                if (authenticated) {
                    var groupLength = 0;

                    var groups = UserFactory.getUser().flowGroups;

                    groupLength = groups.length - 1;

                    angular.forEach(groups, function (group, index) {

                        var groupLi = $("<li>").appendTo(element[0]).get();

                        var groupA = $("<a>").attr("href", "#").appendTo(groupLi).get();

                        $("<i>").addClass(group.iconUri).appendTo(groupA).get();

                        $("<span>").addClass("menu-title").html(group.title).appendTo(groupA).get();

                        $("<span>").addClass("fa arrow").appendTo(groupA).get();
                        if (group.flowModules && group.flowModules.length > 0) {
                            var moduleLength = group.flowModules.length - 1;
                            var subUl = $("<ul>").addClass("nav nav-second-level").appendTo(groupLi).get();
                            angular.forEach(group.flowModules, function (module, index2) {
                                $scope.dataMap.push({name: module.moduleName, data: module});

                                var subLi = $("<li>").appendTo(subUl).get();

                                var subA = $("<a>").attr("href", "#").attr("module", module.moduleName).appendTo(subLi).get();

                                $("<i>").addClass(module.moduleGlyph).appendTo(subA).get();

                                $("<span>").addClass("submenu-title").html(module.moduleTitle).appendTo(subA).get();

                                if (groupLength === index && moduleLength === index2) {
                                    $scope.loaded = true;
                                }
                            });
                        }
                    });

                } else {
                    $scope.loaded = true;
                }
            });


            $scope.openModule = function (moduleName) {

                angular.forEach($scope.dataMap, function (data) {
                    if (moduleName === data.name) {
                        this.task = data.data.task;
                    }
                }, $scope.data);

                if ($scope.data && $scope.data.task) {
                    flowFrameService.addTask($scope.data.task);
                }
            };

            $scope.reload = function () {
                $timeout(function () {
                    if ($scope.loaded) {
                        attributes.$$element.find('li').children('a').each(function (index, value) {
                            var module = $(value).attr("module");
                            $scope._menu.status[index] = true;
                            if (module) {
                                $(this).attr({
                                    'ng-click': '_menu.collapse(' + index + ');openModule(\"' + module + '\")',
                                    'index': index
                                });
                            } else {
                                $(this).attr({'ng-click': '_menu.collapse(' + index + ')', 'index': index});
                            }

                            $('>ul', $(this).parent('li')).attr({
                                'collapse': '_menu.status[' + index + ']',
                                'index': index
                            });
                        });

                        $(">li", attributes.$$element).each(function (index, value) {
                            $scope._menu.hover[index] = '';
                            $(this).attr({
                                'ng-mouseleave': '_menu.mouseleave()',
                                'ng-mouseover': '_menu.mouseover(' + index + ')',
                                'ng-class': '_menu.hover[' + index + ']'
                            });
                        });
                        $compile(element.contents())($scope);

                    } else {
                        $scope.reload();
                    }
                });
            };

            $scope.reload();
        }
    };
});
directives.directive("fluidSubTaskbar", ["flowFrameService", "$timeout", "$compile", function (f, t, c) {
    return {
        restrict: "A",
        link: function (scope, element) {

            var table = $("<table>").appendTo(element[0]).get();

            var tr = $("<tr>").appendTo(table).get();

            scope.loaded = false;


            scope.$watch(f.taskList, function () {
                angular.forEach(f.taskList, function (task, index) {

                    if (index > 9) {

                        var td = $("<td>").appendTo(tr).get();

                        var a = $("<a>").attr("href", "#").appendTo(td).get();

                        $("<i>").addClass("fluid-bar-icon").addClass(task.glyph).appendTo(a);

                        if (index % 3 === 0) {
                            tr = $("<tr>").appendTo(table).get();
                        }

                    }

                    if ((f.taskList.length - 1) === index) {
                        console.log("loaded");
                        scope.loaded = true;
                    }

                });
            });


            scope.reload = function () {
                t(function () {
                    if (scope.loaded) {
                        c(element.contens())(scope);
                    }
                    else {
                        scope.reload();
                    }

                });
            }

            scope.reload();

        }

    }
}]);
directives.directive("fluidReportTable", ["$compile", function (c) {
    return {
        scope: {table: "="},
        restrict: "AE",
        replace: true,
        transclude: true,
        template: "<div><ng-transclude></ng-transclude><table class='table table-condensed'></table></div>",
        link: function (scope, element, attr) {

            scope.table = {};
            scope.showHeaders = [];

            var reportColumns = element.find("report-column");

        }
    }
}]);
directives.directive("fluidReportColumn", ["$compile", function (c) {
    return {
        scope: true,
        link: function (scope, element, attr) {

            if (attr.removable) {
                scope.removable = (attr.removable === "true");
            }

            if (attr.headerTitle) {
                scope.headerTitle = attr.headerTitle;
                scope.field = scope.headerTitle.replace(" ", "");
            }

            if (attr.class) {
                scope.class = attr.class;
            }

            if (scope.removable) {
                var th = $("<th>").addClass(scope.class).attr("name", "removable_th_" + scope.field).attr("ng-init", "table.is_" + scope.field + "=true").get();
                $("<input>").attr("type", "checkbox").attr("ng-model", "table.is_" + scope.field).appendTo(th).get();
                element.append(th);
            }


            var th = $("<th>").addClass(scope.class).attr("name", "th_" + scope.field).html(scope.headerTitle).get();

            element.append(th);


            c(element.contents())(scope);
        },
        restrict: "E",
        replace: true,
        template: "<report-column></report-column>"
    }
}]);
directives.directive("fluidRenderWidth", [function () {
    return {
        restrict: "A",
        scope: {tableId: "@", headerName: "@"},

        link: function (scope, element, attr) {

            scope.$watch(function () {
                var table = $("#" + scope.tableId);
                return table.find("th:contains('" + scope.headerName + "')").width();
            }, function (newValue) {
                var value = newValue + 10;
                element.width(value);
            });
        }
    }
}]);
directives.directive("flowBarTooltip", ["$timeout", "flowFrameService", "flowHttpService", function (t, f, f2) {
    return {
        scope: {task: '=', index: "="},
        restrict: "A",
        link: function (scope, element, attr) {
            scope.tooltipTime = 400;
            if (scope.task === undefined) {
                throw "Task object must be assigned.";
            }

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

            if (scope.tooltipHeaderTitle === undefined) {
                scope.tooltipHeaderTitle = scope.task.title;
            }

            scope.position = JSON.parse(scope.tooltipPosition);

            if (scope.my) {
                scope.position.my = scope.my;
            }

            if (scope.at) {
                scope.position.at = scope.at;
            }

            scope.links = [];


            scope.$watch(function (scope) {
                return scope.task.generic || f.fullScreen
            }, function (newValue) {
                if (scope.task.generic === false) {
                    var content = "<ul class='nav nav-pills nav-stacked'>";

                    if (scope.task.pages) {
                        angular.forEach(scope.task.pages, function (page) {
                            if (page.pageLinkEnabled !== undefined && page.pageLinkEnabled === true) {
                                content += "<li page='" + page.name + "'>" +
                                    "<a href='#' class='color-white' >" + page.title + "</a>" +
                                    "</li>"
                            }
                        });
                    }

                    content += "<li><a href='#' class='color-white'>Minimize</a></li>";
                    if (!f.fullScreen) {
                        content += "<li><a href='#' class='color-white'>Fullscreen</a></li>";
                    } else {
                        content += "<li><a href='#' class='color-white'>Fluidscreen</a></li>";
                    }
                    content += "<li><a href='#' class='color-white'>Close</a></li>";

                    content += "</ul>"
                    scope.tooltip = $(element[0]).qtip({
                            content: {
                                title: scope.tooltipHeaderTitle,
                                text: content
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
                            style: "qtip-dark",
                            events: {
                                show: function (evt, api) {
                                    var list = api.elements.tooltip.find("li").get();
                                    angular.forEach(list, function (li, index) {

                                        var liElement = $(li);

                                        if (liElement.text() === "Minimize") {
                                            if (scope.task.active === false) {
                                                liElement.attr("style", "display:none");

                                            } else {
                                                liElement.attr("style", "display:block");
                                            }
                                        } else if (liElement.text() === "Close") {

                                        } else {
                                            var page = liElement.attr("page");

                                            if (scope.task.active === false) {
                                                liElement.attr("style", "display:none");

                                            } else {
                                                liElement.attr("style", "display:block");
                                            }
                                        }
                                        api.elements.tooltip.find("li:eq(" + index + ")")
                                            .click(function (event) {
                                                var current = $(this);
                                                if (current.attr("page")) {
                                                    var page = current.attr("page");
                                                    for (var p = 0; p < scope.task.pages.length; p++) {
                                                        var pg = scope.task.pages[p];
                                                        if (pg.name === page) {
                                                            if (f.fullScreen) {
                                                                scope.task.currentPage = {name: page};
                                                                f.fullScreenTask = scope.task;
                                                            } else {
                                                                scope.task.currentPage = {name: page};
                                                                t(function () {
                                                                    $(".frame-content").scrollTo($("div.box[task]:eq(" + scope.index + ") div.flow-panel"), 200);
                                                                });
                                                            }

                                                            if (!scope.$$phase) {
                                                                scope.$apply();
                                                            }


                                                        }
                                                    }
                                                } else if (current.text() === "Minimize") {
                                                    scope.task.hide();
                                                } else if (current.text() === "Close") {
                                                    scope.task.close();
                                                } else if (current.text() === "Fullscreen") {
                                                    scope.task.fullScreen();

                                                } else if (current.text() === "Fluidscreen") {
                                                    scope.task.fluidScreen();
                                                }
                                                api.toggle(false);
                                            }
                                        );
                                    });
                                }
                            }
                        }
                    );
                }
            });


        }

    }
}]);
directives.directive('flowProfileVisible', ["flowHttpService", function (f) {
    return {
        restrict: 'A',
        scope: {task: "=", profiles: "="},
        link: function (scope, iElement, iAttrs) {
            f.post("services/flow_permission/has_profile", scope.profiles, scope.task).
                success(function (data) {
                    if (data) {
                        iElement.removeClass("hidden");
                    } else {
                        iElement.addClass("hidden");
                    }
                });
        }
    };
}]);
directives.directive('fallbackSrc', function () {
    var fallbackSrc = {
        link: function postLink(scope, iElement, iAttrs) {
            iElement.bind('error', function () {
                angular.element(this).attr("src", iAttrs.fallbackSrc);
            });
        }
    };
    return fallbackSrc;
});

directives.directive("flowPermissionEnabled", ["flowHttpService", "$compile", "sessionService", "UserFactory", function (f, c, ss, uf) {
    return {
        restrict: "A",
        scope: {task: "=", page: "="},
        link: function (scope, element, attr) {
            if (attr.method) {
                scope.method = attr.method;
            }

            console.info("permissionEnabled-url", f.permissionUrl + "?pageName=" + scope.page.name + "&method=" + scope.method);

            var url = "pageName=" + scope.page.name + "&method=" + scope.method;

            var enabled = ss.getSessionProperty(url);

            console.debug("permissionEnabled", enabled);

            if (enabled != null) {
                console.debug("permissionEnabled-old", enabled);
                if (enabled === false) {
                    element.attr("disabled", "");
                }
            } else {
                var profiles = uf.getUser().flowUserProfiles;

                if (profiles) {

                    if (enabled == null && enabled !== false) {
                        enabled = false;
                        var profileLength = profiles.length - 1;
                        angular.forEach(profiles, function (profile, $index) {
                            if (!enabled) {
                                var flowProfilePermissionList = profile.flowProfilePermissions;
                                angular.forEach(flowProfilePermissionList, function (permission) {
                                    if (!enabled) {
                                        if (scope.page.name === permission.flowPageName) {
                                            if (scope.method.toLocaleLowerCase() === "put") {
                                                enabled = permission.put;
                                            } else if (scope.method.toLocaleLowerCase() === "get") {
                                                enabled = permission.get;
                                            } else if (scope.method.toLocaleLowerCase() === "post") {
                                                enabled = permission.post;
                                            } else if (scope.method.toLocaleLowerCase() === "del") {
                                                enabled = permission.del;
                                            }
                                        }
                                    }
                                });
                            }
                            if (profileLength === $index) {
                                if (enabled === false) {
                                    element.attr("disabled", "");
                                } else if (element.attr("disabled")) {
                                    element.removeAttr("disabled");
                                }
                                ss.addSessionProperty(url, enabled);
                            }
                        });
                    }
                }

            }


        }

    }
}]);
directives.directive("flowPermissionVisible", ["flowHttpService", "$compile", "sessionService", "UserFactory", function (f, c, ss, uf) {
    return {
        restrict: "A",
        scope: {task: "=", page: "="},
        link: function (scope, element, attr) {
            if (attr.method) {
                scope.method = attr.method;
            }


            console.info("permissionEnabled-url", f.permissionUrl + "?pageName=" + scope.page.name + "&method=" + scope.method);

            var url = "pageName=" + scope.page.name + "&method=" + scope.method;

            var enabled = ss.getSessionProperty(url);

            console.debug("permissionEnabled", enabled);

            if (enabled != null) {
                console.debug("permissionEnabled-old", enabled);
                if (enabled === false) {
                    element.addClass("hidden");
                }
            } else {
                var profiles = uf.getUser().flowUserProfiles;
                if (profiles) {

                    if (enabled == null && enabled !== false) {
                        enabled = false;
                        var profileLength = profiles.length - 1;
                        angular.forEach(profiles, function (profile, $index) {
                            if (!enabled) {
                                var flowProfilePermissionList = profile.flowProfilePermissions;
                                angular.forEach(flowProfilePermissionList, function (permission) {
                                    if (!enabled) {
                                        if (scope.page.name === permission.flowPageName) {
                                            if (scope.method.toLocaleLowerCase() === "put") {
                                                enabled = permission.put;
                                            } else if (scope.method.toLocaleLowerCase() === "get") {
                                                enabled = permission.get;
                                            } else if (scope.method.toLocaleLowerCase() === "post") {
                                                enabled = permission.post;
                                            } else if (scope.method.toLocaleLowerCase() === "del") {
                                                enabled = permission.del;
                                            }
                                        }
                                    }
                                });
                            }
                            if (profileLength === $index) {
                                if (enabled === false) {
                                    element.addClass("hidden");
                                } else if (element.hasClass("hidden")) {
                                    element.removeClass("hidden");
                                }
                                ss.addSessionProperty(url, enabled);
                            }
                        });
                    }
                }

            }


        }

    }
}]);
/*UI Helper*/

directives.directive("offset", [function () {

    return {
        restrict: "A",
        link: function (scope, element, attr) {
            if (attr.offset) {
                scope.offset = attr.offset;
            }

            if (scope.offset) {
                element.addClass("col-lg-offset-" + scope.offset)
                    .addClass("col-md-offset-" + scope.offset)
                    .addClass("col-sm-offset-" + scope.offset)
                    .addClass("col-xs-offset-" + scope.offset)
            }

        }
    }
}]);
directives.directive("button", [function () {
    return {
        restrict: 'A',
        link: function (scope, iElement, iAttrs) {
            if (iAttrs.sizeClass) {
                iElement.addClass(iAttrs.sizeClass);
            }
            iElement.addClass("btn");
            if (iAttrs.info) {
                iElement.attr("type", iAttrs.info);
                iElement.addClass("btn-info");
            } else if (iAttrs.warning) {
                iElement.attr("type", iAttrs.warning);
                iElement.addClass("btn-warning");
            } else if (iAttrs.danger) {
                iElement.attr("type", iAttrs.danger);
                iElement.addClass("btn-danger");
            } else if (iAttrs.primary) {
                iElement.attr("type", iAttrs.primary);
                iElement.addClass("btn-primary");
            } else {
                iElement.attr("type", "button");
                iElement.addClass("btn-default");
            }

            iElement.addClass("btn-lg");

        }
    };
}]);


/* icons */

directives.directive("fluidIconSave", function () {
    return {
        restrict: "A",
        link: function (scope, element) {
            element.addClass("fa fa-save");
        }
    }
});

directives.directive("fluidIconAttach", function () {
    return {
        restrict: "A",
        link: function (scope, element) {
            element.addClass("fa fa-paperclip");
        }
    }
});

directives.directive("fluidIconEdit", function () {
    return {
        restrict: "A",
        link: function (scope, element) {
            element.addClass("fa fa-edit");
        }
    }
});

directives.directive("fluidIconNew", function () {
    return {
        restrict: "A",
        link: function (scope, element) {
            element.addClass("fa fa-plus");
        }
    }
});

directives.directive("fluidIconSearch", function () {
    return {
        restrict: "A",
        link: function (scope, element) {
            element.addClass("fa fa-search");
        }
    }
});

directives.directive("fluidIconTrash", function () {
    return {
        restrict: "A",
        link: function (scope, element) {
            element.addClass("fa fa-trash-o");
        }
    }
});

directives.directive("fluidIconDownload", function () {
    return {
        restrict: "A",
        link: function (scope, element) {
            element.addClass("fa fa-download");
        }
    }
});

directives.directive("fluidIconClose", function () {
    return {
        restrict: "A",
        link: function (scope, element) {
            element.addClass("fa fa-close");
        }
    }
});


directives.directive("fluidIconPrint", function () {
    return {
        restrict: "A",
        link: function (scope, element) {
            element.addClass("fa fa-print");
        }
    }
});

directives.directive("fluidIconClear", function () {
    return {
        restrict: "A",
        link: function (scope, element) {
            element.addClass("fa fa-eraser");
        }
    }
});

directives.directive("fluidIconNext", function () {
    return {
        restrict: "A",
        link: function (scope, element) {
            element.addClass("fa fa-step-forward");
        }
    }
});

directives.directive("fluidIconBack", function () {
    return {
        restrict: "A",
        link: function (scope, element) {
            element.addClass("fa fa-step-backward");
        }
    }
});

directives.directive("fluidIconNext", function () {
    return {
        restrict: "A",
        link: function (scope, element) {
            element.addClass("fa fa-forward");
        }
    }
})

directives.directive("fluidIconCheck", function () {
    return {
        restrict: "A",
        link: function (scope, element) {
            element.addClass("fa fa-check text-success");
        }
    }
})


directives.directive("fluidIconRefresh", function () {
    return {
        restrict: "A",
        link: function (scope, element, attr) {
            element.addClass("fa fa-refresh");

            scope.$watch(function () {
                return attr.loading;
            }, function (loading) {
                if (loading) {
                    if (loading === 'true') {
                        element.addClass("fa-spin");
                    } else {
                        element.removeClass("fa-spin");
                    }
                }
            })

        }
    }
});

directives.directive("fluidIconSpinner", function () {
    return {
        restrict: "A",
        link: function (scope, element, attr) {
            element.addClass("fa fa-spinner");

            scope.$watch(function () {
                return attr.loading;
            }, function (loading) {
                if (loading) {
                    if (loading === 'true') {
                        element.addClass("fa-spin");
                    } else {
                        element.removeClass("fa-spin");
                    }
                }
            })

        }
    }
});


directives.directive("fluidIconTag", function () {
    return {
        restrict: "A",
        link: function (scope, element) {
            element.addClass("fa fa-tag");
        }
    }
})


directives.directive("bgWeek1", function () {
    return {
        restrict: "A",
        link: function (scope, element, attr) {
            var bgSpan = element.find("div[bg-div]");
            bgSpan.css("background", "rgba(109,182,255,0.5)");
            bgSpan.height(25);
            bgSpan.width(25);
            bgSpan.css("float", "left");
            element.css("float", "right");
            element.width(70);
            element.css("font-size", 9);
            element.css("padding-top", -7);
        },
        template: "<div><div bg-div></div><span style='text-align:center'>Week 1</span></div>"
    }
});

directives.directive("bgWeek2", function () {
    return {
        restrict: "A",
        link: function (scope, element, attr) {
            var bgSpan = element.find("div[bg-div]");
            bgSpan.css("background", "rgba(109,219,73,0.5)");
            bgSpan.height(25);
            bgSpan.width(25);
            bgSpan.css("float", "left");
            element.css("float", "right");
            element.width(70);
            element.css("font-size", 9);
            element.css("padding-top", -7);
        },
        template: "<div><div bg-div></div><span style='text-align:center'>Week 2</span></div>"
    }
});

directives.directive("bgWeek3", function () {
    return {
        restrict: "A",
        link: function (scope, element, attr) {
            var bgSpan = element.find("div[bg-div]");
            bgSpan.css("background", "rgba(59,89,152,0.5)");
            bgSpan.height(25);
            bgSpan.width(25);
            bgSpan.css("float", "left");
            element.css("float", "right");
            element.width(70);
            element.css("font-size", 9);
            element.css("padding-top", -7);
        },
        template: "<div><div bg-div></div><span style='text-align:center'>Week 3</span></div>"
    }
});
directives.directive("bgWeek4", function () {
    return {
        restrict: "A",
        link: function (scope, element, attr) {
            var bgSpan = element.find("div[bg-div]");
            bgSpan.css("background", "rgba(99,85,74,0.5)");
            bgSpan.height(25);
            bgSpan.width(25);
            bgSpan.css("float", "left");
            element.css("float", "right");
            element.width(70);
            element.css("font-size", 9);
            element.css("padding-top", -7);
        },
        template: "<div><div bg-div></div><span style='text-align:center'>Week 4</span></div>"
    }
});

directives.directive("bgWeek5", function () {
    return {
        restrict: "A",
        link: function (scope, element, attr) {
            var bgSpan = element.find("div[bg-div]");
            bgSpan.css("background", "rgba(255,167,0,0.5)");
            bgSpan.height(25);
            bgSpan.width(25);
            bgSpan.css("float", "left");
            element.css("float", "right");
            element.width(70);
            element.css("font-size", 9);
            element.css("padding-top", -7);
        },
        template: "<div><div bg-div></div><span style='text-align:center'>Week 5</span></div>"
    }
});


directives.directive("barChart", function () {
    return {
        restrict: "A",

        link: function (scope, element, attr) {


        }
    }
})

directives.directive("fluidPrintReport", ["$compile", function (c) {
    return {
        restrict: "A",
        scope: {printData: "="},
        link: function (scope, element, attr) {
            element.unbind("click");
            element.bind("click", function (e) {

                if (scope.printData) {
                    var $printView = $("<div>");

                    angular.forEach(scope.printData.regions, function ($region, $index) {
                        var $printPanel = $("<div>");

                        $printPanel.addClass("panel panel-primary");

                        var $regionHeader = $("<div>");

                        $regionHeader.addClass("panel-heading").addClass("text-center");

                        $regionHeader.html($region.region);

                        $printPanel.append($regionHeader);


                        var $panelBody = $("<div>");
                        $panelBody.addClass("panel-body");


                        var $agentTable = $("<table>");
                        $agentTable.addClass("table table-bordered table-condensed");
                        $agentTable.append($("<colgroup>")
                            .append($("<col>").attr("span", 4))
                            .append($("<col>").attr("span", 12).addClass("months-header"))
                            .append($("<col>").attr("span", 11).addClass("activity-header")));
                        if (scope.printData.labels) {

                            var $header = $("<thead>");
                            $header.append($("<th>").css("font-size", "9px").html("Top"));
                            $header.append($("<th>").css("font-size", "9px").html("Accounts"));

                            angular.forEach(scope.printData.labels, function ($label, $index) {
                                var $th = $("<th>");
                                $th.css("font-size", "9px");
                                $th.html($label);
                                $header.append($th);
                            });

                            $agentTable.append($header);
                        }

                        angular.forEach($region.agents, function ($agent, $indexA) {
                            var $agentTableBody = $("<tbody>");
                            $agentTableBody.append($("<tr>").append($("<td>").attr("colspan", "27")
                                .addClass("bg-warning").html($agent.materialsAdvisor)));


                            angular.forEach($agent.customers, function ($customer, $indexC) {

                                var $ctr = $("<tr>").css("font-size", "10px");

                                $ctr.append($("<td>").addClass("text-center").html($customer.top ? $customer.top : "Untagged"))
                                    .append($("<td>").addClass("text-center").html($customer.label));

                                $agentTableBody.append($ctr);

                                angular.forEach($customer.data, function ($data, $indexD) {
                                    $ctr.append($("<td>").addClass("text-center").html($data));
                                });

                            });

                            $agentTable.append($agentTableBody);
                        });

                        $panelBody.append($agentTable);

                        $printPanel.append($panelBody);

                        // console.info("print-report", $printPanel.html());

                        $printView.append($printPanel);

                    });


                    $printView.print({
                        globalStyles: true,
                        mediaPrint: false,
                        stylesheet: null,
                        noPrintSelector: ".no-print",
                        iframe: true,
                        append: null,
                        prepend: null,
                        manuallyCopyFormValues: true,
                        deferred: $.Deferred()
                    });
                }

            });

        }

    }
}])

directives.directive("getHeight", [function () {

    return {
        restrict: "A",
        link: function (scope, element, attr) {

            if (attr.elementId) {

                var copyElement = angular.element($("#" + attr.elementId));

            }


        }
    }

}]);











