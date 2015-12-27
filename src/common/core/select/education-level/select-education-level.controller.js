(function () {
    'use strict';
    angular.module('war.core')
        .controller('selectEducationLevelCtrl', SelectEducationLevelCtrl);

    SelectEducationLevelCtrl.$inject = ['educationLevelService'];

    function SelectEducationLevelCtrl(educationLevelService) {
        var selectEducationLevel = this;
        selectEducationLevel.getEducationLevels = getEducationLevels;
        selectEducationLevel.destroy = destroy;
        function getEducationLevels() {
            educationLevelService.getEducationLevels(function (educationLevels) {
                selectEducationLevel.educationLevels = educationLevels;
            }, function () {
                selectEducationLevel.educationLevels = [];
            });
        }

        function destroy() {
            selectEducationLevel.educationLevel = undefined;
            selectEducationLevel.educationLevels = undefined;
        }

    }


})();