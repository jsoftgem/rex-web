(function () {
    'use strict';

    angular.module('war.commons')
        .constant('EDUCATION_LEVELS', [
            'PreELEMENTARY',
            'ELEMENTARY',
            'SECONDARY',
            'TERTIARY'
        ])
        .factory('educationLevelService', EducationLevel);

    EducationLevel.$inject = ['$q', 'EDUCATION_LEVELS'];

    function EducationLevel($q, EDUCATION_LEVELS) {

        return {
            getEducationLevels: getEducationLevels
        };

        function getEducationLevels(callback, error) {
            var deferred = $q.defer();
            try {
                deferred.resolve(EDUCATION_LEVELS);
            } catch (err) {
                deferred.reject(err);
            }
            return deferred.promise.then(callback, error);
        }
    }

})();
