(function () {
    'use strict';

    angular.module('war.commons')
        .filter('totalFrequency', TotalFrequency);

    function TotalFrequency() {
        return function (items) {
            var filtered = [];
            var $totalFrequency = {value: 0};
            angular.forEach(items, function (item) {
                this.value += item.customerFrequency;
            }, $totalFrequency);
            filtered.push({frequency: $totalFrequency.value});
            return filtered;
        }
    }
})();