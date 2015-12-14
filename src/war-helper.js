(function ($, window) {
    'use strict';
    var name = 'stickyTableHeaders';
    var defaults = {
        fixedOffset: 0
    };

    function Plugin(el, options) {
        var base = this;
        base.$el = $(el);
        base.el = el;
        base.$el.bind('destroyed',
            $.proxy(base.teardown, base));
        base.$window = $(window);
        base.$clonedHeader = null;
        base.$originalHeader = null;
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
        base.init();
    }

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

})($, window);

var monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday',
    'Thursday', 'Friday', 'Saturday'];

var VIEWER_PATH = "ViewerJS/#../";

var REG_NUM = /^[0-9]+$/;

function SaveControl() {
    var saveControl = new Control();

    saveControl.label = "Save";
    saveControl.disabled = false;
    saveControl.glyph = "glyphicon glyphicon-floppy-save";
    saveControl.uiType = "info";
    return saveControl;
}

function CreateControl() {
    var createControl = new Control();
    createControl.label = "New";
    createControl.disabled = false;
    createControl.glyph = "glyphicon glyphicon-plus";
    createControl.uiType = "info";
    return createControl;

}

function DeleteControl() {
    var deleteControl = new Control();
    deleteControl.label = "Delete";
    deleteControl.disabled = false;
    deleteControl.glyph = "glyphicon glyphicon-floppy-remove";
    deleteControl.uiType = "danger";
    return deleteControl;
}

function CopyControl() {
    var copyControl = new Control();
    copyControl.label = "Copy";
    copyControl.disabled = false;
    copyControl.glyph = "glyphicon glyphicon-floppy-remove";
    copyControl.uiType = "info";
    return copyControl;
}

function FlowOptionsGET(dto, url, scope, compile, sessionService) {
    var headers = {
        Authorization: "bearer " + sessionService.getSessionProperty("token"),
        flowPage: scope.task.page.name
    };
    console.info("datatables-url", url);
    console.info("datatables-header", headers);
    return new dto.newOptions()
        .withOption("ajax", {
            url: url,
            type: "POST",
            headers: headers,
            cache: true,
            crossDomain: true,
            global: false,
            beforeSend: function () {
                if (scope.task) {
                    scope.task.loaded = false;
                }
            },
            complete: function () {
                if (scope.task) {
                    scope.task.loaded = true;
                }
            }
        })
        .withDataProp('data')
        .withOption("createdRow", function (row) {
            if (scope && compile) {
                console.debug("table-row", row);
                console.debug("table-row-div", $(row).find('td div.actions'));
                compile(angular.element($(row).find('td div.actions')).contents())(scope);
            }
        })
        .withOption("autoWidth", true)
        .withOption("info", true)
        .withOption("processing", true)
        .withOption("sDom", "<'top'iflp<'clear'>>rt<'bottom'iflp<'clear'>>")
        .withOption("stateSave", true)
        .withOption("serverSide", true)
        .withPaginationType('simple_numbers');
}


function FlowOptionGETv2(dto, options) {

    return dto.fromFnPromise(
        function () {
            return options.promise;
        })
        .withOption("autoWidth", true)
        .withOption("info", true)
        .withOption("processing", true)
        .withOption('responsive', true)
        .withOption("sDom", "<'top'iflp<'clear'>>rt<'bottom'iflp<'clear'>>")
        .withOption("stateSave", true);
}


function FlowColumns(dtc, editMethod, deleteMethod, viewMethod) {
    return [dtc.newColumn(null).withTitle('Actions').notSortable().withOption("searchable", false)
        .renderWith(function (data, type, full, meta) {


            var scope = angular.element($(meta.settings.aoData[meta.row].anCells[meta.col])).scope();

            return renderActions(data, editMethod, deleteMethod, viewMethod, scope, meta.row);
        })]
}

function renderCheckbox(data) {
    var span = "text-primary fa fa-square-o";
    if (data) {
        span = "text-success fa fa-check-square-o";
    }
    return "<p class='text-primary'><span class='" + span + "'></span></p>"
}
function renderActions(data, editMethod, deleteMethod, viewMethod, scope, row) {

    console.debug("renderActions.scope", scope);

    var edit = "edit";
    var del = "delete";
    var view = "view";

    if (viewMethod !== undefined) {
        view = viewMethod;
    }

    if (editMethod !== undefined) {
        edit = editMethod;
    }

    if (deleteMethod !== undefined) {
        del = deleteMethod;
    }


    if (scope) {
        if (!scope.dataItem) {
            scope.dataItem = [];
        }
        scope.dataItem[row] = data;
    }

    return "<div class='actions btn-group btn-group-md'>" +
        "<button ng-if=\"" + view + "\" flow-permission-visible title='View' task='task' page='task.page' method='put'  type='button' class='btn btn-warning glyphicon glyphicon-search field-margin' ng-click='" + view + "(dataItem[" + row + "],row)'></button>" +
        "<button flow-permission-visible title='Edit' task='task' page='task.page' method='put'  type='button' class='btn btn-info glyphicon glyphicon-edit field-margin' ng-click='" + edit + "(" + data.id + ",row)'></button>" +
        "<button flow-permission-visible title='Delete' task='task' page='task.page' method='delete' type='button' class='btn btn-danger glyphicon glyphicon-trash field-margin' ng-click='" + del + "(dataItem[" + row + "],row)'> </button></div>";
}


function renderMonth(data, filter) {
    return "<span>" + filter('date')(data, 'MMMM') + "</span>";
}


