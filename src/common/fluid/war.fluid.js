/**Flow Components v0.0.1
 * Created by Jerico de Guzman
 * October 2014**/
var flowComponents = angular.module("war.commons");
var EVENT_PAGE_SUCCESS = "$onPageSuccess", EVENT_PAGE_ERROR = "$onPageFailed";
flowComponents.config(["$httpProvider", "localStorageServiceProvider", function (h, ls) {
    ls.setPrefix("fluid")
        .setStorageType("sessionStorage")
        .setNotify(true, true);
    h.defaults.headers.common = {};
    h.defaults.headers.post = {};
    h.defaults.headers.put = {};
    h.defaults.headers.patch = {};
    h.interceptors.push("flowInjector");

}]);
flowComponents.run(["$templateCache", function (tc) {
}]);
flowComponents
    .directive("flowFrame", ["flowFrameService", "$window", "$rootScope", "$timeout", "$templateCache", function (f, w, rs, t, tc) {
        return {
            restrict: "E",
            transclude: true,
            scope: true,
            templateUrl: 'src/templates/fluid/fluidFrame.html',
            replace: true,
            link: function (scope, element) {

                scope.frame = {};
                scope.flowFrameService = f;


                scope.$watch(function (scope) {
                    return scope.flowFrameService.fullScreen;
                }, function (fullScreen) {

                    var frameDiv = $(element.find("div.form-group")[1]);

                    if (!fullScreen) {
                        var height = window.innerHeight;
                        height = estimateHeight(height);
                        if (scope.flowFrameService.isSearch) {
                            frameDiv.attr("style", "height:" + height + "px;overflow:auto");
                        } else {
                            element.attr("style", "height:" + height + "px;overflow:auto");
                        }
                        $("body").attr("style", "height: " + height + "px;overflow:hidden");
                    } else {
                        var height = window.innerHeight;
                        height = estimateHeight(height);
                        if (scope.flowFrameService.isSearch) {
                            //frameDiv.attr("style", "height:" + height + "px;overflow:hidden");
                        } else {
                            //element.attr("style", "height:" + height + "px;overflow:hidden");
                        }
                    }
                });


                scope.show = function (task) {
                    if (!task.pinned) {
                        task.active = !task.active;
                    }
                };

                $(window).on("resize", function () {
                    if (!scope.flowFrameService.fullScreen) {
                        var height = window.innerHeight;
                        height = estimateHeight(height);
                        if (scope.flowFrameService.isSearch) {
                            frameDiv.attr("style", "height:" + height + "px;overflow:auto");
                        } else {
                            element.attr("style", "height:" + height + "px;overflow:auto");
                        }
                    } else {
                        var height = window.innerHeight;
                        height = estimateHeight(height);
                        if (scope.flowFrameService.isSearch) {
                            frameDiv.attr("style", "height:" + height + "px;overflow:hidden");
                        } else {
                            element.attr("style", "height:" + height + "px;overflow:hidden");
                        }
                    }

                    $("body").attr("style", "height: " + height + "px;overflow:hidden");
                });


                scope.initTask = function (task) {
                    if (task) {
                        scope.$watch(function () {
                            return task.active;
                        }, function (newValue, oldValue) {
                            if (true === newValue) {
                                if (task.onWindowOpening) {
                                    task.onWindowOpened();
                                } else {
                                    task.active = false;
                                }
                            }

                        });
                    }
                }
            }
        };
    }])
    .directive("flowBar", ["flowFrameService", "$templateCache", "$compile", "flowHttpService", function (f, tc, c, f2) {

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
            templateUrl: "src/templates/fluid/fluidBar2.html"
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
                disabled: "=",
                blur: "&"
            },
            templateUrl: "src/templates/fluid/fluidField.html",
            replace: true,
            link: function (scope, elem, attr) {

                if (!scope.name && scope.label) {
                    scope.name = scope.label.trim().split(" ").join("_");
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
            templateUrl: "src/templates/fluid/fluidTextArea.html",
            replace: true,
            link: function (scope, elem, attr) {
                if (!scope.name && scope.label) {
                    scope.name = scope.label.trim().split(" ").join("_");
                }
            }
        }
    }])
    .directive("flowCheck", ["$compile", "$templateCache", function (c, tc) {
        return {
            restrict: "AE",
            scope: {model: "=", label: "@", required: "=", disabled: "=", name: "@"},
            templateUrl: "src/templates/fluid/fluidCheckbox.html",
            link: function (scope, element) {
                if (!scope.name && scope.label) {
                    scope.name = scope.label.trim().split(" ").join("_");
                }

                if (scope.model === undefined) {
                    scope.model = false;
                }

                scope.update = function () {
                    if (scope.disabled === undefined || scope.disabled === false || scope.disabled === null) {
                        scope.model = !scope.model;
                    }
                };


                scope.$watch(function (scope) {
                    return scope.disabled;
                }, function (disabled) {
                    if (disabled) {
                        element.find("input").attr("disabled", "");
                    } else {
                        element.find("input").removeAttr("disabled");
                    }
                });
                scope.$watch(function (scope) {
                    return scope.required;
                }, function (required) {
                    if (required) {
                        element.find("input").attr("required", "");
                    } else {
                        element.find("input").removeAttr("required");
                    }
                });


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
    .directive("flowSubColumn", [function () {
        return {
            restrict: "AE",
            scope: {title: "@", model: "=", columnClass: "@", renderWith: "@"}

        }
    }])
    .directive("flowLookUp", ["$compile", "flowModalService", "flowHttpService", "flowFrameService", "$timeout", "$templateCache", function (c, fm, f, f2, t, tc) {
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
                parentId: "@",
                name: "@",
                changed: "&",
                removed: "&"
            },
            link: function (scope, element) {

                if (!scope.name && scope.label) {
                    scope.name = scope.label.trim().split(" ").join("_");
                }
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

                    var modal = $("<div>").attr("id", "{{id}}_add_tbl_mdl").addClass("modal fade fluid-modal").appendTo(parent).get();

                    var modalContent = $("<div>").addClass("modal-dialog modal-lg").attr("id", "{{id}}_mdl_cnt").appendTo(modal).get();

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
                            scope.isLooking = true;
                            f.get(scope.sourceUrl, scope.task).success(function (data) {
                                scope.sourceList = data;
                                fm.show(scope.id + "_add_tbl_mdl");
                                $(modalContent).addClass("pulse");
                                $(modalContent).one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", function () {
                                    $(modalContent).removeClass("pulse");
                                });
                                scope.isLooking = false;
                            }).error(function () {
                                scope.isLooking = false;
                            });
                        }

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

                scope.$watch(function (scope) {
                    return scope.model;
                }, function (value, oldValue) {
                    if (value) {
                        scope.changed({item: value});
                    } else {
                        scope.removed({oldItem: oldValue})
                    }
                });

            },
            templateUrl: "src/templates/fluid/fluidLookup.html",
            replace: true,
            transclude: true
        }
    }])
    .directive("flowSelect", ["flowHttpService", "$compile", "$timeout", "$templateCache", function (f, c, t, tc) {
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
                change: "&",
                name: "@"
            },
            link: function (scope, element, attr) {

                scope.templateUrl = "src/templates/fluid/fluidSelect.html";

                if (!scope.name && scope.label) {
                    scope.name = scope.label.trim().split(" ").join("_");
                }

                if (!scope.id) {
                    scope.id = "fl_slt_" + scope.task.id;
                }

                if (scope.required === undefined || scope.required === "undefined") {
                    scope.required = false;
                }

                if (scope.disabled === undefined || scope.disabled === "undefined") {
                    scope.disabled = false;
                }


                scope.options = "";

                if (scope.fieldValue === undefined) {
                    scope.options = "item";
                } else {
                    scope.options = "item." + scope.fieldValue;
                }

                if (scope.fieldLabel === undefined) {
                } else {
                    scope.options += " as item." + scope.fieldLabel;
                }

                if (scope.fieldGroup) {
                    scope.options += " group by item." + scope.fieldGroup;
                }

                scope.options += " for item in sourceList";

                /* var select = element.find("select").attr("ng-options", options).attr("ng-model", "model").get();*/


                var loader = $("<span>").text("Loading " + (scope.label ? scope.label : 'selection') + " ").append($("<i>").addClass("fa fa-spinner fa-spin"));
                scope.$watch(function (scope) {
                    return scope.sourceUrl;
                }, function (value, old) {
                    console.info("flow-select.sourceUrl", value);
                    if (value) {
                        element.html(loader);
                        f.get(scope.sourceUrl, scope.task).success(function (sourceList) {
                            scope.sourceList = sourceList;
                            element.html(tc.get(scope.templateUrl));
                            c(element.contents())(scope);
                        });
                    }
                });

                scope.$watch(function (scope) {
                    return attr.values;
                }, function (value, old) {
                    if (value) {
                        scope.sourceList = value.split(",");
                        element.html(tc.get(scope.templateUrl));
                        c(element.contents())(scope);
                    }
                });

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
                    scope.change({item: newValue});
                });

            },
            /*   templateUrl:"src/templates/fluid/fluidSelect.html",*/
            replace: true
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
                    scope.tooltipPosition = '{"my":"top center","at":"bottom center"}';
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
    .directive("flowImage", ["$timeout", "Upload", "sessionService", "flowHttpService", "$templateCache", function (t, u, ss, fh, tc) {
        return {
            scope: {
                model: "=",
                label: "@",
                required: "=",
                url: "@",
                method: "@",
                task: "=",
                sourceUrl: "@",
                fileChanged: "&",
                defaultImage: "@",
                disabled: "="
            },
            templateUrl: "src/templates/fluid/fluidImage.html",
            replace: true,
            link: function (scope) {
                scope.fileReaderSupported = window.FileReader != null && (window.FileAPI == null || FileAPI.html5 != false);
                scope.preview = [];
                scope.notDone = true;
                var tries = 0;

                if (!scope.defaultImage) {
                    scope.defaultImage = "images/gallery/profile_default.png";
                }

                scope.refresh = function () {
                    t(function () {
                        console.info("model", scope.model);
                        if (scope.model) {
                            console.info("model-2", scope.model);
                            if (scope.sourceUrl) {
                                scope.preview[0] = {};
                                scope.preview[0].dataUrl = fh.host + scope.sourceUrl + scope.model;
                            }
                            if (tries == 5) {
                                tries = 0;
                                scope.notDone = false;
                            } else {
                                tries++;
                                scope.refresh();
                            }
                        } else {
                            if (!scope.model) {
                                scope.preview[0] = {};
                                scope.preview[0].dataUrl = scope.defaultImage;
                            }
                            if (tries == 5) {
                                tries = 0;
                                scope.notDone = false;
                            } else {
                                tries++;
                                scope.refresh();
                            }
                        }
                    }, 1000);
                };
                scope.refresh();

                scope.onFileSelect = function ($files, $file, $event, $rejectedFiles) {
                    console.debug("flowImage-onFileSelect", file);
                    var file = $file;
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
                                                "flowPage": scope.task.currentPage,
                                                "flowUploadFileId": scope.model
                                            },
                                            data: {file: file}
                                        }).progress(function (evt) {
                                            file.progress = parseInt(100.0 * evt.loaded / evt.total);
                                        }).success(function (data, status, headers, config) {
                                            scope.model = data.id;
                                            scope.fileChanged();

                                        }).error(function (data, status, headers, config) {
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
    .directive("flowDatePicker", ["$filter", "$templateCache", function (f, tc) {
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
            templateUrl: "src/templates/fluid/fluidDatePicker.html",
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

                if (!scope.name && scope.label) {
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
    .directive("flowRadio", ["$compile", "$templateCache", function (c, tc) {
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
            templateUrl: 'src/templates/fluid/fluidRadio.html',
            link: function (scope, element) {
                if (!scope.name && scope.label) {
                    scope.name = scope.label.trim().split(" ").join("_");
                }
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
    }])
    .directive("flowUploader", ["$upload", "$templateCache", function (u, tc) {
        return {
            restict: "AE",
            link: function (scope, element, attr) {
            },
            templateUrl: 'src/templates/fluid/fluidUploader.html'
        }
    }])
    .directive("column", function () {
        return {
            restrict: "A",
            link: function (scope, element, attr) {
                if (attr.column) {
                    scope.column = attr.column;
                }

                if (scope.column) {
                    element.addClass("col-lg-" + scope.column)
                        .addClass("col-md-12")
                        .addClass("col-sm-12")
                        .addClass("col-xs-12")
                }
            }
        }
    })
    .directive('fluidInclude', ['$http', '$compile', '$timeout', "$rootScope", "$templateCache", "$ocLazyLoad", function (h, c, t, r, tc, oc) {
        return {
            restrict: 'AE',
            link: function link($scope, elem, attrs) {
                //if url is not empty
                $scope.retry = 0;
                $scope.retryCount = 10;
                if (attrs.name) {
                    $scope.name = attrs.name;
                }


                if (attrs.retryCount) {
                    scope.retryCount = attrs.retryCount;
                }

                if (attrs.taskid) {
                    $scope.taskId = attrs.taskid;
                }
                console.debug("fluidInclude.attrs", attrs);
                if (tc.get(attrs.url)) {
                    elem.append(c(angular.element(tc.get(attrs.url)))($scope));
                    t(function () {
                        r.$broadcast(EVENT_PAGE_SUCCESS, $scope.name, $scope.taskId);
                    }, 1, false);
                }
                else if (attrs.url) {
                    function getPage() {
                        h({
                            method: 'GET',
                            url: attrs.url + "--fInclude",
                            cache: true,
                            headers: {"Content-Type": "text/html"}
                        }).then(function (result) {
                            console.debug("fluidInclude.result", result);
                            tc.put(attrs.url, result.data);
                            elem.append(c(angular.element(result.data))($scope));
                            t(function () {
                                r.$broadcast(EVENT_PAGE_SUCCESS, $scope.name, $scope.taskId);
                            }, 1, false);
                        }, function (response) {
                            if ($scope.retry < $scope.retryCount) {
                                $scope.retry++;
                                t(getPage, 5000, false);
                            } else {
                                r.$broadcast(EVENT_PAGE_ERROR, $scope.name, $scope.taskId);
                            }
                        });
                    }

                    getPage();
                }
            }
        };
    }])
    .directive("fluidImageUpload", ["$templateCache", "Upload", function (tc, u) {
        return {
            restrict: "AE",
            templateUrl: 'src/templates/fluid/fluidImageUpload.html',
            scope: {model: "=", url: "@", auto: "=", onLoad: "&", token: "@", width: "=", height: "="},
            link: function (scope, element, attr) {
                scope.height = 200;
                scope.width = 200;

                if (!scope.auto) {
                    scope.auto = false;
                }

                scope.$watch(function (scope) {
                    return scope.model
                }, function (newModel) {
                    if (newModel) {
                        if (newModel instanceof File) {
                            scope.data = newModel;
                        } else {
                            if (scope.token) {
                                if (newModel.indexOf("?") === -1) {
                                    scope.src = newModel + "?token=" + scope.token;
                                } else {
                                    scope.src = newModel + "&token=" + scope.token;
                                }
                            } else {
                                scope.src = newModel;
                            }
                        }
                    }
                });


                scope.change = function ($files, $file, $event, $rejectedFiles) {
                    console.debug("$files", $files);
                    console.debug("$file", $file);
                    console.debug("$event", $event);
                    console.debug("$rejectedFiles", $rejectedFiles);
                    var file = $file;
                    console.debug("file", file);
                    if (file != null) {
                        if (scope.auto) {
                            u.upload({
                                url: scope.url,
                                file: file,
                                fields: {size: file.size}
                            }).success(function (uploadedFile) {
                                if (scope.onLoad) {
                                    scope.onLoad();
                                }
                                scope.model = uploadedFile.id;
                            });
                        } else {
                            scope.model = file;
                        }
                    }
                }


            },
            replace: true
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
    .service("flowFrameService", ["flowHttpService", "$timeout", function (f, t) {
        this.isSearch = false;
        this.searchTask = "";
        this.taskUrl = "services/flow_task_service/getTask?name=";
        if (this.taskList === undefined) {
            this.taskList = [];
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

            var index = this.taskList.length - 1;

            if (this.fullScreen) {
                this.toggleFluidscreen();
            }


        };

        this.toggleSearch = function () {
            this.isSearch = !this.isSearch;
            if (this.isSearch === false) {
                this.searchTask = "";
            }
        };
        this.toggleFullscreen = function (task) {
            this.fullScreen = true;
            this.fullScreenTask = task;
            t(function () {
                $(".frame-content").scrollTop(0);
            });
        };
        this.toggleFluidscreen = function () {
            this.fullScreen = false;
            this.fullScreenTask = undefined;
        };
        this.getFullTask = function (task) {
            console.info("getFullTask", task);
            var fullScreenTask = undefined;

            if (task) {
                var fullScreenTask = this.createGenericTask();

                fullScreenTask.url = this.taskUrl + task.name;
                fullScreenTask.size = 100;
                console.info("task", fullScreenTask);
            }

            return fullScreenTask;
        };
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
        this.getFrame = function () {
            return $("div.frame-content.frame-fullscreen");
        }
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
        this.showActionBar = function () {
            this.actionBarClass = "animated slideInUp";
            this.actionBarShowing = true;
        };
        this.hideActionBar = function () {
            this.actionBarClass = "animated slideOutDown";
            this.actionBarShowing = false;
        };
        return this;

    }])
    .service("flowHttpService", ["$rootScope", "$http", "flowLoaderService", "sessionService", function (rs, h, fl, ss) {
        this.httpSerialKey = new Date().getTime();
        this.post = function (url, data, task) {
            task.loaded = false;
            var promise = null;
            if (this.host) {
                url = this.host + url;
            }
            var headers = {
                "flow-container-id": "_id_fpb_" + task.id,
                "Content-type": "application/json"
            };
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
                    //   $("#_id_fpb_" + task.id).loadingOverlay("remove");
                });

                promise.error(function (data, status, headers, config) {
                    //$("#_id_fpb_" + task.id).loadingOverlay("remove");
                    if (status === 401) {
                        rs.$broadcast("NOT_AUTHENTICATED", data.msg);
                    } else if (status === 403) {
                        rs.$broadcast(EVENT_NOT_ALLOWED + task.id, data.msg);
                    }
                });


                promise.then(function () {
                    task.loaded = true;
                    // $("#_id_fpb_" + task.id).loadingOverlay("remove");
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
                this.httpSerialKey = new Date().getTime();
            });
            promise.error(function (data, status, headers, config) {
                //  $("#_id_fpb_" + task.id).loadingOverlay("remove");
                if (status === 401) {
                    rs.$broadcast("NOT_AUTHENTICATED");
                } else if (status === 403) {
                    rs.$broadcast("NOT_ALLOWED");
                }
                task.loaded = true;
            });

            promise.then(function () {
                task.loaded = true;
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
            task.loaded = false;
            var promise = null;
            if (this.host) {
                url = this.host + url;
            }

            var headers = {
                "flow-container-id": "_id_fpb_" + task.id,
                "Content-type": "application/json"
            };

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
                this.httpSerialKey = new Date().getTime();
            });

            promise.error(function (data, status, headers, config) {
                if (status === 401) {
                    rs.$broadcast("NOT_AUTHENTICATED");
                } else if (status === 403) {
                    rs.$broadcast(EVENT_NOT_ALLOWED + task.id, data.msg);
                }
                task.loaded = true;
            });

            promise.then(function () {
                task.loaded = true;
                // $("#_id_fpb_" + task.id).loadingOverlay("remove");
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
                task.loaded = true;
            });

            return promise;
        };
        this.getGlobal = function (url, progress, cache) {

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
            task.loaded = false;
            if (this.host) {
                url = this.host + url;
            }
            var headers = {
                "flow-container-id": "_id_fpb_" + task.id,
                "Content-type": "application/json"
            };

            if (task.currentPage) {
                headers.method = "get";
                headers.flowPage = task.currentPage;
            }


            var key = url + this.httpSerialKey;

            var sessionValue = ss.getSessionProperty(key);

            console.info("flow-http-server-cache-session-value", sessionValue);

            var promise = h({
                method: "get",
                url: url,
                headers: headers
            });

            promise.error(function (data, status) {
                if (status === 401) {
                    rs.$broadcast("NOT_AUTHENTICATED", data.msg);
                } else if (status === 403) {
                    rs.$broadcast(EVENT_NOT_ALLOWED + task.id, data.msg);
                }
            });

            promise.then(function () {
                task.loaded = true;
            });

            promise.success(function (data, status, headers, config, statusText) {
                var response = {};
                response.data = data;
                response.status = status;
                response.headers = headers;
                response.config = config;
                response.statusText = statusText;
                ss.addSessionProperty(key, response);
                console.info("flow-http-server-new-session-key", key);
                console.info("flow-http-server-new-session-value", data);
            });

            return promise;


        };
        this.delete = function (url, task) {
            task.loaded = false;
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
                //   $("#_id_fpb_" + task.id).loadingOverlay("remove");
            });

            promise.error(function (data, status, headers, config) {
                //  $("#_id_fpb_" + task.id).loadingOverlay("remove");
                if (status === 401) {
                    rs.$broadcast("NOT_AUTHENTICATED", data.msg);
                } else if (status === 403) {
                    rs.$broadcast(EVENT_NOT_ALLOWED + task.id, data.msg);
                }
                task.loaded = true;
            });

            promise.then(function () {
                task.loaded = true;
                //$("#_id_fpb_" + task.id).loadingOverlay("remove");
            });

            return promise;
        };
        this.headers = function (task) {
            return {"flow-container-id": "_id_fpb_" + task.id, "Content-type": "application/json"};
        };
        this.query = function (query, task) {

            if (task) {
                task.loaded = false;
            }

            var promise = h(query);

            promise.error(function (data, status, headers, config) {
                if (task) {
                    task.loaded = true;
                }
                if (status === 401) {
                    rs.$broadcast("NOT_AUTHENTICATED");
                } else if (status === 403) {
                    rs.$broadcast(EVENT_NOT_ALLOWED + task.id, data.msg);
                }
            });


            promise.then(function () {
                if (task) {
                    task.loaded = true;
                }
            });


            return promise;
        };

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
    .service("flowLoaderService", [function () {
        this.loaded = true;
        this.enabled = true;
        return this;
    }])
    .service("sessionService", ["localStorageService", function (ls) {

        this.isSessionSupported = ls.isSupported;

        this.type = function () {
            return this.isSessionSupported ? "session storage" : "cookie storage";
        }

        this.isSessionOpened = function () {
            return ls.get(AUTHORIZATION) !== null;
        }


        this.containsKey = function (key) {
            return !(!this.getSessionProperty(key));
        }

        this.addSessionProperty = function (key, value) {
            if (this.isSessionSupported) {
                ls.set(key, value);
            } else {
                ls.cookie.set(key, value);
            }
        }

        this.getSessionProperty = function (key) {
            if (this.isSessionSupported) {
                return ls.get(key);
            } else {
                return ls.cookie.get(key);
            }
        };

        this.login = function (username, password, remember) {
            var base64 = window.btoa(username + ":" + password);
            this.addSessionProperty("remember", remember);
            this.addSessionProperty(AUTHORIZATION, "Basic " + base64);
        };

        this.createSession = function (base64) {
            this.addSessionProperty(AUTHORIZATION, "Basic " + base64);
        };

        this.removeSessionProperty = function (key) {
            if (this.isSessionSupported) {
                return ls.remove(key);
            } else {
                return ls.cookie.remove(key);
            }
        };

        this.logout = function () {
            if (this.isSessionSupported) {
                ls.clearAll();
            } else {
                ls.cookie.clearAll();
            }
        }


    }]);

flowComponents
    .factory("flowInjector", ["$q", "$rootScope", "sessionService", "flowLoaderService", "responseEvent", function (q, rs, ss, fls, r) {

        return {
            "request": function (config) {
                if (fls.enabled) {
                    fls.loaded = false;
                }

                /*
                 config.headers["Access-Control-Allow-Origin"] = "*";

                 console.debug("request-config", config);
                 if (config.headers['flow-container-id'] !== undefined) {
                 // $('#' + config.headers['flow-container-id']).loadingOverlay();
                 }
                 /!*  if (ss.isSessionOpened()) {
                 config.headers['Authorization'] = ss.getSessionProperty(AUTHORIZATION);
                 }*!/*/
                return config;
            },
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
    control.useLabel = false;
    return control;
}


var eventInterceptorId = "event_interceptor_id_";
var goToEventID = "event_got_id_";
var EVENT_NOT_ALLOWED = "not_allowed_";
var AUTHORIZATION = "Authorization";

function estimateHeight(height) {
    var _pc = window.innerWidth <= 768 ? 100 : 50;
    /*var _pc = height >= 768 ? height * 0.055 : height <= 768 && height > 600 ? height * 0.065 : height <= 600 && height > 400 ? height * 0.09 : height * 0.15;*/
    return height - _pc
}


function generateTask(scope, t, f2) {
    console.info("generateTask > scope.task.page", scope.task.page);
    scope.task.pageLoaded = false;
    if (scope.task.page === undefined || scope.task.page === null) {
        if (scope.task.pages) {
            var $page = getHomePageFromTaskPages(scope.task);
            scope.task.page = $page.page;
            scope.homeUrl = $page.page.get;
            scope.home = $page.page.name;
            scope.task.navPages = [$page.page];
            console.info("page", scope.task.page);
        }
    } else {
        scope.homeUrl = scope.task.page.get;
        scope.task.page.param = scope.task.pageParam;
        var page = scope.task.page;

        if (scope.task.page.isHome === false) {
            if (scope.task.pages) {
                var $page = getHomePageFromTaskPages(scope.task);
                scope.home = $page.page.name;
                scope.task.navPages = [$page.page];
            }
        } else {
            scope.task.navPages = [page];
        }

        if (scope.task.page.param && scope.task.page.param !== "null") {
            scope.homeUrl = scope.task.page.get + scope.task.page.param;
            console.info("homeUrl", scope.homeUrl);
        }

        if (scope.task.navPages.indexOf(page) > -1) {
            scope.currentPageIndex = getPageIndexFromPages(scope.task.page.name, scope.task.navPages).index;
        } else {
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
    }

    scope.userTask.flowId = scope.task.flowId;
    console.info("new_task", scope.task);
    var loadGetFn = function () {
        scope.loadGet();

    };


    t(loadGetFn, 500);
}
function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

/*
 * TODO:
 * 1) flowSelect bootstrap style;
 * 2) flowSubTable issue;
 * 3) fix fluidImageUploader;
 * 4) add task Note: create a standalone note taking application;
 * 5) add task manager: for killing task; task performance summary;
 * 6) add task portal: create an internal portlet-style portal for War applications;
 * */