(function () {
    'use strict';
    angular.module('war.core')
        .directive('addPages', AddPages);
    AddPages.$inject = ['flowHttpService', 'flowModalService', '$compile'];
    function AddPages(f, fm, c) {
        return {
            scope: {task: '=', pageUrl: '@', targetList: '=', id: '@', disabled: '='},
            restrict: 'AE',
            replace: true,
            templateUrl: 'src/common/core/pages/add-pages.html',
            link: AddPagesLink
        };
        function AddPagesLink(scope, element) {
            if (!scope.id) {
                scope.id = 'pg_pf_ed_' + scope.task.id;
            }
            var parent = $(element[0]).parent().get();
            var modal = $('<div>').attr('id', '{{id}}_pge_slt_mdl').addClass('modal fade fluid-modal').appendTo(parent).get();
            var modalContent = $('<div>').addClass('modal-dialog modal-lg').attr('id', '{{id}}_mdl_cnt').appendTo(modal).get();
            var modalPanel = $('<div>').addClass('panel panel-primary').appendTo(modalContent).get();
            var modalPanelHeading = $('<div>').addClass('panel-heading').appendTo(modalPanel).get();
            $('<span>').addClass('text-inverse').addClass('col-lg-5 col-md-5 col-sm-3 col-xs-3').html('Select a page').appendTo(modalPanelHeading).get();
            var inputGroup = $('<div>').addClass('col-lg-7 col-md-7 col-sm-9 col-xs-9').addClass('input-group').appendTo(modalPanelHeading).get();
            $('<input>').addClass('form-control').attr('type', 'text').attr('ng-model', 'search').appendTo(inputGroup).get();
            var inputSpan = $('<span>').addClass('input-group-addon').appendTo(inputGroup).get();
            $('<i>').addClass('fa fa-search').appendTo(inputSpan);
            var modalPanelBody = $('<div>').addClass('panel-body').attr('style', 'overflow:auto;height:200px').appendTo(modalPanel).get();
            var modalPanelFooter = $('<div>').addClass('panel-footer').attr('style', 'height:50px').appendTo(modalPanel).get();
            var pullRightFooterDiv = $('<div>').addClass('pull-right').appendTo(modalPanelFooter).get();
            var buttonGroup = $('<div>').addClass('btn-group btn-group-sm').appendTo(pullRightFooterDiv).get();
            $('<button>').addClass('btn btn-info').attr('ng-click', 'close()').attr('type', 'button').html('close').appendTo(buttonGroup).get();
            var modalTable = $('<table>').addClass('table table-responsive table-hover').appendTo(modalPanelBody).get();
            var mThead = $('<thead>').appendTo(modalTable).get();
            $('<tr>').appendTo(mThead).get();
            var mTbody = $('<tbody>').appendTo(modalTable).get();
            var mTr = $('<tr>').attr('ng-repeat', 'page in pages | filter:search').attr('ng-click', 'addToList(page)').appendTo(mTbody).get();
            var td = $('<td>').html('{{page.name}}').appendTo(mTr).get();
            scope.close = function () {
                fm.hide(scope.id + '_pge_slt_mdl');
            };
            scope.addToList = function (page) {
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
                } else {
                    $(modalContent).addClass('shake');
                    $(modalContent).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
                        $(modalContent).removeClass('shake');
                    });
                }
            };
            scope.look = function () {
                scope.isLooking = true;
                f.get(scope.pageUrl, scope.task).success(function (pages) {
                    scope.pages = pages;
                    angular.forEach(scope.targetList, function (pp) {
                        angular.forEach(scope.pages, function (p, key) {
                            if (p.id === pp.flowPageId) {
                                scope.pages.splice(key, 1);
                            }
                        });
                    });
                    fm.show(scope.id + '_pge_slt_mdl');
                    scope.isLooking = false;
                });
            };
            c(modal)(scope);
        }
    }
})();
