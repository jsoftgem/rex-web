angular.module("schoolYearController", ["fluid", "ngResource", "datatables"])
    .controller("schoolYearCtrl", ["$scope", "DTOptionsBuilder", "DTColumnBuilder", "flowMessageService", "flowModalService", "$compile", "$filter", "sessionService",
        function (s, dto, dtc, ms, fm, c, f, ss) {


            s.task.deleleModalId = "schoolYearDeleteModal";
            s.task.create_name = "school_year_create";
            s.task.edit_name = "school_year_edit";
            s.task.home = "school_year";
            s.task.submit_button = "school_year_submit";
            s.task.create_ctl_id = "school_year_create_ctl";
            s.task.save_ctl_id = "school_year_save_ctl";
            s.task.del_ctl_id = "school_year_del_ctl";
            s.task.getInstanceQuery = "services/war/school_year_query/getInstance/";

            s.flow.controls = [new CreateControl(), new SaveControl(), new DeleteControl()];
            s.flow.controls[0].id = s.task.create_ctl_id;
            s.flow.controls[0].action = function () {
                s.task.modelCreate = {};
                s.flow.goTo(s.task.create_name);
            }
            s.flow.controls[0].pages = s.task.home;
            s.flow.controls[1].id = s.task.save_ctl_id;
            s.flow.controls[1].action = function () {
                $("#" + s.flow.getElementFlowId(s.task.submit_button)).trigger("click");
            }
            s.flow.controls[1].pages = [s.task.create_name, s.task.edit_name];

            s.flow.controls[2].id = s.task.del_ctl_id;
            s.flow.controls[2].action = function () {
                fm.show(s.flow.getElementFlowId(s.task.deleleModalId));
            }
            s.flow.controls[2].pages = [s.task.edit_name];

            s.task.edit = function (id) {
                s.task.modelEdit = {};
                s.task.tempEdit = {};
                s.flow.goTo(s.task.edit_name, id);
            }

            s.task.delete = function (id) {
                fm.show(s.flow.getElementFlowId(s.task.deleleModalId));
                s.http.get(s.task.getInstanceQuery, id).success(function (data) {
                    s.task.modelEdit = data;
                });
            }


            s.$on(s.flow.event.getSuccessEventId(), function (event, data, method) {

                if (method === "put") {
                    if (s.task.page.name === s.task.edit_name) {
                        s.task.modelEdit = {};
                        angular.copy(s.task.modelEdit, s.task.tempEdit);
                        s.flow.goToHome();
                    } else if (s.task.page.name === s.task.create_name) {
                        s.task.modelCreate = {};
                        s.flow.goToHome();
                    }
                }
            });


            s.$on(s.flow.event.getRefreshId(), function () {
                s.dtOptions.reloadData();
            });


            s.flow.pageCallBack = function (page, data, source) {
                if (s.task.edit_name === page) {
                    if (!s.task.modelEdit.id || source === "refresh") {
                        s.task.modelEdit = data;
                        s.http.get("services/flow_user_query/getInstance/", s.task.modelEdit.createByUserId).success(function (data) {
                            s.task.edit.createUserFullName = data.flowUserDetail.fullName;
                        });
                        angular.copy(s.task.modelEdit, s.task.tempEdit);


                    }
                } else if (s.task.home === page) {
                    s.dtOptions.reloadData();
                }
            };


            s.task.deleteConfirm = function () {
                s.flow.action("delete", s.task.modelEdit, s.task.modelEdit.id);
                fm.hide(s.flow.getElementFlowId(s.task.deleleModalId));
                if (s.task.page.name !== s.home) {
                    s.flow.goToHome();
                }
                s.dtOptions.reloadData();
            };

            s.task.deleteCancel = function () {
                fm.hide(s.flow.getElementFlowId(s.task.deleleModalId));
            };

            s.dtOptions = new FlowOptionsGET(dto, s.flow.getHomeUrl(), s, c, ss);
            s.dtColumns = FlowColumns(dtc, "task.edit", "task.delete");
            s.dtColumns.push(dtc.newColumn("description").withTitle("School Year").withOption("searchable", true));

        }])
    .controller("schoolYearCreateCtrl", ["$scope", "flowMessageService", "flowModalService", "$compile", "$filter", "sessionService",
        function (s, ms, fm, c, f, ss) {

            s.task.create = {};

            s.save = function () {
                s.flow.action("put", s.task.modelCreate);
            };


            s.$watch(function (scope) {
                return scope.task.create.customerLookUp
            }, function (newValue, oldValue) {
                if (newValue === undefined) {
                    /*s.task.modelCreate.warCustomerMarkets[s.task.create.customerIndex].customerId = undefined;
                     s.task.modelCreate.warCustomerMarkets[s.task.create.customerIndex].customerCode = undefined;
                     s.task.modelCreate.warCustomerMarkets[s.task.create.customerIndex].customerName = undefined;*/
                } else {

                    s.task.modelCreate.warCustomerMarkets[s.task.create.customerIndex].customerId = newValue.id;
                    s.task.modelCreate.warCustomerMarkets[s.task.create.customerIndex].customerCode = newValue.customerCode;
                    s.task.modelCreate.warCustomerMarkets[s.task.create.customerIndex].customerName = newValue.school.name;
                }

            });

            s.$on(s.flow.getEventId("createCustomerEvent"), function (event) {
                if (s.task.modelCreate.warCustomerMarkets === undefined) {
                    s.task.modelCreate.warCustomerMarkets = [];
                }

                s.task.create.customerMarket = {};
                s.task.create.customerManaged = false;
                s.task.modelCreate.warCustomerMarkets.push(s.task.create.customerMarket);
                s.task.create.customerIndex = s.task.modelCreate.warCustomerMarkets.length - 1;

                fm.show(s.flow.getElementFlowId("customerModal"));
            })


            s.$on(s.flow.getEventId("editCustomerEvent"), function (event, id, index) {

                s.task.create.customerTemp = {};

                angular.copy(s.task.modelCreate.warCustomerMarkets[index], s.task.create.customerTemp);

                s.task.create.customerManaged = true;

                s.task.create.customerIndex = index;

                fm.show(s.flow.getElementFlowId("customerModal"));
            })


            s.add = function () {
                s.task.create.customerMarket = {};
                s.task.modelCreate.warCustomerMarkets.push(s.task.create.customerMarket);
                s.task.create.customerIndex = s.task.modelCreate.warCustomerMarkets.length - 1;
            }

            s.saveAndClose = function () {
                fm.hide(s.flow.getElementFlowId("customerModal"), s.flow.getElementFlowId('customerLookUp'));
            }

            s.cancel = function () {
                if (s.task.create.customerManaged === false) {
                    s.task.modelCreate.warCustomerMarkets.splice(s.task.create.customerIndex, 1);
                }
                else if (s.task.create.customerManaged) {
                    s.task.modelCreate.warCustomerMarkets[s.task.create.customerIndex] = s.task.create.customerTemp;
                }

                fm.hide(s.flow.getElementFlowId("customerModal"), s.flow.getElementFlowId('customerLookUp'));
            }


            s.$on(s.flow.event.getSuccessEventId(), function (event, data, method) {

                if (method === "put") {
                    if (s.task.page.name === s.task.create_name) {
                        s.task.modelCreate = {};
                        s.flow.goToHome();
                    }
                }
            });


            s.$watch(function (scope) {
                    return scope.task.modelCreate.warCustomerMarkets[s.task.create.customerIndex].marketPotential
                },
                function (newMarketPotential, oldMarketPotential) {

                    s.task.modelCreate.warCustomerMarkets[s.task.create.customerIndex].marketPotentialSegment = getMarketSegment(newMarketPotential);

                }
            );

        }])
    .controller("schoolYearEditCtrl", ["$scope", "flowMessageService", "flowModalService", "$compile", "$filter", "sessionService",
        function (s, ms, fm, c, f, ss) {

            s.save = function () {
                if (!angular.equals(s.task.modelEdit, s.task.tempEdit)) {
                    s.flow.action("put", s.task.modelEdit, s.task.modelEdit.id);
                } else {
                    s.flow.message.info(UI_MESSAGE_NO_CHANGE);
                }
            }

            s.$on(s.flow.getEventId("createCustomerEvent"), function (event) {
                fm.show(s.flow.getElementFlowId("customerModal"));
            })

            s.$on(s.flow.getEventId("editCustomerEvent"), function (event) {
                fm.show(s.flow.getElementFlowId("customerModal"));
            })


            s.add = function () {
                s.task.edit.customerMarket = {};
                s.task.modelEdit.warCustomerMarkets.push(s.task.edit.customerMarket);
                s.task.edit.customerIndex = s.task.modelEdit.warCustomerMarkets.length - 1;
            }

            s.saveAndClose = function () {
                fm.hide(s.flow.getElementFlowId("customerModal"), s.flow.getElementFlowId('customerLookUp'));
            }

            s.cancel = function () {
                if (s.task.edit.customerManaged === false) {
                    s.task.modelEdit.warCustomerMarkets.splice(s.task.edit.customerIndex, 1);
                }
                else if (s.task.edit.customerManaged) {
                    s.task.modelEdit.warCustomerMarkets[s.task.edit.customerIndex] = s.task.edit.customerTemp;
                }

                fm.hide(s.flow.getElementFlowId("customerModal"), s.flow.getElementFlowId('customerLookUp'));
            }


           /* s.$watch(function (scope) {
                return scope.task.edit.customerLookUp
            }, function (newValue, oldValue) {
                if (newValue === undefined) {
                    *//*s.task.modelCreate.warCustomerMarkets[s.task.create.customerIndex].customerId = undefined;
                     s.task.modelCreate.warCustomerMarkets[s.task.create.customerIndex].customerCode = undefined;
                     s.task.modelCreate.warCustomerMarkets[s.task.create.customerIndex].customerName = undefined;*//*
                } else {

                    s.task.modelEdit.warCustomerMarkets[s.task.edit.customerIndex].customerId = newValue.id;
                    s.task.modelEdit.warCustomerMarkets[s.task.edit.customerIndex].customerCode = newValue.customerCode;
                    s.task.modelEdit.warCustomerMarkets[s.task.edit.customerIndex].customerName = newValue.school.name;
                }

            });*/

            s.$on(s.flow.getEventId("createCustomerEvent"), function (event) {
                if (s.task.modelEdit.warCustomerMarkets === undefined) {
                    s.task.modelEdit.warCustomerMarkets = [];
                }

                s.task.edit.customerMarket = {};
                s.task.edit.customerManaged = false;
                s.task.modelEdit.warCustomerMarkets.push(s.task.edit.customerMarket);
                s.task.edit.customerIndex = s.task.modelEdit.warCustomerMarkets.length - 1;

                fm.show(s.flow.getElementFlowId("customerModal"));
            });


            s.$on(s.flow.getEventId("editCustomerEvent"), function (event, id, index) {

                s.task.edit.customerTemp = {};

                angular.copy(s.task.modelEdit.warCustomerMarkets[index], s.task.edit.customerTemp);

                s.task.edit.customerManaged = true;

                s.task.edit.customerIndex = index;

                fm.show(s.flow.getElementFlowId("customerModal"));
            });


            s.$on(s.flow.event.getSuccessEventId(), function (event, data, method) {
                if (method === "put") {
                    if (s.task.page.name === s.task.edit_name) {
                        s.task.modelEdit = {};
                        angular.copy(s.task.modelEdit, s.task.tempEdit);
                        s.flow.goToHome();
                    }
                }
            });

            s.$on(s.flow.getEventId("createMarketSegmentEvent"), function (event) {
                alert(event);
                fm.show(s.flow.getElementFlowId("marketSegmentModal"));
            });




        }]);


