(function () {
    'use strict';
    angular.module('war.commons').directive('flowTool', FluidTool);

    FluidTool.$inject = ['$rootScope', '$timeout'];

    function FluidTool(r, $timeout) {
        return {
            scope: {task: '=', controls: '=', pages: '=', flow: "=", size: "@"},
            restrict: "E",
            replace: true,
            templateUrl: "src/templates/fluid/fluidToolbar.html",
            link: function (scope, element, attr) {

                if (attr.size) {
                    if (attr.size === "small") {
                        scope.size = "btn-group-xs";
                    } else if (attr.size === "medium") {
                        scope.size = "btn-group-sm";
                    } else if (attr.size === "large") {
                        scope.size = "btn-group-md";
                    }
                } else {
                    scope.size = "btn-group-md";
                }


                scope.runEvent = function (control) {
                    if (control.action) {
                        $timeout(control.action);
                    } else {
                        var event = control.id + "_fp_" + scope.task.id;
                        r.$broadcast(event);
                    }

                };

                scope.isVisible = function (control) {
                    var visible = true;
                    if (control.visible) {
                        visible = control.visible();
                    }
                    return visible;
                };


                scope.goToEvent = function (name, param) {
                    scope.flow.navTo(name);
                };

                scope.isLoading = function (control) {
                    var loading = false;
                    if (control.loading) {
                        loading = control.loading();
                    }
                    return loading;
                };

                scope.getClass = function (uiType) {
                    if(uiType){
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
        }
    }
})();