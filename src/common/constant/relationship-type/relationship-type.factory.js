(function () {
    'use strict';
    angular.module('war.commons')
        .constant('RELATIONSHIP_TYPES', [
            'POSITIVE', 'NEUTRAL', 'NEGATIVE', 'NONE'
        ])
        .factory('relationshipTypeService', RelationshipTypeService);
    RelationshipTypeService.$inject = ['RELATIONSHIP_TYPES'];

    function RelationshipTypeService(RELATIONSHIP_TYPES) {
        return {
            getList: getList
        };

        function getList() {
            return RELATIONSHIP_TYPES;
        }
    }
})();
