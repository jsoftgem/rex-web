/**
 * Created by Jerico on 2/16/2015.
 */
angular.module("plannerModule", ["fluid", "ngResource", "datatables", "ngCookies"])
    .controller("plannerCtrl", ["$scope", "DTOptionsBuilder", "DTColumnBuilder", "flowMessageService", "flowModalService", "$compile", "$filter", "$cookies", "HOST", "$timeout", "flowFrameService",
        function (s, dto, dtc, ms, fm, c, f, co, h, t, ffs) {


            s.otherActivity = {};
            s.refreshCustomer = false;
            s.hangingActivity = {};
            s.calendar = {};
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
                return customer;
            }

            s.customer = s.newCustomer();
            s.task.preLoad = function () {


                s.task.schoolYear = undefined;
                s.task.agent = undefined;
                s.task.activities = [];
                s.task.eventSources = [];
                s.task.customers = [];
                s.task.activityModalId = s.flow.getElementFlowId('activity_modal');
                s.task.selectedDate = {};
                s.task.planner = {};
                s.task.planner.enabled = true;
                s.task.plannedActivities = [];
                s.task.unplannedActivities = [];
                s.task.tempActivity = {};
                s.task.view = "month";
                s.task.tag = "20";
                s.task.customer = {};
                s.task.customer.size = 25;
                s.task.plannerCalendar = $("#" + s.flow.getElementFlowId("plannerCal"));

                s.flow.onOpenPinned = function (page, param) {
                    alert(page);
                }
                s.flow.pageCallBack = function (page) {
                    if (NAME_HOME === page) {
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
                                    event.activity = eventData

                                    if (eventData.endDt) {
                                        event.end = eventData.endDt;
                                    }
                                    event.editable = eventData.editable;
                                    return event;
                                },
                                url: s.flow.getHomeUrl(),
                                type: "GET",
                                dataFilter: function (data, type) {
                                    if (type === "json") {

                                        var activities = JSON.parse(data);

                                        s.task.activities = [];

                                        s.task.plannedActivities = [];
                                        s.task.unplannedActivities = [];

                                        angular.forEach(activities, function (activity) {
                                            if (activity.planned) {
                                                s.task.plannedActivities.push(activity);
                                            } else {
                                                s.task.unplannedActivities.push(activity);
                                            }

                                        })

                                        s.calendar.plannedCount = s.task.plannedActivities.length;
                                        s.calendar.unPlannedCount = s.task.unplannedActivities.length;
                                    }

                                    return data;
                                },
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
                            editable: s.task.planner.enabled,
                            fixedWeekCount: false,
                            height: 500,
                            droppable: true,
                            viewRender: function (view) {

                                if (s.task.agent !== undefined) {

                                    s.getPlanner(view);

                                    s.customer.previous = undefined;

                                    s.refetchCustomer();


                                    $("#" + s.flow.getElementFlowId("other_activities") + " td div").each(function () {

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


                                } else {
                                    $("#" + s.flow.getElementFlowId("other_activities") + " td div").each(function () {

                                        if ($(this).draggable()) {
                                            $(this).draggable("destroy");
                                        }
                                    });
                                }


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
                                } else {
                                    cell.addClass("disabled-day");
                                    cellValueElement.addClass("disabled-day");
                                }

                            },
                            eventDrop: function (event, delta, revertFunc) {

                                var currentDate = s.task.plannerCalendar.fullCalendar("getDate");

                                var evt = s.task.plannerCalendar.fullCalendar("clientEvents", event.id);

                                if (evt.length === 0) {
                                    if (isDayEnabled(event.start.toDate(), currentDate.toDate())) {
                                        if (type === SCHOOL) {
                                            s.task.plannerCalendar.fullCalendar("renderEvent", event, true);
                                        } else {
                                            t(function () {
                                                s.otherActivity.hangingEventObject = event;
                                                fm.show(s.flow.getElementFlowId("other_activity"));
                                            });

                                        }
                                    }

                                } else {
                                    if (event) {
                                        s.flow.message.danger("Customer " + event.title + " is already set for " + event.start.toDate());
                                        revertFunc();
                                    }
                                }
                            },
                            drop: function (date) {

                                var currentDate = s.task.plannerCalendar.fullCalendar("getDate");

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
                                    activity.customerMarketId = customer.customerMarketId;
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

                                var evt = s.task.plannerCalendar.fullCalendar("clientEvents", copiedEventObject.id);

                                if (evt.length === 0) {
                                    if (isDayEnabled(date.toDate(), currentDate.toDate())) {
                                        if (type === SCHOOL) {
                                            s.task.plannerCalendar.fullCalendar("renderEvent", copiedEventObject, true);
                                        } else {
                                            t(function () {
                                                s.otherActivity.hangingEventObject = copiedEventObject;
                                                fm.show(s.flow.getElementFlowId("other_activity"));
                                            });

                                        }
                                    }

                                } else {
                                    if (customer) {
                                        s.flow.message.danger("Customer " + customer.customerName + " is already set for " + date.toDate());
                                    }
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
                                    }
                                    else {
                                        if (event.activity.type === SCHOOL) {
                                            element.click(function () {
                                                var buttonId = "edit_button" + "_" + event.id;
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
                                                        text: "<div><ul><li><b>Marterial Adviser: " + event.activity.materialAdviser + "</b></li>" +
                                                        "<li>Actual: " + (event.activity.actual === true ? " Yes" : "No") + "</li>" +
                                                        "<li>Exam Copies Distribution: " + (event.activity.ecd === true ? " Yes" : "No") + "</li>" +
                                                        "<li>Invitation to Events: " + (event.activity.ite === true ? " Yes" : "No") + "</li>" +
                                                        "<li>Confirmation of Events: " + (event.activity.coe === true ? " Yes" : "No") + "</li>" +
                                                        "<li>Giveaways Distribution: " + (event.activity.gd === true ? " Yes" : "No") + "</li>" +
                                                        "<li>Delivery of Incentive/Donation: " + (event.activity.doi === true ? " Yes" : "No") + "</li>" +
                                                        "<li>Purchase Order: " + (event.activity.po === true ? " Yes" : "No") + "</li>" +
                                                        "<li>Delivery of Add'l Order / TRM / Compli...: " + (event.activity.daotrc === true ? " Yes" : "No") + "</li>" +
                                                        "<li>Booklist: " + (event.activity.bookList === true ? " Yes" : "No") + "</li>" +
                                                        "</ul></div>" +
                                                        "<div class='btn-group btn-group-xs'>" +
                                                        "<button style='display:" + (s.task.agent !== undefined ? "block" : "none") + "' id='" + buttonId + "' type='button' class='btn btn-info'>Update</button></div>"
                                                    },
                                                    hide: {
                                                        event: 'click',
                                                        inactive: 1500
                                                    },
                                                    events: {
                                                        show: function (evt, api) {
                                                            api.elements.tooltip.find("#" + buttonId).click(function () {
                                                                api.toggle(false);
                                                                t(function () {
                                                                    s.hangingActivity.activity = event.activity;
                                                                    angular.copy(s.hangingActivity.activity, s.tempActivity);
                                                                    fm.show(s.flow.getElementFlowId('activity_modal'))
                                                                });
                                                            });

                                                        }
                                                    }
                                                });
                                                var api = tooltip.qtip("api");
                                                api.toggle(true);
                                            });
                                        }
                                        else if (event.activity.type === LEAVE) {
                                            element.click(function () {
                                                var buttonId = "edit_button" + "_" + event.id;
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
                                                        "</ul></div>" +
                                                        "<div class='btn-group btn-group-xs'>" +
                                                        "<button style='display:" + (s.task.agent !== undefined ? "block" : "none") + "' id='" + buttonId + "' type='button' class='btn btn-info'>Update</button></div>"
                                                    },
                                                    hide: {
                                                        event: 'click',
                                                        inactive: 1500
                                                    },
                                                    events: {
                                                        show: function (evt, api) {
                                                            api.elements.tooltip.find("#" + buttonId).click(function () {
                                                                api.toggle(false);
                                                                t(function () {
                                                                    s.task.currentActivity = event.activity;
                                                                    angular.copy(s.task.currentActivity, s.task.tempActivity);
                                                                    fm.show(s.flow.getElementFlowId('activity_modal'))

                                                                });
                                                            });

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
                        }
                        s.task.plannerCalendar.fullCalendar(s.task.calendar);
                        s.task.plannerCalendar.fullCalendar("render");
                    }
                }
                s.task.onWindowOpened = function () {
                    s.task.schoolYear = undefined;
                    s.task.agent = undefined;
                    s.task.plannerCalendar.fullCalendar("destroy");
                    s.task.plannerCalendar.fullCalendar("render");
                    s.task.plannerCalendar.fullCalendar(s.task.calendar);
                }

                s.$on(s.flow.event.getSuccessEventId(), function (event, rv, method) {
                    if (method === "put") {
                        s.task.activities = [];
                        s.task.plannerCalendar.fullCalendar("removeEvents");
                        s.task.plannerCalendar.fullCalendar("refetchEvents");
                        s.task.planner.id = rv.plannedId;
                    }
                });

                s.flow.onRefreshed = function () {


                    s.getPlanner();

                    s.refetchCustomer();

                    s.task.plannerCalendar.fullCalendar("refetchEvents");

                }


            };

            s.calendar.getCurrentDate = function () {
                return s.task.plannerCalendar.fullCalendar("getDate").toDate();
            }

            s.calendar.clearEvents = function () {
                s.task.plannerCalendar.fullCalendar("removeEvents");
                s.task.onRefreshed();
            }

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
            }
            s.calendar.submit = function () {
                if (s.calendar.valid()) {

                    s.getPlanner();
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
                }
            }

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

            }
            s.otherActivity.cancel = function () {
                fm.hide(s.flow.getElementFlowId("other_activity"));
                s.task.plannerCalendar.fullCalendar("removeEvents", s.otherActivity.hangingEventObject.id);
            }
            s.hangingActivity.update = function () {
                if (!angular.equals(s.hangingActivity.activity, s.tempActivity)) {
                    if (s.hangingActivity.activity.type === SCHOOL) {
                        s.http.put(CRUD_ACTIVITY, s.hangingActivity.activity, s.hangingActivity.activity.id)
                            .success(function (msg) {
                                fm.hide(s.task.activityModalId);
                                s.refetchCustomer();
                            })
                            .error(function (msg) {
                                ms.warning(s.flow.getElementFlowId("activity_messages"), msg, 3000).open();
                            })
                    }
                    else if (s.hangingActivity.activity.type.type === LEAVE) {

                    }
                } else {
                    ms.warning(s.flow.getElementFlowId("activity_messages"), "No changes has been made.", 3000).open();
                }
            }
            s.hangingActivity.cancel = function () {
                fm.hide(s.task.activityModalId);
            }

            s.buildCustomerQuery = function () {

                var date = s.task.plannerCalendar.fullCalendar("getDate").toDate();

                var month = monthNames[date.getMonth()].toUpperCase();

                s.customer.month = month;

                t(function () {
                    s.customer.isMonth = s.task.plannerCalendar.fullCalendar("getView").name === "month";
                })

                s.customer.schoolYear = s.task.schoolYear.id;

                s.customer.agentId = s.task.agent.id;

                return PLANNER_CUSTOMERS + "?tag=" + s.customer.tag
                    + "&size=" + s.customer.size
                    + "&month=" + s.customer.month
                    + "&isMonth=" + s.customer.isMonth
                    + "&start=" + s.customer.start
                    + "&schoolYear=" + s.customer.schoolYear
                    + "&agentId=" + s.customer.agentId
                    + "&week=" + s.customer.week;
            }
            s.getCustomerMarket = function () {
                if (s.task.agent === undefined) return;
                var promise = s.http.get(s.buildCustomerQuery());

                promise.success(function (customer) {
                    s.customer = customer;

                    if (!s.customer.customers) {
                        s.customer = s.newCustomer();


                        $("#" + s.flow.getElementFlowId('event_body') + " .event-customer td a").each(function () {

                            $(this).removeClass("draggable").addClass("non-draggable");

                            if ($(this).draggable()) {
                                $(this).draggable("destroy");
                            }
                        });


                    }


                });

                promise.error(function () {
                    s.customer = s.newCustomer();
                })

                return promise;
            }
            s.getPlanner = function (view) {
                var date = undefined;

                if (view === undefined) {
                    date = s.task.plannerCalendar.fullCalendar("getDate").toDate();
                } else {
                    date = view.intervalStart.toDate();
                }

                var month = monthNames[date.getMonth()].toUpperCase()

                var url = QUERY_PLANNER + "?schoolYear=" + s.task.schoolYear.id + "&agent=" + s.task.agent.id + "&year=" + date.getFullYear() + "&month=";

                var promise = s.http.get(url, month);

                promise.success(function (data) {
                    s.task.planner = data;
                })

                promise.error(function () {
                    s.task.planner = {};
                });

            }
            s.refetchCustomer = function () {
                s.refreshCustomer = true;
            }
            s.changeTag = function (tag) {
                s.customer.tag = tag;

                if (tag === "All") {
                    s.customer.size = 25;
                } else {
                    s.refetchCustomer();
                }
            }
            s.selectSize = function (size) {
                s.customer.size = size;
                s.refetchCustomer();
            }

            s.$watch(function (scope) {
                return scope.refreshCustomer;
            }, function (newValue) {
                if (newValue === true) {
                    if (s.customer.previous != undefined) {
                        s.customer.start = s.customer.previous;
                    }
                    var promise = s.getCustomerMarket();
                    if (promise) {
                        promise.success(function () {
                            t(function () {
                                $("#" + s.flow.getElementFlowId("event_body") + " .event-customer td a").each(function () {
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
                            });
                        });
                    }
                    s.refreshCustomer = false;
                }

            });
            s.$watch(function (scope) {
                return scope.customer.size;
            }, function (size) {
                s.selectSize(size);
            })
            s.$watch(function (scope) {
                return scope.task.schoolYear
            }, function (schoolYear) {
                if (schoolYear !== undefined) {
                    var date = new Date(schoolYear.date);
                    s.task.plannerCalendar.fullCalendar("gotoDate", date);
                    s.task.plannerCalendar.fullCalendar("refetchEvents");
                    s.refetchCustomer();
                }
            });
            s.$watch(function (scope) {
                return scope.task.agent;
            }, function (agent) {
                if (agent) {
                    s.customer.start = 0;
                    s.getCustomerMarket()
                        .success(function () {
                            t(function () {
                                $("#" + s.flow.getElementFlowId("other_activities") + " td div").each(function () {

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
                            });
                        });

                } else {
                    s.customer = s.newCustomer();
                    $("#" + s.flow.getElementFlowId("other_activities") + " td div").each(function () {

                        if ($(this).draggable()) {
                            $(this).draggable("destroy");
                        }
                    });
                }
                if (s.task.plannerCalendar) {
                    s.task.plannerCalendar.fullCalendar("refetchEvents");
                }
            });

        }]
);