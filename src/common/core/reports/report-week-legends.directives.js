(function () {
    'use strict';
    angular.module('war.core')
        .directive('bgWeek1', BgWeek)
        .directive('bgWeek2', BgWeek)
        .directive('bgWeek3', BgWeek)
        .directive('bgWeek4', BgWeek)
        .directive('bgWeek5', BgWeek);
    function BgWeek() {
        return {
            restrict: 'A',
            link: WeekLink,
            template: '<div><div bg-div></div><span style="text-align:center">{{title}}</span></div>'
        };
        function WeekLink(scope, element) {
            var rbga;
            switch (element[0].tagName) {
                case 'bg-week1':
                    scope.title = 'Week 1';
                    rbga = 'rgba(109,219,73,0.5)';
                    break;
                case 'bg-week2':
                    scope.title = 'Week 2';
                    rbga = 'rgba(109,219,73,0.5)';
                    break;
                case 'bg-week3':
                    scope.title = 'Week 3';
                    rbga = 'rgba(59,89,152,0.5)';
                    break;
                case 'bg-week4':
                    scope.title = 'Week 4';
                    rbga = 'rgba(99,85,74,0.5)';
                    break;
                case 'bg-week5':
                    scope.title = 'Week 5';
                    rbga = 'rgba(255,167,0,0.5)';
                    break;
                default:
                    scope.title = '';
                    rbga = 'none';
                    break;
            }
            var bgSpan = element.find('div[bg-div]');
            bgSpan.css('background', rbga);
            bgSpan.height(25);
            bgSpan.width(25);
            bgSpan.css('float', 'left');
            element.css('float', 'right');
            element.width(70);
            element.css('font-size', 9);
            element.css('padding-top', -7);
        }

    }

})();
