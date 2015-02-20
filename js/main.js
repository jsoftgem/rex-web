"use strict";
var App = angular.module('MAdmin', ['ui.bootstrap', 'fluid', 'flowServices']);

App.controller('AppController', function ($scope, $rootScope, $location, userAppSetting) {

    $scope.data = {};
    $scope.effect = '';
    $scope.header = {
        form: false,
        chat: false,
        theme: false,
        footer: true,
        history: false,
        animation: '',
        boxed: '',
        layout_menu: '',
        theme_style: userAppSetting.style,
        header_topbar: 'header-fixed',
        menu_style: userAppSetting.menu,
        menu_collapse: (userAppSetting.hideMenu ? 'sidebar-collapsed' : ''),
        layout_horizontal_menu: '',

        toggle: function (k) {
            switch (k) {
                case 'chat':
                    $scope.header.chat = !$scope.header.chat;
                    break;
                case 'form':
                    $scope.header.form = !$scope.header.form;
                    break;
                case 'sitebar':
                    $scope.header.menu_style = $scope.header.menu_style ? '' : (($scope.header.layout_menu === '') ? 'sidebar-collapsed' : 'right-side-collapsed');
                    break;
                case 'theme':
                    $scope.header.theme = !$scope.header.theme;
                    break;
                case 'history':
                    $scope.header.history = !$scope.header.history;
                    break;
            }
        },

        collapse: function (c) {
            if (c === 'change') {
                $scope.header.menu_collapse = '';
                userAppSetting.menu = $scope.header.menu_style;
                userAppSetting.updateSetting("menu");
            } else if (c === "k") {
                $scope.header.menu_collapse = $scope.header.menu_collapse ? '' : 'sidebar-collapsed';
                $scope.header.menu_style = userAppSetting.menu;
                userAppSetting.hideMenu = ($scope.header.menu_collapse === 'sidebar-collapsed');
                userAppSetting.updateSetting("hideMenu");
            } else {
                if ($scope.header.menu_style) {
                    $scope.header.menu_style = '';
                    $scope.header.menu_collapse = $scope.header.menu_collapse ? '' : 'sidebar-collapsed';
                } else {
                    $scope.header.menu_collapse = $scope.header.menu_collapse ? '' : 'sidebar-collapsed';
                    $scope.header.menu_style = userAppSetting.menu;
                }
            }

        }
    };

    userAppSetting.
        createAppSetting()
        .success(function (data) {
            if (data.menu) {
                userAppSetting.menu = data.menu;
            }
            if (data.style) {
                userAppSetting.style = data.style;
            }
            if (data.theme) {
                userAppSetting.theme = data.theme;
            }
            if (data.bgColor) {
                userAppSetting.bgColor = data.bgColor;
            }
            if(data.hideMenu){
                userAppSetting.hideMenu = data.hideMenu;
            }

            $rootScope.style = userAppSetting.style;
            $rootScope.theme = userAppSetting.theme;
            $scope.header.menu_style = userAppSetting.menu;
            $scope.header.theme_style = userAppSetting.style;
            $scope.header.menu_collapse = (userAppSetting.hideMenu ? 'sidebar-collapsed' : '');
        });


    $scope.style_change = function () {
        $rootScope.style = $scope.header.theme_style;
        userAppSetting.style = $scope.header.theme_style;
        userAppSetting.updateSetting("style");

    };

    $scope.theme_change = function (t) {
        $rootScope.theme = t;
        userAppSetting.theme = t;
        userAppSetting.updateSetting("theme");
    };

    $(window).scroll(function () {
        if ($(this).scrollTop() > 0) {
            $('.quick-sidebar').css('top', '0');
        } else {
            $('.quick-sidebar').css('top', '50px');
        }
    });
    $('.quick-sidebar > .header-quick-sidebar').slimScroll({
        "height": $(window).height() - 50,
        'width': '280px',
        "wheelStep": 30
    });
    $('#news-ticker-close').click(function (e) {
        $('.news-ticker').remove();
    });

});

