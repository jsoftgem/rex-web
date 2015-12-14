(function () {
    'use strict';

    angular.module('war.app', ['datatables', 'datatables.bootstrap', 'ngResource', 'infinite-scroll', 'ngDragDrop',
        'ngFileUpload', 'oc.lazyLoad', 'LocalStorageModule', 'truncate', 'war.fluid', 'war.core',
        'war.commons', 'war.services', 'war.resource', 'war.admin', 'war.dev', 'war.session', 'war.sidebar', 'war.home'])
})();