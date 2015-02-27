angular.module("plannerModule", ["fluid", "ngResource", "datatables", "ngCookies", "flowServices"])
    .controller("plannerCtrl", ["$scope", "DTOptionsBuilder", "DTColumnBuilder", "flowMessageService", "flowModalService", "$compile", "$filter", "$cookies",
        "HOST", "$timeout", "flowFrameService", "hasProfile", "userProfile",
        function (s, dto, dtc, ms, fm, c, f, co, h, t, ffs, hp, up) {

            s.task.table = {};
            s.task.table.isMaterialsAdvisor = true; 
            s.task.table.isWeek = true;
            s.task.table.isYear = true;
            s.task.hideAgentFilter = false;


            hp.check("agent", s.task)
                .success(function (valid) {
                    s.task.hideAgentFilter = valid;
                    s.task.agent = up.agent;
                });


            s.task.preLoad = function () {


                s.task.basicWeek = "basicWeek";
                s.task.month = "month";
                s.task.customerMarketQuery = "services/war/war_customer_market_query/"
                s.task.getPlannerQuery = "services/war/planner_query/get_planner"
                s.task.saveActivityCrud = "services/war/activity_crud/"
                s.task.activities = [];
                s.task.eventSources = [];
                s.task.customers = [];
                s.task.home = "planner";
                s.task.activityModalId = s.flow.getElementFlowId('activity_modal');
                s.task.selectedDate = {};
                s.task.planner = {};
                s.task.planner.enabled = true;
                s.task.editActivityTaskQuery = "services/flow_task_service/getTask?name=daily_task&active=true&size=100&page=daily_edit&page-path=";
                s.task.plannerCalendar = $("#" + s.flow.getElementFlowId("plannerCal"));
                s.task.plannedActivities = [];
                s.task.unplannedActivities = [];
                s.task.tempActivity = {};
                s.task.view = "month";
                s.task.tag = 20;
                s.task.customer = {};
                s.task.customer.size = 25;
                s.$watch(function (scope) {
                    return scope.task.schoolYear
                }, function (schoolYear, oldSchoolYear) {
                    if (schoolYear !== undefined) {
                        var date = new Date(schoolYear.date);

                        s.task.plannerCalendar.fullCalendar("gotoDate", date);
                        s.task.plannerCalendar.fullCalendar("refetchEvents");
                        s.http.get(s.task.customerMarketQuery + "find_by_school_year?schoolYear=", s.task.schoolYear.id)
                            .success(function (customers) {
                                s.task.customers = customers;
                            })
                    }
                });
                s.$watch(function (scope) {
                    return scope.task.agent;
                }, function (agent, oldAgent) {
                    if (agent !== undefined) {
                        $("#" + s.flow.getElementFlowId('event_div') + " .event-customer").each(function () {

                            $(this).data("eventObject", {
                                title: $.trim($(this).text()),
                                editable: true
                            });

                            $(this).draggable({
                                zIndex: 99999,
                                revert: true,
                                revertDuration: 0
                            });

                        });
                    } else {
                        $("#" + s.flow.getElementFlowId('event_div') + " .event-customer").each(function () {

                            $(this).draggable("destroy");

                        });
                    }


                    s.task.plannerCalendar.fullCalendar("refetchEvents");

                });
                s.$on(s.flow.event.getSuccessEventId(), function (event, rv, method) {
                    if (method === "put") {
                        var plannerId = rv.id;
                        s.flow.action("post", s.task.activities, plannerId);
                    }
                    if (method === "post") {
                        s.task.activities = [];
                        s.task.plannerCalendar.fullCalendar("removeEvents");
                        s.task.plannerCalendar.fullCalendar("refetchEvents");
                    }
                });
                s.$on(s.flow.event.getRefreshId(), function () {
                    s.task.plannerCalendar.fullCalendar("refetchEvents");
                });
                s.flow.pageCallBack = function (page, data) {
                    if (page === s.task.home) {
                        s.task.calendar = {
                            header: {
                                left: "title",
                                center: "",
                                right: "month basicWeek today prev,next prevYear,nextYear"
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
                                    }

                                    if (s.task.agent !== undefined) {
                                        var date = $("#" + s.flow.getElementFlowId("plannerCal")).fullCalendar("getDate").toDate();

                                        var month = monthNames[date.getMonth()].toUpperCase();
                                        var view = s.task.plannerCalendar.fullCalendar("getView")
                                        var url = s.task.getPlannerQuery + "?schoolYear=" + s.task.schoolYear.id + "&agent=" + s.task.agent.id + "&year=" + date.getFullYear() + "&isWeek=" + (view.name === "basicWeek") + "&month=";

                                        s.http.get(url, month)
                                            .success(function (data) {
                                                s.task.planner = data;

                                                if (s.task.planner === "") {
                                                    s.task.planner = {};
                                                    s.task.planner.enabled = true;
                                                }
                                                if (s.task.view === s.task.basicWeek) {
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
                                                }
                                                /* if (s.task.planner.enabled) {
                                                 // $("button.fc-basicWeek-button").attr("style", "display:none");
                                                 t(function () {
                                                 s.task.plannerCalendar.fullCalendar("changeView", "month");
                                                 })
                                                 */
                                                else {
                                                    // $("button.fc-basicWeek-button").attr("style", "display:block");
                                                    if (s.task.view === s.task.month) {
                                                        $("#" + s.flow.getElementFlowId('event_body') + " .event-customer td a").each(function () {

                                                            $(this).removeClass("draggable").addClass("non-draggable");

                                                            if ($(this).draggable()) {
                                                                $(this).draggable("destroy");
                                                            }
                                                        });


                                                        $("#" + s.flow.getElementFlowId("other_activities") + " td div").each(function () {

                                                            if ($(this).draggable()) {
                                                                $(this).draggable("destroy");
                                                            }
                                                        });
                                                    }
                                                }
                                            })
                                            .error(function (data) {
                                                console.log("error");
                                                console.log(data);
                                            });


                                    }
                                    /* else {
                                     if (s.task.planner.enabled === true) {
                                     $("button.fc-basicWeek-button").attr("style", "display:none");
                                     } else if (s.task.planner.enabled === false) {
                                     $("button.fc-basicWeek-button").attr("style", "display:block");
                                     }
                                     }*/

                                    return data;
                                },
                                url: s.flow.getHomeUrl(),
                                type: "GET",
                                data: function () {
                                    return {
                                        schoolYear: s.task.schoolYear !== undefined ? s.task.schoolYear.id : undefined,
                                        agent: s.task.agent !== undefined ? s.task.agent.id : undefined
                                    };
                                }
                            },
                            dayClick: function (date, jsEvent, view) {
                                s.task.dayDate = date.toDate();
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
                                } else {
                                    element.addClass("hide-event");
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
                            editable: s.task.planner.enabled,
                            droppable: true,
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
                                    copiedEventObject.title = customer.customerName + " - " + customer.marketPotentialSegment;
                                    activity.customerMarketId = customer.id;
                                    activity.description = customer.customerName + " - " + customer.marketPotentialSegment;

                                    copiedEventObject.id = "event_id_" + s.flow.getElementFlowId(activity.customerMarketId) + "_" + date.toDate().getTime();
                                } else {
                                    activity.customerMarketId = 0;
                                    copiedEventObject.id = "event_id_" + s.flow.getElementFlowId(type) + "_" + date.toDate().getTime();
                                }

                                activity.schoolYear = s.task.schoolYear.id;

                                if (s.task.planner.enabled === false && s.task.view === s.task.basicWeek) {
                                    activity.planned = false;
                                    copiedEventObject.color = "#639F89";
                                } else {
                                    activity.planned = true;
                                    copiedEventObject.color = "#468499"
                                }

                                copiedEventObject.start = date;
                                copiedEventObject.editable = true;
                                copiedEventObject.activity = activity;
                                copiedEventObject.durationEditable = false;


                                var evt = s.task.plannerCalendar.fullCalendar("clientEvents", copiedEventObject.id);

                                if (evt.length === 0) {
                                    if (isDayEnabled(date.toDate(), currentDate.toDate())) {
                                        s.task.plannerCalendar.fullCalendar("renderEvent", copiedEventObject, true);
                                    }

                                } else {

                                    if (customer) {
                                        s.flow.message.danger("Customer " + customer.customerName + " is already set for " + date.toDate());
                                    }
                                }

                            },
                            viewRender: function (view, element) {
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

                                //var weekOfMonth = getWeekOfMonth(dayDate);

                                //var weekRow = $("table .fc-week-number span:eq('"+weekOfMonth+"')");

                                if (isDayEnabled(dayDate, currentDate)) {
                                    cell.addClass("enabled-day");
                                    cellValueElement.addClass("enabled-day");
                                } else {
                                    cell.addClass("disabled-day");
                                    cellValueElement.addClass("disabled-day");
                                }

                            }

                        };
                        s.task.plannerCalendar.fullCalendar(s.task.calendar);
                        s.task.plannerCalendar.fullCalendar("render");
                    }
                }

            }

            s.clearEvents = function () {
                s.task.plannerCalendar.fullCalendar("removeEvents");
            }

            s.valid = function () {
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

            s.submit = function () {
                if (s.valid()) {

                    var planner = {};
                    planner.schoolYear = s.task.schoolYear.id;
                    planner.agentId = s.task.agent.id;

                    //getActivities
                    var events = s.task.plannerCalendar.fullCalendar("clientEvents");
                    var date = s.task.plannerCalendar.fullCalendar("getDate").toDate();
                    planner.month = monthNames[date.getMonth()].toUpperCase();
                    planner.year = date.getFullYear();
                    var targetCount = 0;
                    for (var i = 0; i < events.length; i++) {
                        if (events[i].editable === true && events[i].activity.planned === true) {
                            s.task.activities.push(events[i].activity);
                            events[i].activity.agentId = s.task.agent.id;
                            if (events[i].activity.type === SCHOOL) {
                                targetCount++;
                            }
                        }
                    }

                    planner.target = targetCount

                    if (s.task.planner.enabled) {
                        s.flow.action("put", planner);
                    }
                }
            }

            s.update = function () {
                if (s.task.planner.enabled == false && s.task.planner.id) {
                    var events = s.task.plannerCalendar.fullCalendar("clientEvents")
                    console.log(events);
                    for (var i = 0; i < events.length; i++) {
                        if (events[i].editable === true && events[i].activity.planned === false) {
                            events[i].activity.agentId = s.task.agent.id;
                            s.task.activities.push(events[i].activity);
                        }
                    }
                    if (s.task.activities.length > 0) {
                        s.flow.action("post", s.task.activities, s.task.planner.id);
                    }
                    else {
                        s.flow.message.danger("No activities to save.");
                    }

                }

            }

            s.closeModalActivity = function () {
                fm.hide(s.task.activityModalId);
            }

            s.updateModalActivity = function () {
                if (!angular.equals(s.task.currentActivity, s.task.tempActivity)) {
                    if (s.task.currentActivity.type === SCHOOL) {
                        s.http.put(s.task.saveActivityCrud, s.task.currentActivity, s.task.currentActivity.id)
                            .success(function (msg) {
                                fm.hide(s.task.activityModalId);
                            })
                            .error(function (msg) {
                                ms.warning(s.flow.getElementFlowId("activity_messages"), msg, 3000).open();
                            })
                    }
                    else if (s.task.currentActivity.type === LEAVE) {

                    }


                } else {
                    ms.warning(s.flow.getElementFlowId("activity_messages"), "No changes has been made.", 3000).open();
                }
            }

            s.monthNames = function (month) {
                return monthNames[month];
            }

            s.next = function () {
                s.task.currentActivityIndex++;
            }

            s.prev = function () {
                s.task.currentActivityIndex--;
            }

            s.getStart = function () {
                console.log(s.task.plannerCalendar.fullCalendar("getDate"));
                return s.task.plannerCalendar.fullCalendar("getDate");
            }


        }]);
