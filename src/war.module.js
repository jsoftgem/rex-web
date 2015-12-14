(function () {
    'use strict';

    angular.module('war.app', ['ui.bootstrap', 'datatables', 'datatables.bootstrap', 'ngResource', 'infinite-scroll', 'ngDragDrop',
        'ngFileUpload', 'oc.lazyLoad', 'LocalStorageModule', 'truncate', 'fluid.webComponents', 'fluid', 'war.core',
        'war.commons', 'war.services', 'war.resource', 'war.admin', 'war.dev', 'war.session', 'war.sidebar', 'war.home'])
})();