(function ($, window, undefined) {
    'use strict';
    var name = 'stickyTableHeaders';
    var defaults = {
        fixedOffset: 0
    };

    function Plugin(el, options) {
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;

        // Access to jQuery and DOM versions of element
        base.$el = $(el);
        base.el = el;

        // Listen for destroyed, call teardown
        base.$el.bind('destroyed',
            $.proxy(base.teardown, base));

        // Cache DOM refs for performance reasons
        base.$window = $(window);
        base.$clonedHeader = null;
        base.$originalHeader = null;

        // Keep track of state
        base.isSticky = false;
        base.leftOffset = null;
        base.topOffset = null;

        base.init = function () {
            base.options = $.extend({}, defaults, options);

            base.$el.each(function () {
                var $this = $(this);

                // remove padding on <table> to fix issue #7
                $this.css('padding', 0);

                base.$originalHeader = $('thead:first', this);
                base.$clonedHeader = base.$originalHeader.clone();

                base.$clonedHeader.addClass('tableFloatingHeader');
                base.$clonedHeader.css('display', 'none');

                base.$originalHeader.addClass('tableFloatingHeaderOriginal');

                base.$originalHeader.after(base.$clonedHeader);

                base.$printStyle = $('<style type="text/css" media="print">' +
                '.tableFloatingHeader{display:none !important;}' +
                '.tableFloatingHeaderOriginal{position:static !important;}' +
                '</style>');
                $('head').append(base.$printStyle);
            });

            base.updateWidth();
            base.toggleHeaders();

            base.bind();
        };

        base.destroy = function () {
            base.$el.unbind('destroyed', base.teardown);
            base.teardown();
        };

        base.teardown = function () {
            if (base.isSticky) {
                base.$originalHeader.css('position', 'static');
            }
            $.removeData(base.el, 'plugin_' + name);
            base.unbind();

            base.$clonedHeader.remove();
            base.$originalHeader.removeClass('tableFloatingHeaderOriginal');
            base.$originalHeader.css('visibility', 'visible');
            base.$printStyle.remove();

            base.el = null;
            base.$el = null;
        };

        base.bind = function () {
            base.$window.on('scroll.' + name, base.toggleHeaders);
            base.$window.on('resize.' + name, base.toggleHeaders);
            base.$window.on('resize.' + name, base.updateWidth);
        };

        base.unbind = function () {
            // unbind window events by specifying handle so we don't remove too much
            base.$window.off('.' + name, base.toggleHeaders);
            base.$window.off('.' + name, base.updateWidth);
            base.$el.off('.' + name);
            base.$el.find('*').off('.' + name);
        };

        base.toggleHeaders = function () {
            base.$el.each(function () {
                var $this = $(this);

                var newTopOffset = isNaN(base.options.fixedOffset) ?
                    base.options.fixedOffset.height() : base.options.fixedOffset;

                var offset = $this.offset();
                var scrollTop = base.$window.scrollTop() + newTopOffset;
                var scrollLeft = base.$window.scrollLeft();

                if ((scrollTop > offset.top) && (scrollTop < offset.top + $this.height() - base.$clonedHeader.height())) {
                    var newLeft = offset.left - scrollLeft;
                    if (base.isSticky && (newLeft === base.leftOffset) && (newTopOffset === base.topOffset)) {
                        return;
                    }

                    base.$originalHeader.css({
                        'position': 'fixed',
                        'top': newTopOffset,
                        'margin-top': 0,
                        'left': newLeft,
                        'z-index': 1 // #18: opacity bug
                    });
                    base.$clonedHeader.css('display', '');
                    base.isSticky = true;
                    base.leftOffset = newLeft;
                    base.topOffset = newTopOffset;

                    // make sure the width is correct: the user might have resized the browser while in static mode
                    base.updateWidth();
                }
                else if (base.isSticky) {
                    base.$originalHeader.css('position', 'static');
                    base.$clonedHeader.css('display', 'none');
                    base.isSticky = false;
                }
            });
        };

        base.updateWidth = function () {
            if (!base.isSticky) {
                return;
            }
            // Copy cell widths from clone
            var $origHeaders = $('th,td', base.$originalHeader);
            $('th,td', base.$clonedHeader).each(function (index) {

                var width, $this = $(this);

                if ($this.css('box-sizing') === 'border-box') {
                    width = $this.outerWidth(); // #39: border-box bug
                } else {
                    width = $this.width();
                }

                $origHeaders.eq(index).css({
                    'min-width': width,
                    'max-width': width
                });
            });

            // Copy row width from whole table
            base.$originalHeader.css('width', base.$clonedHeader.width());
        };

        base.updateOptions = function (options) {
            base.options = $.extend({}, defaults, options);
            base.updateWidth();
            base.toggleHeaders();
        };

        // Run initializer
        base.init();
    }

    // A plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[name] = function (options) {
        return this.each(function () {
            var instance = $.data(this, 'plugin_' + name);
            if (instance) {
                if (typeof options === "string") {
                    instance[options].apply(instance);
                } else {
                    instance.updateOptions(options);
                }
            } else if (options !== 'destroy') {
                $.data(this, 'plugin_' + name, new Plugin(this, options));
            }
        });
    };

})(jQuery, window);
