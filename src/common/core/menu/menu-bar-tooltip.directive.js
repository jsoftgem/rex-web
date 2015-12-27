(function () {
    'use strict';
    angular.module('war.core')
        .directive('flowBarTooltip', FlowBarTooltip);
    FlowBarTooltip.$inject = ['$timeout', 'flowFrameService'];
    function FlowBarTooltip(t, f) {
        return {
            scope: {task: '=', index: '='},
            restrict: 'A',
            link: function (scope, element, attr) {
                scope.tooltipTime = 400;
                if (scope.task === undefined) {
                    throw 'Task object must be assigned.';
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
                    scope.tooltipPosition = '{"my":"top center","at":"bottom center"}';
                }

                if (!scope.tooltipEvent) {
                    scope.tooltipEvent = 'hover';
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
                        var content = '<ul class="nav nav-pills nav-stacked">';

                        if (scope.task.pages) {
                            angular.forEach(scope.task.pages, function (page) {
                                if (page.pageLinkEnabled !== undefined && page.pageLinkEnabled === true) {
                                    content += '<li page="' + page.name + '">' +
                                        '<a href="#" class="color-white">' + page.title + '</a>' +
                                        '</li>'
                                }
                            });
                        }

                        content += '<li><a href="#" class="color-white">Minimize</a></li>';
                        if (!f.fullScreen) {
                            content += '<li><a href="#" class="color-white">Fullscreen</a></li>';
                        } else {
                            content += '<li><a href="#" class="colo-white">Fluidscreen</a></li>';
                        }
                        content += '<li><a href="#" class="color-white">Close</a></li>';

                        content += '</ul>'
                        scope.tooltip = $(element[0]).qtip({
                                content: {
                                    title: scope.tooltipHeaderTitle,
                                    text: content
                                },
                                position: {
                                    at: scope.position.at,
                                    my: scope.position.my,
                                    adjust: {
                                        method: 'none shift'
                                    }
                                }, hide: {
                                    event: 'click',
                                    inactive: scope.tooltipTime
                                },
                                style: 'qtip-dark',
                                events: {
                                    show: function (evt, api) {
                                        var list = api.elements.tooltip.find('li').get();
                                        angular.forEach(list, function (li, index) {

                                            var liElement = $(li);

                                            if (liElement.text() === 'Minimize') {
                                                if (scope.task.active === false) {
                                                    liElement.attr('style', 'display:none');

                                                } else {
                                                    liElement.attr('style', 'display:block');
                                                }
                                            } else if (liElement.text() === 'Close') {

                                            } else {
                                                var page = liElement.attr('page');

                                                if (scope.task.active === false) {
                                                    liElement.attr('style', 'display:none');

                                                } else {
                                                    liElement.attr('style', 'display:block');
                                                }
                                            }
                                            api.elements.tooltip.find('li:eq(' + index + ')')
                                                .click(function (event) {
                                                        var current = $(this);
                                                        if (current.attr('page')) {
                                                            var page = current.attr('page');
                                                            for (var p = 0; p < scope.task.pages.length; p++) {
                                                                var pg = scope.task.pages[p];
                                                                if (pg.name === page) {
                                                                    if (f.fullScreen) {
                                                                        scope.task.currentPage = {name: page};
                                                                        f.fullScreenTask = scope.task;
                                                                    } else {
                                                                        scope.task.currentPage = {name: page};
                                                                        t(function () {
                                                                            $('.frame-content').scrollTo($('div.box[task]:eq(' + scope.index + ') div.flow-panel'), 200);
                                                                        });
                                                                    }

                                                                    if (!scope.$$phase) {
                                                                        scope.$apply();
                                                                    }


                                                                }
                                                            }
                                                        } else if (current.text() === 'Minimize') {
                                                            scope.task.hide();
                                                        } else if (current.text() === 'Close') {
                                                            scope.task.close();
                                                        } else if (current.text() === 'Fullscreen') {
                                                            scope.task.fullScreen();

                                                        } else if (current.text() === 'Fluidscreen') {
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
    }
})();
