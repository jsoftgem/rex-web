(function () {
    'use strict';
    var QUERY_PLANNER = "services/war/planner_query/get_planner";
    var CRUD_ACTIVITY = "services/war/activity_crud/";
    var PLANNER_CUSTOMERS = "session/war/planner_service/customers";
    var SCHOOL = "SCHOOL";
    var OFFICE = "OFFICE";
    var LEAVE = "LEAVE";
    var SEMINAR = "SEMINAR";
    angular.module('war.activity')
        .controller('plannerCtrl', PlannerCtrl);

    PlannerCtrl.$inject = ['$scope', 'flowMessageService', 'flowModalService',
        'HOST', '$timeout', 'Upload', 'userProfile', 'flowHttpService', 'VIEWER', 'resourceApiService'];

    function PlannerCtrl(s, ms, fm, h, t, u, up, fh, v, resourceApiService) {
        activate();
        function activate() {
            s.task.plannerFilter = {};
            s.otherActivity = {};
            s.refreshCustomer = false;
            s.hangingActivity = {};
            s.calendar = {};
            s.task.hideAgentFilter = false;
            s.task.schoolYear = undefined;
            s.task.agent = undefined;
            s.task.activities = [];
            s.task.eventSources = [];
            s.task.customers = [];
            s.task.activityModalId = s.flow.getElementFlowId('activity_modal');
            s.task.selectedDate = {};
            s.task.planner = {};
            s.task.plannedActivities = [];
            s.task.unplannedActivities = [];
            s.task.tempActivity = {};
            s.task.view = "month";
            s.task.tag = "20";
            s.task.customer = {};
            s.task.customer.size = 25;
            s.task.noteQuery = "services/war/activity_note_query/get_activity_day?";
            s.task.showNotes = false;
            s.task.showAttach = false;
            s.task.plannerCalendar = $("#" + s.flow.getElementFlowId("plannerCal"));
            s.submitActivitiesConfirmation = submitActivitiesConfirmation;
            s.task.onWindowOpened = onWindowOpened;
            s.task.plannerFilter.onAgentChange = onAgentChange;
            s.task.plannerFilter.getSchoolYears = getSchoolYears;
            s.calendar.deleteActivity = deleteActivity;
            s.calendar.cancelDeleteActivity = cancelDeleteActivity;
            s.$on(s.flow.event.getSuccessEventId(), function (event, rv, method) {
                if (method === "put") {
                    s.task.activities = [];
                    s.task.plannerCalendar.fullCalendar("removeEvents");
                    s.task.plannerCalendar.fullCalendar("refetchEvents");
                    s.task.planner.id = rv.plannedId;
                }
            });
            s.flow.onRefreshed = function () {
                getPlanner();
                var promise = reFetchCustomer();
                if (promise) {
                    promise.success(function () {
                        s.task.plannerCalendar.fullCalendar("refetchEvents");
                    });
                }
            };
            s.task.viewNotes = function () {
                s.task.showNotes = !s.task.showNotes;
                s.task.showAttach = false;

                if (s.task.showNotes === false) {
                    s.task.editNote = false;
                }
            };
            s.task.saveNotes = function (note) {
                var promise = {};
                if (note.id === undefined) {
                    var year = s.task.selectedDate.getFullYear();
                    var month = monthNames[s.task.selectedDate.getMonth()].toUpperCase();
                    var day = s.task.selectedDate.getDate();
                    note.agentId = s.task.agent.id;
                    note.year = year;
                    note.month = month;
                    note.day = day;
                    promise = s.http.put("services/war/activity_note_crud", note);
                } else {
                    promise = s.http.put("services/war/activity_note_crud/", note, note.id);
                }
                promise.then(function () {
                        s.task.editNote = false
                    }
                );
            };
            s.task.uploadAttachmentUrl = "services/upload_service/upload_file?folder=";
            s.task.attachmentQuery = "services/war/planner_attachment_query/attachment_by_school_year?school_year=";
            s.task.attachmentCrud = "services/war/planner_attachment_crud/";
            s.task.uploadedFiles = [];
            s.newCustomer = function () {
                var customer = {};
                customer.customers = [];
                customer.size = 25;
                customer.tag = "20";
                customer.start = 0;
                customer.month = {};
                customer.isMonth = true;
                customer.week = 0;
                customer.agendId = 0;
                customer.schoolYear = 0;
                customer.page = 1;
                return customer;
            };
            s.customer = s.newCustomer();
            s.task.page.load = function () {
                s.task.plannerCalendar = $("#" + s.flow.getElementFlowId("plannerCal"));
                s.task.calendar = {
                    header: {
                        left: "title",
                        center: "",
                        right: "month basicWeek today prev,next prevYear,nextYear nextMonth,prevMonth"
                    },
                    events: {
                        eventDataTransform: function (eventData) {
                            var event = {};
                            event.title = eventData.description;

                            if (eventData.type === SCHOOL) {
                                event.id = "event_id_" + s.flow.getElementFlowId(eventData.customerMarketId) + "_" + new Date(eventData.startDt).getTime();
                            } else {
                                event.id = "event_id_" + eventData.type + "_" + new Date(eventData.startDt).getTime();
                                event.title = eventData.type;
                            }
                            event.start = eventData.startDt;
                            event.activity = eventData;

                            if (eventData.endDt) {
                                event.end = eventData.endDt;
                            }
                            event.editable = eventData.editable;
                            return event;
                        },
                        url: s.flow.getHomeUrl(),
                        type: "GET",
                        dataFilter: dataFilter,
                        data: function () {
                            return {
                                schoolYear: s.task.schoolYear !== undefined ? s.task.schoolYear.id : undefined,
                                agent: s.task.agent !== undefined ? s.task.agent.id : undefined
                            };
                        }
                    },
                    hiddenDays: [0],
                    firstDay: 1,
                    weekNumbers: true,
                    weekNumberCalculation: function (moment) {
                        var date = moment.toDate();
                        return getWeekOfMonth(date);
                    },
                    fixedWeekCount: false,
                    height: 500,
                    droppable: true,
                    viewRender: function () {
                        s.customer.previous = 0;
                        s.customer.start = 0;
                        s.task.plannerCalendar.fullCalendar("refetchEvents");
                        t(function () {
                            s.task.view = s.task.plannerCalendar.fullCalendar("getView").name;
                        })
                    },
                    dayRender: function (date, cell) {

                        var currentDate = s.task.plannerCalendar.fullCalendar("getDate").toDate();

                        var dayDate = date.toDate();

                        var dataDate = cell.attr("data-date");

                        var cellValueElement = $("table").find(".fc-day-number[data-date='" + dataDate + "']");

                        if (isDayEnabled(dayDate, currentDate)) {
                            cell.addClass("enabled-day");
                            cellValueElement.addClass("enabled-day");
                            cell.addClass("cursor-pointer");
                        } else {
                            cell.addClass("disabled-day");
                            cellValueElement.addClass("disabled-day");
                        }

                        cell.click(function () {
                            t(function () {
                                s.selectDate(dayDate);
                            });
                        })

                    },
                    drop: function (date) {
                        var scope = angular.element($(this)).scope();
                        console.debug("planner.drop.scope", scope);
                        var currentDate = s.task.plannerCalendar.fullCalendar("getDate");
                        if (!isPastDate(date._d)) {
                            var originalEventObject = $(this).data("eventObject");
                            var copiedEventObject = $.extend({}, originalEventObject);
                            var customer = undefined;
                            var activity = {};
                            activity.startDt = date.toDate().getTime();
                            activity.type = copiedEventObject.activityType;
                            var type = activity.type;
                            if (SCHOOL === type) {
                                customer = JSON.parse($(this).attr("customer"));
                                copiedEventObject.title = customer.name + " - " + customer.marketSegment;
                                console.info("customer-drop", customer);
                                activity.customerMarketId = customer.id;
                                activity.description = customer.name + " - " + customer.marketSegment;
                                copiedEventObject.id = "event_id_" + s.flow.getElementFlowId(activity.customerMarketId) + "_" + date.toDate().getTime();
                            } else {
                                activity.customerMarketId = 0;
                                copiedEventObject.id = "event_id_" + s.flow.getElementFlowId(type) + "_" + date.toDate().getTime();
                            }
                            activity.schoolYear = s.task.schoolYear.id;
                            copiedEventObject.start = date;
                            copiedEventObject.editable = true;
                            copiedEventObject.activity = activity;
                            copiedEventObject.durationEditable = false;
                            copiedEventObject.startEditable = false;
                            var evt = scope.task.plannerCalendar.fullCalendar("clientEvents", copiedEventObject.id);

                            if (evt.length === 0) {
                                if (isDayEnabled(date.toDate(), currentDate.toDate())) {
                                    if (type === SCHOOL) {
                                        t(function () {
                                            scope.task.plannerCalendar.fullCalendar("renderEvent", copiedEventObject, true);
                                            console.debug("planner.drop.SCHOOL", copiedEventObject);
                                        });
                                    } else {
                                        t(function () {
                                            scope.otherActivity.hangingEventObject = copiedEventObject;
                                            console.debug("planner.drop.otherActivities", scope.otherActivity.hangingEventObject);
                                            fm.show(scope.flow.getElementFlowId("other_activity"));
                                        });
                                    }
                                }
                            } else {
                                if (customer) {
                                    scope.flow.message.danger("Customer " + customer.customerName + " is already set for " + date.toDate());
                                }
                            }
                        } else {
                            scope.flow.message.danger("Cannot add activity to past dates.");
                        }
                    },
                    eventRender: function (event, element) {
                        var currentDate = s.task.plannerCalendar.fullCalendar("getDate").toDate();
                        var eventDate = event.start.toDate();
                        if (isDayEnabled(eventDate, currentDate)) {
                            element.addClass("event-customer");
                            if (event.activity.planned === false) {
                                element.addClass("unplanned");
                            } else if (event.activity.planned === true) {
                                element.addClass("planned");
                            }
                            if (true === event.editable) {
                                element.qtip({
                                    id: "qtip_evt_" + event.id + "_" + event.start.toDate().getTime(),
                                    content: {
                                        title: event.start,
                                        text: event.title
                                    }, hide: {
                                        inactive: 500
                                    }
                                });

                                element.dblclick(function () {
                                    s.task.plannerCalendar.fullCalendar("removeEvents", event.id);
                                });

                                element.on('doubletap', function () {
                                    s.task.plannerCalendar.fullCalendar("removeEvents", event.id);
                                });
                            }
                            else {
                                if (event.activity.type === SCHOOL) {
                                    element.click(function () {
                                        var tooltip = element.qtip({
                                            style: 'qtip-light',
                                            show: false,
                                            id: "qtip_evt#" + event.id,
                                            position: {
                                                at: "center",
                                                my: "center",
                                                adjust: {
                                                    method: "none shift"
                                                }
                                            },
                                            content: {
                                                title: {
                                                    text: event.title,
                                                    button: true
                                                },
                                                text: '<div><ul><li><b>Marterial Adviser: ' + event.activity.materialAdviser + '</b></li>' +
                                                '<li>Worked with the manager: ' + (event.activity.workedWith === true ? 'Yes' : 'No') + '</li>' +
                                                '<li>Exam Copies Distribution: ' + (event.activity.ecd === true ? 'Yes' : 'No') + '</li>' +
                                                '<li>Invitation to Events: ' + (event.activity.ite === true ? 'Yes' : 'No') + '</li>' +
                                                '<li>Confirmation of Events: ' + (event.activity.coe === true ? 'Yes' : 'No') + '</li>' +
                                                '<li>Follow up Payment: ' + (event.activity.fp === true ? 'Yes' : 'No') + '</li>' +
                                                '<li>Giveaways Distribution: ' + (event.activity.gd === true ? 'Yes' : 'No') + '</li>' +
                                                '<li>Delivery of Incentive/Donation: ' + (event.activity.doi === true ? 'Yes' : 'No') + '</li>' +
                                                '<li>Purchase Order: ' + (event.activity.po === true ? 'Yes' : 'No') + '</li>' +
                                                '<li>Delivery of Add\'l Order / TRM / Compli...: ' + (event.activity.daotrc === true ? 'Yes' : 'No') + '</li>' +
                                                '<li>Booklist: ' + (event.activity.bookList === true ? 'Yes' : 'No') + '</li>' +
                                                '</ul></div>' + getTooltipButtons()
                                            },
                                            hide: {
                                                event: 'click',
                                                inactive: 1500
                                            },
                                            events: {
                                                show: function (evt, api) {
                                                    setTooltipButtonsEvent(event, api);
                                                }
                                            }
                                        });
                                        var api = tooltip.qtip("api");
                                        api.toggle(true);
                                    });
                                }
                                else if (event.activity.type === LEAVE) {
                                    element.click(function () {
                                        var tooltip = element.qtip({
                                            style: 'qtip-light',
                                            show: false,
                                            id: "qtip_evt#" + event.id,
                                            position: {
                                                at: "center",
                                                my: "center",
                                                adjust: {
                                                    method: "none shift"
                                                }
                                            },
                                            content: {
                                                title: {
                                                    text: event.title,
                                                    button: true
                                                },
                                                text: "<div><ul><li><b>Agent: " + event.activity.materialAdviser + "</b></li>" +
                                                "<li>Reason for leave: " + (event.activity.description != undefined || event.activity.description != null ? event.activity.description : 'N/A' ) + "</li>" +
                                                "</ul></div>" + getTooltipButtons()
                                            },
                                            hide: {
                                                event: 'click',
                                                inactive: 1500
                                            },
                                            events: {
                                                show: function (evt, api) {
                                                    setTooltipButtonsEvent(event, api);
                                                }
                                            }
                                        });
                                        var api = tooltip.qtip("api");
                                        api.toggle(true);

                                    });
                                } else {
                                    element.click(function () {
                                        var tooltip = element.qtip({
                                            style: 'qtip-light',
                                            show: false,
                                            id: "qtip_evt#" + event.id,
                                            position: {
                                                at: "center",
                                                my: "center",
                                                adjust: {
                                                    method: "none shift"
                                                }
                                            },
                                            content: {
                                                title: {
                                                    text: event.title,
                                                    button: true
                                                },
                                                text: "<div><ul><li><b>Agent: " + event.activity.materialAdviser + "</b></li>" +
                                                "<li>Description: " + (event.activity.description != undefined || event.activity.description != null ? event.activity.description : 'N/A' ) + "</li>" +
                                                "</ul></div>" +
                                                getTooltipButtons()
                                            },
                                            hide: {
                                                event: 'click',
                                                inactive: 1500
                                            },
                                            events: {
                                                show: function (evt, api) {
                                                    setTooltipButtonsEvent(event, api);
                                                }
                                            }
                                        });

                                        var api = tooltip.qtip("api");
                                        api.toggle(true);

                                    });
                                }
                            }
                        }
                        else {
                            element.addClass("hide-event");
                        }
                    }
                };
                s.task.plannerCalendar.fullCalendar(s.task.calendar);
                if (up.agent.id) {
                    console.debug("planner-loaded.profile", up);
                    s.task.hideAgentFilter = !up.isManager();
                    s.task.page.title = up.agent.initials;
                    if (!up.isManager()) {
                        s.changeAgent(up.agent);
                    } else {
                        s.task.agent = up.agent;
                    }
                }
                s.task.plannerCalendar.fullCalendar("render");
            };
            s.calendar.getCurrentDate = function () {
                return s.task.plannerCalendar.fullCalendar("getDate").toDate();
            };
            s.calendar.clearEvents = function () {
                s.task.plannerCalendar.fullCalendar("removeEvents");
                s.task.plannerCalendar.fullCalendar("refetchEvents");
            };
            s.calendar.valid = function () {
                var valid = true;
                if (s.task.schoolYear === undefined) {
                    s.flow.message.danger("Please select a school year.");
                    valid = false;
                }

                if (s.task.agent === undefined) {
                    s.flow.message.danger("Please select an agent.");
                    valid = false;
                }
                var events = s.task.plannerCalendar.fullCalendar("clientEvents");
                if (events.length === 0) {
                    s.flow.message.danger("Please plan your activites.");
                    valid = false;
                }
                return valid;
            };
            s.calendar.submit = function () {
                if (s.calendar.valid()) {
                    getPlanner();
                    if (!s.task.planner) {
                        s.task.planner = {};
                    }
                    s.task.planner.schoolYear = s.task.schoolYear.id;
                    s.task.planner.agentId = s.task.agent.id;
                    //get activities
                    var events = s.task.plannerCalendar.fullCalendar("clientEvents");
                    var date = s.task.plannerCalendar.fullCalendar("getDate").toDate();
                    s.task.planner.month = monthNames[date.getMonth()].toUpperCase();
                    s.task.planner.year = date.getFullYear();
                    for (var i = 0; i < events.length; i++) {
                        var event = events[i];
                        if (event.editable) {
                            s.task.activities.push(event.activity);
                            event.activity.agentId = s.task.agent.id;
                        }
                    }
                    var plannerSession = {};
                    plannerSession.warPlanner = s.task.planner;
                    plannerSession.activities = s.task.activities;
                    s.flow.action("put", plannerSession);
                    fm.hide(s.flow.getElementFlowId("submitConfirm"));
                }
            };
            s.otherActivity.submit = function () {

                if (s.otherActivity.hangingEventObject) {

                    var activity = s.otherActivity.hangingEventObject.activity;

                    var type = activity.type;

                    if (type === LEAVE) {
                        if (activity.description === undefined) {
                            ms.danger(s.flow.getElementFlowId('other_activity_messages'), "Please fill out reason for leave.", 3000).open();
                        } else {
                            s.task.plannerCalendar.fullCalendar("renderEvent", s.otherActivity.hangingEventObject, true);
                            fm.hide(s.flow.getElementFlowId("other_activity"));
                        }
                    } else if (type === SEMINAR) {
                        if (activity.description === undefined) {
                            ms.danger(s.flow.getElementFlowId('other_activity_messages'), "Please fill out the details.", 3000).open();
                        } else {
                            s.task.plannerCalendar.fullCalendar("renderEvent", s.otherActivity.hangingEventObject, true);
                            fm.hide(s.flow.getElementFlowId("other_activity"));
                        }
                    } else if (type === OFFICE) {
                        if (activity.description === undefined) {
                            ms.danger(s.flow.getElementFlowId('other_activity_messages'), "Please fill out the description.", 3000).open();
                        } else {
                            s.task.plannerCalendar.fullCalendar("renderEvent", s.otherActivity.hangingEventObject, true);
                            fm.hide(s.flow.getElementFlowId("other_activity"));
                        }
                    }

                }

            };
            s.otherActivity.cancel = function () {
                fm.hide(s.flow.getElementFlowId("other_activity"));
                s.task.plannerCalendar.fullCalendar("removeEvents", s.otherActivity.hangingEventObject.id);
            };
            s.hangingActivity.update = function () {
                if (!angular.equals(s.hangingActivity.activity, s.tempActivity)) {
                    if (s.hangingActivity.activity.type === SCHOOL) {
                        s.http.put(CRUD_ACTIVITY, s.hangingActivity.activity, s.hangingActivity.activity.id)
                            .success(function () {
                                fm.hide(s.task.activityModalId);
                                reFetchCustomer();
                            })
                            .error(function (msg) {
                                ms.warning(s.flow.getElementFlowId("activity_messages"), msg, 3000).open();
                            })
                    }
                    else {
                        var activity = s.hangingActivity.activity;
                        var type = activity.type;
                        var valid = true;
                        if (type === LEAVE) {
                            if (activity.description === undefined) {
                                ms.danger(s.flow.getElementFlowId('other_activity_messages'), "Please fill out reason for leave.", 3000).open();
                                valid = false;
                            }
                        } else if (type === SEMINAR) {
                            if (activity.description === undefined) {
                                ms.danger(s.flow.getElementFlowId('other_activity_messages'), "Please fill out the details.", 3000).open();
                                valid = false;
                            }
                        } else if (type === OFFICE) {
                            if (activity.description === undefined) {
                                ms.danger(s.flow.getElementFlowId('other_activity_messages'), "Please fill out the description.", 3000).open();
                                valid = false;
                            }
                        }

                        if (valid) {
                            s.http.put(CRUD_ACTIVITY, s.hangingActivity.activity, s.hangingActivity.activity.id)
                                .success(function (msg) {
                                    fm.hide(s.task.activityModalId);
                                    reFetchCustomer();
                                })
                                .error(function (msg) {
                                    ms.warning(s.flow.getElementFlowId("activity_messages"), msg, 3000).open();
                                })
                        }
                    }
                } else {
                    ms.warning(s.flow.getElementFlowId("activity_messages"), "No changes has been made.", 3000).open();
                }
            };
            s.hangingActivity.cancel = function () {
                fm.hide(s.task.activityModalId);
            };
            s.buildCustomerQuery = function () {

                var date = s.task.plannerCalendar.fullCalendar("getDate").toDate();

                var month = monthNames[date.getMonth()].toUpperCase();

                s.customer.month = month;

                s.customer.weekStart = date.getTime();

                s.customer.isMonth = s.task.plannerCalendar.fullCalendar("getView").name === "month";
                if (s.task.schoolYear) {
                    s.customer.schoolYear = s.task.schoolYear.id;
                }

                s.customer.agentId = s.task.agent.id;

                console.debug("planner.customer", s.customer);
                return PLANNER_CUSTOMERS + "?tag=" + s.customer.tag
                    + "&size=" + s.customer.size
                    + "&month=" + s.customer.month
                    + "&isMonth=" + s.customer.isMonth
                    + "&start=" + s.customer.start
                    + "&schoolYear=" + s.customer.schoolYear
                    + "&agentId=" + s.customer.agentId
                    + "&weekStart=" + s.customer.weekStart
                    + "&page=" + s.customer.page;
            };
            s.initDrag = function ($last) {
                if ($last) {
                    setDraggable(s);
                }
            };
            s.changeAgent = function (item) {
                console.debug("planner-changeAgent.item", item);
                s.task.agent = item;
                s.flow.onRefreshed();
            };
            s.changeTag = function (tag) {
                s.customer.tag = tag;
                s.customer.start = 0;
                if (tag === "All") {
                    s.changeSize(25);
                } else {
                    reFetchCustomer();
                }
            };
            s.changeSize = function (size) {
                s.customer.size = size;
                s.customer.start = 0;
                s.customer.page = 1;
                reFetchCustomer();
            };
            s.next = function () {
                s.customer.page++;
                s.customer.start += s.customer.next ? s.customer.next : 0;
                getCustomerMarket();

            };
            s.prev = function () {
                s.customer.page--;
                s.customer.start -= s.customer.previous ? s.customer.previous : 0;
                getCustomerMarket();
            };
            s.openCustomerSummary = function (customerId) {
                if (s.task.schoolYear && s.task.agent) {
                    var param = customerId + "?schoolYear=" + s.task.schoolYear.id;
                    s.flow.openTask("customer_agent_task", "customer_agent_summary", param, false, {
                        source: "planner",
                        agent: s.task.agent,
                        schoolYear: s.task.schoolYear
                    });
                }
            };
            s.task.viewAttach = function () {
                s.task.showAttach = !s.task.showAttach;
                s.task.showNotes = false;

                if (s.task.showAttach) {
                    s.http.post(s.task.attachmentQuery, undefined, s.task.schoolYear.id)
                        .success(function (attachments) {
                            s.task.uploadedFiles = attachments;
                        }).then(function () {
                        if (!s.task.uploadedFiles) {
                            s.task.uploadedFiles = [];
                        }
                    });
                }

                if (s.task.attachPrompt) {
                    s.task.deleteAttachCancel();
                }
            };
            s.task.refreshAttach = function () {
                s.task.attachRefresh = true;
                if (s.task.showAttach) {
                    s.http.post(s.task.attachmentQuery, undefined, s.task.schoolYear.id)
                        .success(function (attachments) {
                            s.task.uploadedFiles = attachments;
                        }).then(function () {
                        s.task.attachRefresh = false;
                    });
                }
            };
            s.task.addToFileList = function (file) {
                if (s.task.attachPrompt) {
                    s.task.attachPrompt = false;
                    s.task.deleteAttachId = undefined;
                }
                console.debug("files", file);
                var newFile = {};
                angular.copy(file, newFile);
                var folder = "group.school_year." + s.task.schoolYear.id;
                var url = s.task.uploadAttachmentUrl + folder + "&file-name=" + file.name;

                console.debug("file", file);
                var attachment = {};
                attachment.done = false;
                attachment.fileName = file.name;
                attachment.fileType = file.type;
                attachment.schoolYear = s.task.schoolYear.id;
                s.task.uploadedFiles.push(attachment);
                u.upload({
                    url: withHost(url),
                    headers: {
                        "flowPage": s.task.currentPage
                    },
                    file: file
                }).progress(function (event) {
                    console.info("progress", event);
                    attachment.total = event.total;
                    attachment.progress = event.loaded;
                }).success(function (flowUploadedFile) {
                    attachment.done = true;
                    attachment.progress = undefined;
                    attachment.total = undefined;
                    attachment.uploadedFileId = flowUploadedFile.id;
                    console.info("success-upload", flowUploadedFile);
                    s.http.put(s.task.attachmentCrud, attachment).success(function () {
                        s.task.refreshAttach();
                    });
                });
            };
            s.task.download = function (uploadFieldId) {
                return fh.host + "services/download_service/getContent/" + uploadFieldId;
            };
            s.task.downloadInfo = function (uploadFieldId) {
                return s.http.get("services/download_service/getInfo/", uploadFieldId)
            };
            s.task.deleteAttach = function (attachment) {
                s.task.deleteAttachId = attachment.id;
                s.task.attachPrompt = true;
            };
            s.task.deleteAttachCancel = function () {
                s.task.attachPrompt = false;
                s.task.deleteAttachId = undefined;
                s.task.refreshAttach();
            };
            s.task.deleteAttachConfirmed = function () {
                s.http.delete(s.task.attachmentCrud, s.task.deleteAttachId)
                    .then(function () {
                        s.task.attachPrompt = false;
                        s.task.deleteAttachId = undefined;
                        s.task.refreshAttach();
                    });

            };
            s.task.closeViewer = function () {
                s.task.attachmentView = undefined;
                s.task.viewerFile = undefined;
                fm.hide(s.flow.getElementFlowId("attachment_viewer"));
                s.task.refreshAttach();
            };
            s.task.openViewer = function (attachment) {
                s.task.attachmentView = attachment;
                s.task.viewerFile = v + h + "services/download_service/getContent/" + attachment.uploadedFileId;
                fm.show(s.flow.getElementFlowId("attachment_viewer"));
            };
            s.selectYear = function (item) {
                s.task.schoolYear = item;
                var date = new Date(item.date);
                s.task.plannerCalendar.fullCalendar("gotoDate", date);
                s.task.plannerCalendar.fullCalendar("refetchEvents");
                reFetchCustomer();
                if (s.task.showAttach) {
                    s.http.post(s.task.attachmentQuery, undefined, s.task.schoolYear.id)
                        .success(function (attachments) {
                            s.task.uploadedFiles = attachments;
                        }).then(function () {
                        if (!s.task.uploadedFiles) {
                            s.task.uploadedFiles = [];
                        }
                    });
                }
            };
            s.selectDate = function (date) {
                if (date) {
                    s.task.selectedDate = date;
                    if (s.task.agent) {
                        s.task.dailyNote = {};
                        var year = s.task.selectedDate.getFullYear();
                        var month = monthNames[s.task.selectedDate.getMonth()].toUpperCase();
                        var day = s.task.selectedDate.getDate();
                        var url = s.task.noteQuery;
                        url += "agentId=" + s.task.agent.id;
                        url += "&year=" + year;
                        url += "&month=" + month;
                        url += "&day=" + day;
                        s.http.post(url)
                            .success(function (note) {
                                s.task.dailyNote = note;
                            });
                    }
                }

            }
        }

        function getCustomerMarket() {
            if (s.task.agent && s.task.agent.id) {
                var promise = s.http.get(s.buildCustomerQuery());

                promise.success(function (customer) {
                    s.customer = customer;

                    if (!s.customer.customers) {
                        s.customer = s.newCustomer();
                        disableDraggable(s);
                    } else {
                        setDraggable(s);
                    }
                });

                promise.error(function () {
                    s.customer = s.newCustomer();
                });

                return promise;
            } else {
                s.customer.customers = undefined;
            }
        }

        function reFetchCustomer() {
            if (s.customer.previous !== undefined) {
                s.customer.start = s.customer.previous;
            }
            return getCustomerMarket();
        }

        function onWindowOpened() {
            s.task.schoolYear = undefined;
            s.task.agent = undefined;
            s.task.plannerCalendar.fullCalendar("destroy");
            s.task.plannerCalendar.fullCalendar("render");
            s.task.plannerCalendar.fullCalendar(s.task.calendar);
        }

        function getPlanner(view) {
            var date = undefined;
            if (view === undefined) {
                date = s.task.plannerCalendar.fullCalendar("getDate").toDate();
            } else {
                date = view.intervalStart.toDate();
            }
            var month = monthNames[date.getMonth()].toUpperCase();
            if (s.task.schoolYear) {
                var url = null;
                if (s.task.agent) {
                    url = QUERY_PLANNER + "?schoolYear=" + s.task.schoolYear.id + "&agent=" + s.task.agent.id + "&year=" + date.getFullYear() + "&month=";
                } else {
                    url = QUERY_PLANNER + "?schoolYear=" + s.task.schoolYear.id + "&year=" + date.getFullYear() + "&month=";
                }
                var promise = s.http.get(url, month);
                promise.success(function (data) {
                    s.task.planner = data;
                });
                promise.error(function () {
                    s.task.planner = {};
                });
            }
        }

        function submitActivitiesConfirmation() {
            fm.show(s.flow.getElementFlowId("submitConfirm"));
        }

        function onAgentChange(id) {
            resourceApiService.WarAgent.getById(id, function (agent) {
                s.task.agent = agent;
                s.flow.onRefreshed();
            });
        }

        function getSchoolYears() {
            s.task.plannerFilter.schoolYearLoaded = false;
            resourceApiService.SchoolYearResource.getList(function (schoolYears) {
                s.task.plannerFilter.schoolYears = schoolYears;
                s.task.plannerFilter.schoolYearLoaded = true;
            }, function () {
                s.task.plannerFilter.schoolYears = [];
                s.task.plannerFilter.schoolYearLoaded = true;
            });
        }

        function dataFilter(data, type) {
            if (type === "json") {
                var activities = JSON.parse(data);
                t(function () {
                    s.task.activities = [];
                    s.task.plannedActivities = [];
                    s.task.unplannedActivities = [];
                    angular.forEach(activities, function (activity) {
                        if (activity.planned) {
                            s.task.plannedActivities.push(activity);
                        } else {
                            s.task.unplannedActivities.push(activity);
                        }
                    });
                    s.calendar.plannedCount = s.task.plannedActivities.length;
                    s.calendar.unPlannedCount = s.task.unplannedActivities.length;
                });
            }
            return data;
        }

        function isPastDate(date) {
            console.debug('isPastDate', date);
            var now = new Date();
            return date < now;
        }

        function isDeleteVisible(date) {
            return isPastWeek(date) || up.isAdmin() || up.isManager() || up.isGeneralManager();
        }

        function isUpdateVisible(date) {
            return isPastWeek(date) || up.isAdmin() || up.isManager() || up.isGeneralManager();
        }

        function isPastWeek(date) {
            var current = new Date();
            return getWeekOfYear(date) < getWeekOfYear(current);
        }

        function getWeekOfYear(d) {
            d = new Date(+d);
            d.setHours(0, 0, 0);
            d.setDate(d.getDate() + 4 - (d.getDay() || 7));
            var yearStart = new Date(d.getFullYear(), 0, 1);
            var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1) / 7);
            return [d.getFullYear(), weekNo];
        }

        function getTooltipButtons() {
            return '<div class="btn-group btn-group-xs">' +
                '<button style="display:' + (isUpdateVisible(event._d) ? 'block' : 'none') + '" type="button" class="btn btn-info update">Update</button>' +
                '<button style="display:' + (isDeleteVisible(event._d) ? 'block' : 'none') + '" class="btn btn-danger delete" type="button">Delete</button>' +
                '</div>';
        }

        function setTooltipButtonsEvent(event, api) {
            api.elements.tooltip.find('button.update').unbind('click');
            api.elements.tooltip.find('button.delete').unbind('click');
            api.elements.tooltip.find('button.update').click(function () {
                api.toggle(false);
                t(function () {
                    s.hangingActivity.activity = event.activity;
                    angular.copy(s.hangingActivity.activity, s.tempActivity);
                    fm.show(s.flow.getElementFlowId('activity_modal'));
                });
            });
            api.elements.tooltip.find('button.delete').click(function () {
                api.toggle(false);
                t(function () {
                    s.hangingActivity.activity = event.activity;
                    fm.show(s.flow.getElementFlowId('activityDeleteConfirm'));
                });
            });
        }

        function deleteActivity(id) {
            resourceApiService.ActivityResource.deleteActivity(id, function () {
                var promise = reFetchCustomer();
                if (promise) {
                    promise.success(function () {
                        s.task.plannerCalendar.fullCalendar("refetchEvents");
                        fm.hide(s.flow.getElementFlowId('activityDeleteConfirm'));
                    });
                }
                s.hangingActivity = {};
            }, function () {
                s.hangingActivity = {};
            });
        }

        function cancelDeleteActivity() {
            s.hangingActivity = {};
            fm.hide(s.flow.getElementFlowId('activityDeleteConfirm'));
        }

    }

})();
