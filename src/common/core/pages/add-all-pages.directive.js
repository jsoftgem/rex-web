(function () {
    'use strict';
    angular.module('war.core')
        .directive('addAllPages', AddAllPages);

    AddAllPages.$inject = ['flowHttpService'];

    function AddAllPages(f) {
        return {
            scope: {task: '=', pageUrl: '@', targetList: '=', id: '@', disabled: '='},
            restrict: 'AE',
            replace: true,
            templateUrl: 'src/common/core/pages/add-all-pages.html',
            link: AddAllPagesLink
        };

        function AddAllPagesLink(scope) {
            scope.addAll = function () {
                f.get(scope.pageUrl, scope.task).success(function (pages) {
                    scope.pages = pages;

                    angular.forEach(scope.pages, function (page) {
                        var flowPermission = {
                            'flowPageId': page.id,
                            'flowPageName': page.name,
                            'put': true,
                            'get': true,
                            'post': true,
                            'del': true
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
})();
