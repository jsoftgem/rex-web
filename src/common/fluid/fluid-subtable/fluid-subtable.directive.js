(function () {
    'use strict';
    angular.module('war.commons')
        .directive('flowSubTable', FlowSubTable);
    FlowSubTable.$inject = ['$compile', 'flowModalService', 'flowHttpService', 'flowFrameService', '$rootScope', '$timeout'];
    function FlowSubTable(c, fm, f, f2, rs, $timeout) {
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
            templateUrl: "src/templates/fluid/fluidSubTable.html",
            link: function (scope, element, attr) {
                var createButton;
                activate();
                function setCreateButton() {
                    createButton = element.find('button.create');
                    createButton.unbind('click');
                    createButton.click(create);
                }

                function activate() {
                    scope.$on('$destroy', destroy);
                    setCreateButton();
                    if (!scope.lookUp) {
                        scope.lookUp = "true";
                    }

                    if (scope.createEvent || attr.create) {
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

                    var modal = $("<div>").attr("id", "{{id}}_add_tbl_mdl").addClass("modal fade fluid-modal").appendTo(parent).get();

                    var modalContent = $("<div>").addClass("modal-dialog modal-lg").attr("id", "{{id}}_mdl_cnt").appendTo(modal).get();

                    var modalPanel = $("<div>").addClass("panel panel-primary").appendTo(modalContent).get();

                    var modalPanelHeading = $("<div>").addClass("panel-heading").appendTo(modalPanel).get();

                    $("<span>").addClass("text-inverse").addClass("col-lg-5 col-md-5 col-sm-3 col-xs-3").html("Select " + scope.title).appendTo(modalPanelHeading).get();

                    var inputGroup = $("<div>").addClass("col-lg-7 col-md-7 col-sm-9 col-xs-9").addClass("input-group").appendTo(modalPanelHeading).get();

                    $("<input>").addClass("form-control").attr("type", "text").attr("ng-model", "search").appendTo(inputGroup).get();

                    var inputSpan = $("<span>").addClass("input-group-addon").appendTo(inputGroup).get();

                    $("<i>").addClass("fa fa-search").appendTo(inputSpan);

                    var modalPanelBody = $("<div>").addClass("panel-body").attr("style", "overflow:auto;height:200px").appendTo(modalPanel).get();

                    var modalPanelFooter = $("<div>").addClass("panel-footer").attr("style", "height:50px").appendTo(modalPanel).get();

                    var pullRightFooterDiv = $("<div>").addClass("pull-right").appendTo(modalPanelFooter).get();

                    var buttonGroup = $("<div>").addClass("btn-group btn-group-sm").appendTo(pullRightFooterDiv).get();

                    $("<button>").addClass("btn btn-info").attr("ng-click", "close()").attr("type", "button").html("close").appendTo(buttonGroup).get();

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
                        $("<button>").addClass("btn btn-info").addClass("glyphicon glyphicon-edit").addClass("horizontalSpace").attr("type", "button").attr("title", "edit").attr("ng-click", "edit(" + scope.keyVar + "." + scope.idField + ",$index)").appendTo(buttonGroupDiv).get();
                    }

                    $("<button>").addClass("btn btn-danger").addClass("glyphicon glyphicon-minus").addClass("horizontalSpace").attr("type", "button").attr("title", "remove").attr("ng-click", "remove($index)").appendTo(buttonGroupDiv).get();


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

                    scope.edit = function (param, index) {
                        if (scope.editUrl) {
                            f2.addTask(scope.editUrl + param, scope.task, true);
                        } else if (scope.editEvent) {
                            rs.$broadcast(scope.editEvent + "_fp_" + scope.task.id, param, index);
                        }
                    };


                    scope.look = function () {
                        if (scope.sourceUrl) {
                            scope.isLooking = true;
                            f.get(scope.sourceUrl, scope.task).success(function (data) {
                                scope.sourceList = data;
                                fm.show(scope.id + "_add_tbl_mdl");
                                $(modalContent).addClass("pulse");
                                $(modalContent).one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", function () {
                                    $(modalContent).removeClass("pulse");
                                });
                                scope.isLooking = false;
                            });
                        }

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

                function create() {
                    if (attr.create) {
                        scope.$eval(attr.create);
                    } else {
                        $timeout(function () {
                            rs.$broadcast(scope.createEvent + "_fp_" + scope.task.id);
                        });
                    }

                }

                function destroy() {
                    createButton.unbind('click');
                }


            }
        }
    }
})();