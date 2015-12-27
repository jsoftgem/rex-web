(function () {
    'use strict';
    angular.module('war.core')
        .directive('fluidMenu', FluidMenu);
    FluidMenu.$inject = ['$compile', '$timeout', 'flowFrameService', 'UserFactory'];

    function FluidMenu($compile, $timeout, flowFrameService, UserFactory) {
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
                $scope.$watch(function () {
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
    }

})();
