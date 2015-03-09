/**
 * Created by Jerico on 11/16/2014.
 */


var monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday',
    'Thursday', 'Friday', 'Saturday'];

var VIEWER_PATH = "ViewerJS/#../"

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
        Authorization: sessionService.getSessionProperty("authorization"),
        method: "get",
        flowPage: scope.task.page.name
    };
    return dto.fromFnPromise()
        .withOption("ajax", {
            url: url,
            type: "GET",
            headers: headers
        })
        .withDataProp('data')
        .withOption("createdRow", function (row, data, dataIndex) {
            if (scope && compile) {
                compile(angular.element(row).contents())(scope);
            }
        })
        .withOption("autoWidth", false)
        .withOption("info", true)
        .withOption("processing", true)
        .withOption("responsive", true)
        .withOption("sDom", "<'top'iflp<'clear'>>rt<'bottom'iflp<'clear'>>")
        .withOption("stateSave", true)
        .withOption("serverSide", true)
        .withTableTools("swf/copy_csv_xls_pdf.swf")
        .withTableToolsOption("sRowSelect", "os")
        .withTableToolsButtons([
            "copy", "print", {
                "sExtends": "collection",
                "sButtonText": "Edit",
                "aButtons": ["select_all", "select_none"]
            }, {
                "sExtends": "collection",
                "sButtonText": "Save",
                "aButtons": ["csv", "xls", "pdf"]
            }
        ])
        .withPaginationType('simple_numbers')
}

function FlowColumns(dtc, editMethod, deleteMethod, viewMethod) {
    return [dtc.newColumn(null).withTitle('Actions').notSortable().withOption("searchable", false)
        .renderWith(function (data, type, full, meta) {
            return renderActions(data, editMethod, deleteMethod, viewMethod);
        })]
}

function renderCheckbox(data) {
    var span = "text-primary fa fa-square-o";
    if (data) {
        span = "text-success fa fa-check-square-o";
    }
    return "<p class='text-primary'><span class='" + span + "'></span></p>"
}
function renderActions(data, editMethod, deleteMethod, viewMethod) {
    var edit = "edit";
    var del = "delete";
    var view = "view";

    if (viewMethod != undefined) {
        view = viewMethod;
    }

    if (editMethod !== undefined) {
        edit = editMethod;
    }

    if (deleteMethod !== undefined) {
        del = deleteMethod;
    }


    return "<div class='btn-group btn-group-xs'>" +
        "<button ng-if=" + view + " flow-permission-enabled flow-tooltip tooltip-title='View' task='task' page='task.page' method='put'  type='button' class='btn btn-warning glyphicon glyphicon-search field-margin' ng-click='" + view + "(" + data.id + ")'></button>" +
        "<button flow-permission-enabled flow-tooltip tooltip-title='Edit' task='task' page='task.page' method='put'  type='button' class='btn btn-info glyphicon glyphicon-edit field-margin' ng-click='" + edit + "(" + data.id + ")'></button>" +
        "<button flow-permission-enabled flow-tooltip tooltip-title='Delete' task='task' page='task.page' method='delete' type='button' class='btn btn-danger glyphicon glyphicon-trash field-margin' ng-click='" + del + "(" + data.id + ")'> </button></div>";
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

function getPageFromTaskPages(name, task) {

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

    days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday',
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
