(function () {
    'use strict';
    angular.module('war.app')
        .run(WarModuleRunner);

    WarModuleRunner.$inject = ['vendors', 'flowHttpService', 'responseEvent', 'HOST'];
    function WarModuleRunner(vendors, fhp, re, h) {
        vendors.jQuery(document).delegate('form', 'submit', function (event) {
            event.preventDefault();
        });
        fhp.host = h;
        re.addResponse(undefined, 401, true, 'signin.html');
        re.addResponse('NOT_AUTHENTICATED', 401);
    }
})();
