(function () {
    'use strict';
    angular.module('war.core')
        .directive('flowPermissionVisible', FlowPermissionVisible);
    FlowPermissionVisible.$inject = ['flowHttpService', 'sessionService', 'UserFactory'];
    function FlowPermissionVisible(f, ss, uf) {
        return {
            restrict: 'A',
            scope: {task: '=', page: '='},
            link: function (scope, element, attr) {
                if (attr.method) {
                    scope.method = attr.method;
                }
                console.info('permissionVisible-url', f.permissionUrl + '?pageName=' + scope.page.name + '&method=' + scope.method);
                var url = 'pageName=' + scope.page.name + '&method=' + scope.method;
                var enabled = ss.getSessionProperty(url);
                console.debug('permissionVisible-method', scope.method);
                console.debug('permissionVisible', enabled);
                if (enabled != null) {
                    console.debug('permissionVisible-old', enabled);
                    if (enabled === 'false') {
                        console.debug('permissionVisible-end.hidden', enabled);
                        element.addClass('hidden');
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
                                    var nestedProfileLength = flowProfilePermissionList.length - 1;
                                    angular.forEach(flowProfilePermissionList, function (permission, $index2) {
                                        if (!enabled) {
                                            if (scope.page.name === permission.flowPageName) {
                                                if (scope.method.toLocaleLowerCase() === 'put') {
                                                    enabled = permission.put;
                                                } else if (scope.method.toLocaleLowerCase() === 'get') {
                                                    enabled = permission.get;
                                                } else if (scope.method.toLocaleLowerCase() === 'post') {
                                                    enabled = permission.post;
                                                } else if (scope.method.toLocaleLowerCase() === 'delete') {
                                                    enabled = permission.del;
                                                }
                                            }
                                        }
                                        console.debug('profileLength', profileLength);
                                        console.debug('$index', $index);
                                        console.debug('nestedProfileLength', nestedProfileLength);
                                        console.debug('$index2', $index2);
                                        if (profileLength === $index && nestedProfileLength === $index2) {
                                            console.debug('permissionVisible-end', enabled);
                                            if (enabled === 'false') {
                                                console.debug('permissionVisible-end.hidden', enabled);
                                                element.addClass('hidden');
                                            } else if (element.hasClass('hidden')) {
                                                element.removeClass('hidden');
                                            }
                                            ss.addSessionProperty(url, enabled);
                                        }
                                    });
                                }

                            });
                        }
                    }

                }
            }

        }
    }
})();
