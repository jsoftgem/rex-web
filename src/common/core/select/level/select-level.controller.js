/**
 * Created by Jerico on 24/12/2015.
 */
(function () {
    'use strict';
    angular.module('war.core')
        .controller('selectLevelCtrl', SelectLevelCtrl);

    SelectLevelCtrl.$inject = ['LevelResource'];

    function SelectLevelCtrl(LevelResource) {
        var selectLevel = this;
        selectLevel.getLevels = getLevels;
        selectLevel.destroy = destroy;
        function getLevels() {
            selectLevel.levelLoaded = false;
            LevelResource.getList(function (levels) {
                selectLevel.levels = levels;
                selectLevel.levelLoaded = true;
            }, function () {
                selectLevel.levels = [];
                selectLevel.levelLoaded = true;
            });
        }

        function destroy() {
            selectLevel.level = undefined;
            selectLevel.levels = undefined;
        }

    }


})();