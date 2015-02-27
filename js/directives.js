/**
 * Created by Jerico on 11/29/2014.
 */
var directives = angular.module("flowAppDirectives", ["fluid"]);


/* Framework Helper */
directives.directive("addPages", ["flowHttpProvider", "flowModalService", "$compile", function (f, fm, c) {
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

            var modal = $("<div>").attr("id", "{{id}}_pge_slt_mdl").addClass("overlay hidden animated fadeIn anim-dur").appendTo(parent).get();

            var modalContent = $("<div>").addClass("flow-modal animated anim-dur").attr("id", "{{id}}_mdl_cnt").appendTo(modal).get();

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
directives.directive("addAllPages", ["flowHttpProvider", function (f) {

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
directives.directive("fluidMenu", function ($parse, $compile, $timeout, flowHttpProvider, flowFrameService) {
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

            if (attributes.fluidMenu) {
                var groupLength = 0;
                flowHttpProvider.getLocal(attributes.fluidMenu).success(function (groups) {

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
                })
            } else {
                $scope.loaded = true;
            }

            $scope.openModule = function (moduleName) {

                angular.forEach($scope.dataMap, function (data) {
                    if (moduleName === data.name) {
                        this.task = data.data.task;
                    }
                }, $scope.data);

                if ($scope.data && $scope.data.task) {
                    var task = flowFrameService.addTask($scope.data.task, undefined, true);
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

                        element.html($compile(element.html())($scope));


                    } else {
                        $scope.reload();
                    }
                });
            }

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
directives.directive("flowBarTooltip", ["$timeout", "flowFrameService", "flowHttpProvider", function (t, f, f2) {
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
                return scope.task.generic
            }, function (newValue) {
                if (newValue === false) {
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
                                                            scope.task.currentPage = {name: page};
                                                            scope.$apply();
                                                            t(function () {
                                                                $(".frame-content").scrollTo($("div.box[task]:eq(" + scope.index + ") div.flow-panel"), 200);
                                                            });
                                                        }
                                                    }
                                                } else if (current.text() === "Minimize") {
                                                    scope.task.hide();

                                                } else if (current.text() === "Close") {
                                                    scope.task.close();
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
directives.directive('flowProfileVisible', ["flowHttpProvider",function (f) {
    return {
        restrict: 'A',
        scope:{task:"=", profiles:"="},
        link: function (scope, iElement, iAttrs) {
                f.post("services/flow_permission/has_profile",scope.profiles, scope.task).
                success(function(data){
                        if(data){
                             iElement.removeClass("hidden"); 
                        }else{
                             iElement.addClass("hidden"); 
                        }
                });
        }
    };
}])


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


directives.directive("column", function () {
    return {
        restrict: "A",
        link: function (scope, element, attr) {
            if (attr.column) {
                scope.column = attr.column;
            }

            if (scope.column) {
                element.addClass("col-lg-" + scope.column)
                    .addClass("col-md-" + scope.column)
                    .addClass("col-sm-12")
                    .addClass("col-xs-12")
            }
        }
    }
});


directives.directive("button", [function () {
    return {
        restrict: 'A',
        link: function (scope, iElement, iAttrs) {

            iElement.addClass("btn");
            if(iAttrs.info){
                 iElement.attr("type",iAttrs.info);
                 iElement.addClass("btn-info");
            }else if(iAttrs.warning){
                 iElement.attr("type",iAttrs.warning);
                 iElement.addClass("btn-warning");
            }else if(iAttrs.danger){
                 iElement.attr("type",iAttrs.danger);
                 iElement.addClass("btn-danger");
            }else if(iAttrs.primary){
                 iElement.attr("type",iAttrs.primary);
                 iElement.addClass("btn-primary");
            }else {
                iElement.attr("type","button");
                iElement.addClass("btn-default");
            }


        }
    };
}]);














