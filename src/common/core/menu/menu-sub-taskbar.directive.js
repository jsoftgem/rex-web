(function () {
    'use strict';
    angular.module('war.core')
        .directive('fluidSubTaskbar', FluidSubTaskbar);
    FluidSubTaskbar.$inject = ['flowFrameService', '$timeout', '$compile'];
    function FluidSubTaskbar(f, t, c) {
        return {
            restrict: 'A',
            link: function (scope, element) {
                var table = $('<table>').appendTo(element[0]).get();
                var tr = $('<tr>').appendTo(table).get();
                scope.loaded = false;
                scope.$watch(f.taskList, function () {
                    angular.forEach(f.taskList, function (task, index) {

                        if (index > 9) {

                            var td = $('<td>').appendTo(tr).get();

                            var a = $('<a>').attr('href', '#').appendTo(td).get();

                            $('<i>').addClass('fluid-bar-icon').addClass(task.glyph).appendTo(a);

                            if (index % 3 === 0) {
                                tr = $('<tr>').appendTo(table).get();
                            }

                        }

                        if ((f.taskList.length - 1) === index) {
                            console.log('loaded');
                            scope.loaded = true;
                        }

                    });
                });
                scope.reload = function () {
                    t(function () {
                        if (scope.loaded) {
                            c(element.contents())(scope);
                        }
                        else {
                            scope.reload();
                        }

                    });
                };

                scope.reload();
            }
        };
    }

})();