function renderDate(data, filter) {
    return "<span>" + filter('date')(data, 'medium') + "</span>";
}


function renderDateSmall(data, filter) {
    return "<span>" + filter('date')(data, 'MM/dd/yyyy') + "</span>";
}

function getHomePageFromTaskPages(task) {
    var $page = {};

    angular.forEach(task.pages, function (page, key) {
        if (page.isHome) {
            this.page = page;
            this.index = key;
        }
    }, $page);

    return $page;
}

function getPageIndexFromTaskPages(name, task) {
    var $index = -1;
    angular.forEach(task.pages, function (page, key) {
        if (page.name === name) {
            this.index = key;
        }
    }, $index);

    return $index;
}

function getPageIndexFromPages(name, pages) {
    var $index = -1;
    angular.forEach(pages, function (page, key) {
        if (page != null) {
            if (page.name === name) {
                this.index = key;
            }
        }

    }, $index);
    return $index;
}


/*UI Messages factory*/
var UI_MESSAGE_NO_CHANGE = "No change has been made.";


function getMarketSegment(marketPotential) {

    if (marketPotential === undefined || marketPotential === 0) {
        return undefined;
    }

    var marketSegment = undefined;

    if (marketPotential >= 18000) {
        marketSegment = "HMP";
    } else if (marketPotential < 18000 && marketPotential > 8000) {
        marketSegment = "MMP1";
    } else if (marketPotential <= 8000 && marketPotential >= 4000) {
        marketSegment = "MMP2";
    } else if (marketPotential < 4000 && marketPotential >= 1400) {
        marketSegment = "LMP1";
    } else if (marketPotential < 1400) {
        marketSegment = "LMP2";
    }

    return marketSegment;
}


function getFirstMonday(date) {
    date.setDate(1);
    while (date.getDay() !== 1) {
        date.setDate(date.getDate() + 1);
    }

    return date;
}


function getWeekOfMonth(date) {

    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday',
            'Thursday', 'Friday', 'Saturday'],
        prefixes = ['1', '2', '3', '4', '5'];

    return prefixes[0 | date.getDate() / 7];

}

function getDayName(dayOfWeek) {
    var di = dayOfWeek - 1;
    return days[di];
}

function isPastMonthDay(date, firstMondayDate) {
    if (date.getDate() < firstMondayDate.getDate()) {
        return true;
    }

    return false;
}

function isDayEnabled(dayDate, currentDate) {
    var enabled = undefined;
    if (currentDate.getMonth() === 0 && dayDate.getMonth() === 11) {
        /*for January and December*/
        enabled = false;
    } else if (currentDate.getMonth() === 11 && dayDate.getMonth() === 0) {
        enabled = true;
    }
    else if (dayDate.getMonth() < currentDate.getMonth()) {
        enabled = false;
    } else if (dayDate.getMonth() > currentDate.getMonth()) {
        enabled = true;
    } else {
        var firstMondayDate = getFirstMonday(currentDate);
        if (isPastMonthDay(dayDate, firstMondayDate)) {
            enabled = false;
        } else {
            enabled = true;
        }
    }

    return enabled;
}


function setDraggable(s) {

    $("#" + s.flow.getElementFlowId("event_body") + " .event-customer td div").each(function () {
        $(this).data("eventObject", {
            title: $.trim($(this).text()),
            activityType: "SCHOOL"
        });

        $(this).removeClass("non-draggable").addClass("draggable");

        $(this).draggable({
            helper: function () {
                return $("<div>").addClass("event-customer-draggable").html($(this).text()).clone();
            },
            zIndex: 99999,
            revert: true,
            revertDuration: 0
        });

    });

    $("#" + s.flow.getElementFlowId("other_activities") + " td div").each(function () {

        $(this).removeAttr("disabled");

        $(this).data("eventObject", {
            title: $.trim($(this).html()),
            activityType: $(this).attr("activity-type")
        });

        $(this).draggable({
            zIndex: 99999,
            revert: true,
            revertDuration: 0
        });
    });
}

function disableDraggable(s) {

    $("#" + s.flow.getElementFlowId("event_body") + " .event-customer td div").each(function () {

        $(this).removeClass("draggable").addClass("non-draggable");

        if ($(this).draggable()) {
            $(this).draggable("destroy");
        }

    });

    $("#" + s.flow.getElementFlowId("other_activities") + " td div").each(function () {

        $(this).attr("disabled", "");

        if ($(this).draggable()) {
            $(this).draggable("destroy");
        }
    });
}


/*
 * jQuery Double Tap
 * Developer: Sergey Margaritov (sergey@margaritov.net)
 * Date: 22.10.2013
 * Based on jquery documentation http://learn.jquery.com/events/event-extensions/
 */

(function ($) {

    $.event.special.doubletap = {
        bindType: 'touchend',
        delegateType: 'touchend',

        handle: function (event) {
            var handleObj = event.handleObj,
                targetData = jQuery.data(event.target),
                now = new Date().getTime(),
                delta = targetData.lastTouch ? now - targetData.lastTouch : 0,
                delay = delay == null ? 300 : delay;

            if (delta < delay && delta > 30) {
                targetData.lastTouch = null;
                event.type = handleObj.origType;
                ['clientX', 'clientY', 'pageX', 'pageY'].forEach(function (property) {
                    event[property] = event.originalEvent.changedTouches[0][property];
                });

                // let jQuery handle the triggering of "doubletap" event handlers
                handleObj.handler.apply(this, arguments);
            } else {
                targetData.lastTouch = now;
            }
        }
    };

})(jQuery);