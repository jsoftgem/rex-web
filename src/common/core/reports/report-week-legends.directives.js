(function () {
    'use strict';
    angular.module('war.core')
        .directive('bgWeek1', BgWeek)
        .directive('bgWeek2', BgWeek)
        .directive('bgWeek3', BgWeek)
        .directive('bgWeek4', BgWeek)
        .directive('bgWeek5', BgWeek);
    BgWeek.$inject = ['vendors'];
    function BgWeek(vendors) {
        return {
            restrict: 'A',
            link: WeekLink,
            template: '<div><div bg-div></div><span style="text-align:center" class="week-label"></span></div>'
        };
        function WeekLink(scope, element) {
            var rbga, label;
            console.debug('WeekLink.element', element);
            if (element[0].hasAttribute('bg-week1')) {
                label = 'Week 1';
                rbga = 'rgba(109,182,255,0.5)';
            } else if (element[0].hasAttribute('bg-week2')) {
                label = 'Week 2';
                rbga = 'rgba(109,219,73,0.5)';
            } else if (element[0].hasAttribute('bg-week3')) {
                label = 'Week 3';
                rbga = 'rgba(59,89,152,0.5)';
            } else if (element[0].hasAttribute('bg-week4')) {
                label = 'Week 4';
                rbga = 'rgba(99,85,74,0.5)';
            } else if (element[0].hasAttribute('bg-week5')) {
                label = 'Week 5';
                rbga = 'rgba(255,167,0,0.5)';
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

            var weekLabel = element.find('span.week-label');
            weekLabel.html(label);

        }
    }
})();
