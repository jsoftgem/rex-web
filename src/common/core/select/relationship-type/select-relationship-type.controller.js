(function () {
    'use strict';
    angular.module('war.core')
        .controller('selectRelationshipTypeCtrl', SelectRelationshipTypeCtrl);

    SelectRelationshipTypeCtrl.$inject = ['relationshipTypeService'];
    function SelectRelationshipTypeCtrl(relationshipTypeService) {
        var selectRelationshipType = this;
        selectRelationshipType.getRelationshipTypes = getRelationshipTypes;
        selectRelationshipType.destroy = destroy;

        function getRelationshipTypes() {
            selectRelationshipType.relationshipTypes = relationshipTypeService.getList();
        }

        function destroy() {
            selectRelationshipType.relationshipTypes = undefined;
            selectRelationshipType.relationshipType = undefined;
        }
    }


})();
