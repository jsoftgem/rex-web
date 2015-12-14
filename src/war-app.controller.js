(function () {
    'use strict';
    angular.module('war.app')
        .controller('AppController', AppController);
    AppController.$inject = ['$scope', '$rootScope', '$location', 'userAppSetting', 'sessionService', 'userProfile',
        'userSessionService', 'UserFactory', 'FlowUserDetail', 'WarAgent', 'TaskResource', 'GroupResource', 'flowFrameService'];
    function AppController($scope, $rootScope, $location, userAppSetting, sessionService, userProfile, userSessionService, UserFactory, FlowUserDetail, WarAgent, TaskResource, GroupResource, flowFrameService) {
        $scope.userSessionService = userSessionService;
        $scope.data = {};
        $scope.effect = '';
        $scope.header = {
            form: false,
            chat: false,
            theme: false,
            footer: true,
            history: false,
            animation: '',
            boxed: '',
            layout_menu: '',
            theme_style: userAppSetting.theme,
            header_topbar: 'header-fixed',
            menu_style: userAppSetting.menu,
            menu_collapse: (userAppSetting.hideMenu ? 'sidebar-collapsed' : ''),
            layout_horizontal_menu: '',
            toggle: function (k) {
                switch (k) {
                    case 'chat':
                        $scope.header.chat = !$scope.header.chat;
                        break;
                    case 'form':
                        $scope.header.form = !$scope.header.form;
                        break;
                    case 'sitebar':
                        $scope.header.menu_style = $scope.header.menu_style ? '' : (($scope.header.layout_menu === '') ? 'sidebar-collapsed' : 'right-side-collapsed');
                        break;
                    case 'theme':
                        $scope.header.theme = !$scope.header.theme;
                        break;
                    case 'history':
                        $scope.header.history = !$scope.header.history;
                        break;
                }
            },
            collapse: function (c) {
                if (c === 'change') {
                    $scope.header.menu_collapse = '';
                    userAppSetting.menu = $scope.header.menu_style;
                    userAppSetting.updateSetting("menu");
                } else if (c === "k") {
                    $scope.header.menu_collapse = $scope.header.menu_collapse ? '' : 'sidebar-collapsed';
                    $scope.header.menu_style = userAppSetting.menu;
                    userAppSetting.hideMenu = ($scope.header.menu_collapse === 'sidebar-collapsed');
                    userAppSetting.updateSetting("hideMenu");
                } else {
                    if ($scope.header.menu_style) {
                        $scope.header.menu_style = '';
                        $scope.header.menu_collapse = $scope.header.menu_collapse ? '' : 'sidebar-collapsed';
                    } else {
                        $scope.header.menu_collapse = $scope.header.menu_collapse ? '' : 'sidebar-collapsed';
                        $scope.header.menu_style = userAppSetting.menu;
                    }
                }

            }
        };
        $rootScope.userProfile = userProfile;
        $scope.style_change = function () {
            $rootScope.style = $scope.header.theme_style;
            userAppSetting.style = $scope.header.theme_style;
            userAppSetting.updateSetting("style");

        };
        $scope.theme_change = function (t) {
            $rootScope.theme = t;
            userAppSetting.theme = t;
            userAppSetting.updateSetting("theme");
        };
        $(window).scroll(function () {
            if ($(this).scrollTop() > 0) {
                $('.quick-sidebar').css('top', '0');
            } else {
                $('.quick-sidebar').css('top', '50px');
            }
        });
        $('.quick-sidebar > .header-quick-sidebar').slimScroll({
            "height": $(window).height() - 50,
            'width': '280px',
            "wheelStep": 30
        });
        $('#news-ticker-close').click(function (e) {
            $('.news-ticker').remove();
        });
        $scope.$watch(function () {
            return UserFactory.isAuthenticated();
        }, function (session) {
            if (session) {
                console.debug("session-opened", session);
                console.debug("getUser", UserFactory.getUser());

                $scope.userSessionService.userAppSettingLoaded = undefined;
                userSessionService.profileLoaded = undefined;
                userSessionService.agentLoaded = undefined;
                userSessionService.userTasksLoaded = undefined;
                userSessionService.groupLoaded = undefined;
                userAppSetting.
                    createAppSetting()
                    .success(function (data) {
                        if (data.menu) {
                            userAppSetting.menu = data.menu;
                        }
                        if (data.theme) {
                            userAppSetting.theme = data.theme;
                        }
                        if (data.bgColor) {
                            userAppSetting.bgColor = data.bgColor;
                        }
                        if (data.hideMenu) {
                            userAppSetting.hideMenu = data.hideMenu;
                        }
                        $rootScope.theme = userAppSetting.theme;
                        $scope.header.menu_style = userAppSetting.menu;
                        $scope.header.menu_collapse = (userAppSetting.hideMenu ? 'sidebar-collapsed' : '');
                        $scope.userSessionService.userAppSettingLoaded = true;
                        console.debug("AppController > session-opened", userAppSetting);
                    })
                    .error(function () {
                        $scope.userSessionService.userAppSettingLoaded = false;
                    });

                FlowUserDetail.currentDetail(UserFactory.getUser().flowUserDetailId, function (userDetail) {
                    userProfile.createUserProfile(userDetail);
                    userSessionService.profileLoaded = true;
                }, function () {
                    userSessionService.profileLoaded = false;
                });

                WarAgent.current(function (agent) {
                    userProfile.agent = agent;
                    userSessionService.agentLoaded = true;
                }, function () {
                    userSessionService.agentLoaded = false;
                });

                TaskResource.getSessionTasks(function (tasks) {
                    if (tasks.length === 0) {
                        flowFrameService.addTask("services/flow_task_service/getTask?name=planner_task&active=true&size=100&showToolBar=false");
                        userSessionService.userTasksLoaded = true;
                    }
                    angular.forEach(tasks, function (task, $index) {
                        flowFrameService.addTask(task);
                        if ((tasks.length - 1) === $index) {
                            userSessionService.userTasksLoaded = true;
                        }
                    });
                }, function () {
                    userSessionService.userTasksLoaded = false;
                });

                GroupResource.getByName(UserFactory.getUser().group, function (group) {
                    userProfile.group = group;
                    userProfile.group.emblemPath = GroupResource.getAvatarPath(userProfile.group.emblemId);
                    console.debug("created-group", group);
                    userSessionService.groupLoaded = true;
                }, function () {
                    userSessionService.groupLoaded = false;
                });

            } else {
                window.location = "signin.html";
            }
        });
    }

})();