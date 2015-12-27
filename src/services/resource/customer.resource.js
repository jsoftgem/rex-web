(function () {
    'use strict';
    angular.module('war.resource')
        .factory('CustomerResource', CustomerResource);
    CustomerResource.$inject = ['WarResource'];
    function CustomerResource(WarResource) {
        var resource = new WarResource(withHost('services/war/customer_query/getInstance/:path'));
        return {
            getById: resource.getById
        };
    }
})();