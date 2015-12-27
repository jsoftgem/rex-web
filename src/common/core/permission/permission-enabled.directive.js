(function () {
    'use strict';
    angular.module('war.core')
        .directive('flowPermissionEnabled', FlowPermissionEnabled);

    FlowPermissionEnabled.$inject = ['flowHttpService', 'sessionService', 'UserFactory'];

    function FlowPermissionEnabled(f, ss, uf) {
        return {
            restrict: 'A',
            scope: {task: '=', page: '='},
            link: function (scope, element, attr) {
                if (attr.method) {
                    scope.method = attr.method;
                }

                console.info('permissionEnabled-url', f.permissionUrl + '?pageName=' + scope.page.name + '&method=' + scope.method);

                var url = 'pageName=' + scope.page.name + '&method=' + scope.method;

                var enabled = ss.getSessionProperty(url);
                console.debug('permissionEnabled', enabled);

                if (enabled != null) {
                    console.debug('permissionEnabled-old', enabled);
                    if (enabled === false) {
                        element.attr('disabled', "");
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
                                        if (profileLength === $index && nestedProfileLength === $index2) {
                                            console.debug('permission end', enabled);
                                            if (enabled === false) {
                                                element.attr('disabled', "");
                                            } else if (element.attr('disabled')) {
                                                element.removeAttr('disabled');
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
