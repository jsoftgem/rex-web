(function () {
    'use strict';
    angular.module('war.core')
        .controller('selectSchoolYearCtrl', SelectSchoolYearCtrl);

    SelectSchoolYearCtrl.$inject = ['SchoolYearResource'];
    function SelectSchoolYearCtrl(SchoolYearResource) {
        var selectSchoolYear = this;
        selectSchoolYear.getSchoolYears = getSchoolYears;
        selectSchoolYear.destroy = destroy;

        function getSchoolYears() {
            selectSchoolYear.schoolYearLoaded = false;
            SchoolYearResource.getList(function (schoolYears) {
                selectSchoolYear.schoolYears = schoolYears;
                selectSchoolYear.schoolYearLoaded = true;
            }, function () {
                selectSchoolYear.schoolYears = [];
                selectSchoolYear.schoolYearLoaded = true;
            })
        }

        function destroy() {
            selectSchoolYear.schoolYears = undefined;
            selectSchoolYear.schoolYear = undefined;
        }
    }


})();
