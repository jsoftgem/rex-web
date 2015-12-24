(function () {
    'use strict';
    angular.module('war.core')
        .controller('selectPositionCtrl', SelectPositionCtrl);

    SelectPositionCtrl.$inject = ['PositionResource'];
    function SelectPositionCtrl(PositionResource) {
        var selectPosition = this;
        selectPosition.getPositions = getPositions;
        selectPosition.destroy = destroy;

        function getPositions() {
            selectPosition.positionLoaded = false;
            PositionResource.getList(function (positions) {
                selectPosition.positions = positions;
                selectPosition.positionLoaded = true;
            }, function () {
                selectPosition.positions = [];
                selectPosition.positionLoaded = true;
            })
        }

        function destroy() {
            selectPosition.positions = undefined;
            selectPosition.position = undefined;
        }
    }


})();
