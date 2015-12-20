(function () {
    'use strict';

    angular.module('war.app', ['ui.bootstrap', 'datatables', 'datatables.bootstrap', 'ngResource', 'infinite-scroll', 'ngDragDrop',
        'ngFileUpload', 'ngCookies', 'oc.lazyLoad', 'LocalStorageModule', 'truncate', 'ui.select', 'ngSanitize', 'angular.filter', 'fluid.webComponents',
        'war.core', 'war.commons', 'war.services', 'war.resource', 'war.admin', 'war.dev', 'war.session', 'war.sidebar', 'war.home',
        'war.activity', 'war.table', 'war.management', 'war.reports'])
})();