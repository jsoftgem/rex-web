angular.module("customerController", ["fluid", "ngResource", "datatables"])
    .controller("customerCtrl", ["$scope", "DTOptionsBuilder", "DTColumnBuilder", "flowMessageService", "flowModalService", "$compile", "$filter", "sessionService", function (s, dto, dtc, ms, fm, c, f, ss) {

        s.deleleModalId = "customerDeleteModal";
        s.create_name = "customer_create";
        s.edit_name = "customer_edit";
        s.home = "customer";
        s.submit_button = "customer_submit";
        s.getPositionName = "services/war/position_query/position_name?id=";

        s.task.contactTemp = {};
        s.task.levelTemp = {};
        s.task.publisherTemp = {};
        s.task.supportTemp = {};
        s.task.potentialTemp = {};
        s.task.tempSchoolYear = {};
        var create = new CreateControl();
        create.id = "customer_create_ctl";

        create.action = function () {
            s.flow.goTo(s.create_name);
        }
        create.pages = s.home;

        var save = new SaveControl();
        save.id = "customer_save_ctl";
        save.action = function () {
            $("#" + s.flow.getElementFlowId(s.submit_button)).trigger("click");
        }
        save.pages = [s.edit_name, s.create_name];
        var delCtl = new DeleteControl();
        delCtl.id = "customer_del_ctl";
        delCtl.action = function () {
            fm.show(s.flow.getElementFlowId(s.deleleModalId));
        }
        delCtl.pages = s.edit_name;

        s.flow.controls = [create, save, delCtl];

        s.dtOptions = new FlowOptionsGET(dto, s.flow.getHomeUrl(), s, c, ss);
        s.dtColumns = FlowColumns(dtc);

        s.dtColumns.push(dtc.newColumn("customerCode").withTitle("Customer code").withOption("searchable", true));
        s.dtColumns.push(dtc.newColumn("school.name").withTitle("Name").withOption("searchable", true));

        s.edit = function (id) {
            s.flow.goTo(s.edit_name, id);
        }

        s.delete = function (id) {
            fm.show(s.flow.getElementFlowId(s.deleleModalId));
            s.http.get("services/war/customer_query/getInstance/", id).success(function (data) {
                s.task.customerEdit = data;
            });
        }

        s.save = function () {
            if (s.task.page.name === s.edit_name) {
                if (!angular.equals(s.task.customerEdit, s.task.tempEdit)) {
                    s.flow.action("put", s.task.customerEdit, s.task.customerEdit.id);
                } else {
                    s.flow.message.info(UI_MESSAGE_NO_CHANGE);
                }
            } else if (s.task.page.name === s.create_name) {
                s.flow.action("put", s.task.customerCreate);
            }
        }


        s.$on(s.flow.event.getSuccessEventId(), function (event, data, method) {

            if (method === "put") {
                if (s.task.page.name === s.edit_name) {
                    s.task.customerEdit = {};
                    angular.copy(s.task.customerEdit, s.task.tempEdit);
                    console.info("customer-success-origin", s.task.origin);
                    if (!s.task.origin) {
                        s.flow.goToHome();
                    } else {
                        s.task.close();
                        s.flow.navToTask(s.task.origin);
                    }
                } else if (s.task.page.name === s.create_name) {
                    s.task.customerCreate = {};
                    s.flow.goToHome();
                }
            }

        });


        s.$on(s.flow.event.getRefreshId(), function () {
            s.dtOptions.reloadData();
        });


        s.flow.onPageChanging = function (page, param) {

            if (s.task.create_name === page) {
                s.task.customerCreate = {};
                s.task.school = {};
            }
            else if (s.task.edit_name === page) {
                s.task.customerEdit = {};
                s.task.tempEdit = {};
            }
            return true;
        }
        s.flow.pageCallBack = function (page, data, source) {
            if (s.edit_name === page) {
                if (!s.task.customerEdit.id || source === "refresh") {
                    if (s.task.origin) {
                        s.task.tempEdit = {};
                    }
                    s.task.customerEdit = data;
                    angular.copy(s.task.customerEdit, s.task.tempEdit);
                    if (s.task.customerEdit.evaluationTo) {
                        s.task.isEditEvaluationTo = true;
                    }

                    if (s.task.customerEdit.orderingTo) {
                        s.task.isEditOrderingTo = true;
                    }

                    if (s.task.customerEdit.deliveryTo) {
                        s.task.isEditDeliveryTo = true;
                    }

                    if (s.task.customerEdit.collectionTo) {
                        s.task.isEditCollectionTo = true;
                    }


                }


            } else if (s.home === page) {
                s.dtOptions.reloadData();
            } else if (page === s.create_name) {
                if (s.task.currentPage === s.create_name) {
                    s.task.customerCreate = {};
                    s.task.school = {};
                }

            }


        };

        s.task.page.load = function(data){
            if (s.edit_name === this.name) {
                if (!s.task.customerEdit.id || source === "refresh") {
                    if (s.task.origin) {
                        s.task.tempEdit = {};
                    }
                    s.task.customerEdit = data;
                    angular.copy(s.task.customerEdit, s.task.tempEdit);
                    if (s.task.customerEdit.evaluationTo) {
                        s.task.isEditEvaluationTo = true;
                    }

                    if (s.task.customerEdit.orderingTo) {
                        s.task.isEditOrderingTo = true;
                    }

                    if (s.task.customerEdit.deliveryTo) {
                        s.task.isEditDeliveryTo = true;
                    }

                    if (s.task.customerEdit.collectionTo) {
                        s.task.isEditCollectionTo = true;
                    }


                }


            }
        }

        s.deleteConfirm = function () {
            s.flow.action("delete", s.task.customerEdit, s.task.customerEdit.id);
            fm.hide(s.flow.getElementFlowId("customerDeleteModal"));
            if (s.task.page.name !== s.home) {
                s.flow.goToHome();
            }
            s.dtOptions.reloadData();
        };

        s.deleteCancel = function () {
            fm.hide(s.flow.getElementFlowId("customerDeleteModal"));
        };


        s.$on(s.flow.getEventId("createContactEvent"), function (event) {
            s.task.contact = {};
            s.task.contactManaged = false;
            if (s.task.page.name === s.create_name) {
                if (s.task.customerCreate.contactDetails === undefined) {
                    s.task.customerCreate.contactDetails = [];
                }
                s.task.customerCreate.contactDetails.push(s.task.contact);
                s.task.contactIndex = s.task.customerCreate.contactDetails.length - 1;
            } else if (s.task.page.name === s.edit_name) {
                if (s.task.customerEdit.contactDetails === undefined) {
                    s.task.customerEdit.contactDetails = [];
                }
                s.task.customerEdit.contactDetails.push(s.task.contact);
                s.task.contactIndex = s.task.customerEdit.contactDetails.length - 1;
            }

            fm.show(s.flow.getElementFlowId("contactsModal"));
        });

        s.$on(s.flow.getEventId("editContactEvent"),
            function (event, id, index) {
                if (s.task.page.name === s.create_name) {
                    angular.copy(s.task.customerCreate.contactDetails[index], s.task.contactTemp);
                } else if (s.task.page.name === s.edit_name) {
                    angular.copy(s.task.customerEdit.contactDetails[index], s.task.contactTemp);
                }
                s.task.contactManaged = true;
                s.task.contactIndex = index;
                fm.show(s.flow.getElementFlowId("contactsModal"));
            });

        s.closeContactModal = function () {
            if (s.task.contactManaged === false) {
                if (s.task.page.name === s.create_name) {
                    s.task.customerCreate.contactDetails.splice(s.task.contactIndex, 1);
                } else if (s.task.page.name === s.edit_name) {
                    s.task.customerEdit.contactDetails.splice(s.task.contactIndex, 1);
                }
            } else if (s.task.contactManaged === true) {
                if (s.task.page.name === s.create_name) {
                    s.task.customerCreate.contactDetails[s.task.contactIndex] = s.task.contactTemp;
                } else if (s.task.page.name === s.edit_name) {
                    s.task.customerEdit.contactDetails[s.task.contactIndex] = s.task.contactTemp;
                }
                s.task.contactTemp = {};
                s.task.contactIndex = 0;
                s.task.contactManaged = false;
            }

            fm.hide(s.flow.getElementFlowId("contactsModal"), s.flow.getElementFlowId('contactDetailsSubTable'));
        }
        s.saveContactModal = function () {
            var valid = true;

            var contact = undefined;

            if (s.task.page.name === s.create_name) {
                contact = s.task.customerCreate.contactDetails[s.task.contactIndex];

            } else if (s.task.page.name === s.edit_name) {
                contact = s.task.customerEdit.contactDetails[s.task.contactIndex];
            }

            if (contact.level === undefined) {
                valid = false;
                s.flow.message.danger("Education level is required.");
            }


            if (contact.description === undefined) {
                valid = false;
                s.flow.message.danger("Contact person is required.");
            }

            if (contact.position) {
                s.http.get("services/war/position_query/getInstance/", contact.position)
                    .success(function (data) {
                        if (s.task.page.name === s.create_name) {
                            s.task.customerCreate.contactDetails[s.task.contactIndex].positionDesc = data.description;
                        } else if (s.task.page.name === s.edit_name) {
                            s.task.customerEdit.contactDetails[s.task.contactIndex].positionDesc = data.description;
                        }
                    });
            } else {
                valid = false;
                s.flow.message.danger("Position is required.");
            }

            if (valid === true) {
                fm.hide(s.flow.getElementFlowId("contactsModal"), s.flow.getElementFlowId('contactDetailsSubTable'));
            }
        }

        s.$on(s.flow.getEventId("createLevelEvent"), function () {
            s.task.level = {};
            s.task.levelManaged = false;
            if (s.task.page.name === s.create_name) {
                if (s.task.customerCreate.customerLevels === undefined) {
                    s.task.customerCreate.customerLevels = [];
                }
                s.task.customerCreate.customerLevels.push(s.task.level);
                s.task.levelIndex = s.task.customerCreate.customerLevels.length - 1;
            } else if (s.task.page.name === s.edit_name) {
                if (s.task.customerEdit.customerLevels === undefined) {
                    s.task.customerEdit.customerLevels = [];
                }
                s.task.customerEdit.customerLevels.push(s.task.level);
                s.task.levelIndex = s.task.customerEdit.customerLevels.length - 1;
            }

            fm.show(s.flow.getElementFlowId("levelModal"));
        });


        s.$on(s.flow.getEventId("editLevelEvent"),
            function (event, id, index) {
                if (s.task.page.name === s.create_name) {
                    angular.copy(s.task.customerCreate.customerLevels[index], s.task.levelTemp);
                } else if (s.task.page.name === s.edit_name) {
                    angular.copy(s.task.customerEdit.customerLevels[index], s.task.levelTemp);
                }
                s.task.levelManaged = true;
                s.task.levelIndex = index;
                fm.show(s.flow.getElementFlowId("levelModal"));
            });

        s.closeLevelModal = function () {
            if (s.task.levelManaged === false) {
                if (s.task.page.name === s.create_name) {
                    s.task.customerCreate.customerLevels.splice(s.task.levelIndex, 1);
                } else if (s.task.page.name === s.edit_name) {
                    s.task.customerEdit.customerLevels.splice(s.task.levelIndex, 1);
                }
            } else if (s.task.levelManaged === true) {
                if (s.task.page.name === s.create_name) {
                    s.task.customerCreate.customerLevels[s.task.levelIndex] = s.task.levelTemp;
                } else if (s.task.page.name === s.edit_name) {
                    s.task.customerEdit.customerLevels[s.task.levelIndex] = s.task.levelTemp;
                }
                s.task.levelTemp = {};
                s.task.levelIndex = 0;
                s.task.levelManaged = false;
            }

            fm.hide(s.flow.getElementFlowId("levelModal"), s.flow.getElementFlowId('customerLevelsSubTable'));
        }

        s.saveLevelModal = function () {

            var customerLevel = undefined;

            if (s.task.page.name === s.create_name) {
                customerLevel = s.task.customerCreate.customerLevels[s.task.levelIndex];
            } else if (s.task.page.name === s.edit_name) {
                customerLevel = s.task.customerEdit.customerLevels[s.task.levelIndex];
            }

            var valid = true;

            if (customerLevel.level) {
                s.http.get("services/war/level_query/getInstance/", customerLevel.level).success(function (data) {
                    if (s.task.page.name === s.create_name) {
                        s.task.customerCreate.customerLevels[s.task.levelIndex].educationLevel = data.description;
                        s.task.customerCreate.customerLevels[s.task.levelIndex].levelCourse = data.levelCourse;
                    } else if (s.task.page.name === s.edit_name) {
                        s.task.customerEdit.customerLevels[s.task.levelIndex].educationLevel = data.description;
                        s.task.customerEdit.customerLevels[s.task.levelIndex].levelCourse = data.levelCourse;
                    }
                });
            } else {
                valid = false;
                s.flow.message.danger("Level is required");
            }

            if (valid) {
                fm.hide(s.flow.getElementFlowId("levelModal"), s.flow.getElementFlowId('customerLevelsSubTable'));
            }
        }

        s.$on(s.flow.getEventId("createPublisherEvent"), function () {
            s.task.publisher = {};
            s.task.publisherManaged = false;
            if (s.task.page.name === s.create_name) {
                if (s.task.customerCreate.publisher === undefined) {
                    s.task.customerCreate.publisher = [];
                }
                s.task.customerCreate.publisher.push(s.task.publisher);
                s.task.publisherIndex = s.task.customerCreate.publisher.length - 1;
            } else if (s.task.page.name === s.edit_name) {
                if (s.task.customerEdit.publisher === undefined) {
                    s.task.customerEdit.publisher = [];
                }
                s.task.customerEdit.publisher.push(s.task.publisher);
                s.task.publisherIndex = s.task.customerEdit.publisher.length - 1;
            }

            fm.show(s.flow.getElementFlowId("publisherModal"));
        });


        s.$on(s.flow.getEventId("editPublisherEvent"),
            function (event, id, index) {
                if (s.task.page.name === s.create_name) {
                    angular.copy(s.task.customerCreate.publisher[index], s.task.publisherTemp);
                } else if (s.task.page.name === s.edit_name) {
                    angular.copy(s.task.customerEdit.publisher[index], s.task.publisherTemp);
                }
                s.task.publisherManaged = true;
                s.task.publisherIndex = index;
                fm.show(s.flow.getElementFlowId("publisherModal"));
            });


        s.closePublisherModal = function () {
            if (s.task.publisherManaged === false) {
                if (s.task.page.name === s.create_name) {
                    s.task.customerCreate.publisher.splice(s.task.publisherIndex, 1);
                } else if (s.task.page.name === s.edit_name) {
                    s.task.customerEdit.publisher.splice(s.task.publisherIndex, 1);
                }
            } else if (s.task.publisherManaged === true) {
                if (s.task.page.name === s.create_name) {
                    s.task.customerCreate.publisher[s.task.publisherIndex] = s.task.publisherTemp;
                } else if (s.task.page.name === s.edit_name) {
                    s.task.customerEdit.publisher[s.task.publisherIndex] = s.task.publisherTemp;
                }
                s.task.publisherTemp = {};
                s.task.publisherIndex = 0;
                s.task.publisherManaged = false;
            }

            fm.hide(s.flow.getElementFlowId("publisherModal"), s.flow.getElementFlowId('customerPublisherSubTable'));
        }
        s.savePublisherModal = function () {
            fm.hide(s.flow.getElementFlowId("publisherModal"), s.flow.getElementFlowId('customerPublisherSubTable'));
        }

        s.$on(s.flow.getEventId("createSupportEvent"), function () {
            s.task.support = {};
            s.task.supportManaged = false;
            if (s.task.page.name === s.create_name) {
                if (s.task.customerCreate.supportGivens === undefined) {
                    s.task.customerCreate.supportGivens = [];
                }
                s.task.customerCreate.supportGivens.push(s.task.support);
                s.task.supportIndex = s.task.customerCreate.supportGivens.length - 1;
            } else if (s.task.page.name === s.edit_name) {
                if (s.task.customerEdit.supportGivens === undefined) {
                    s.task.customerEdit.supportGivens = [];
                }
                s.task.customerEdit.supportGivens.push(s.task.support);
                s.task.supportIndex = s.task.customerEdit.supportGivens.length - 1;
            }

            fm.show(s.flow.getElementFlowId("supportModal"));
        });


        s.$on(s.flow.getEventId("editSupportEvent"),
            function (event, id, index) {
                if (s.task.page.name === s.create_name) {
                    angular.copy(s.task.customerCreate.supportGivens[index], s.task.supportTemp);
                } else if (s.task.page.name === s.edit_name) {
                    angular.copy(s.task.customerEdit.supportGivens[index], s.task.supportTemp);
                }
                s.task.supportManaged = true;
                s.task.supportIndex = index;
                fm.show(s.flow.getElementFlowId("supportModal"));
            });


        s.closeSupportModal = function () {
            if (s.task.supportManaged === false) {
                if (s.task.page.name === s.create_name) {
                    s.task.customerCreate.supportGivens.splice(s.task.supportIndex, 1);
                } else if (s.task.page.name === s.edit_name) {
                    s.task.customerEdit.supportGivens.splice(s.task.supportIndex, 1);
                }
            } else if (s.task.supportManaged === true) {
                if (s.task.page.name === s.create_name) {
                    s.task.customerCreate.supportGivens[s.task.supportIndex] = s.task.supportTemp;
                } else if (s.task.page.name === s.edit_name) {
                    s.task.customerEdit.supportGivens[s.task.supportIndex] = s.task.supportTemp;
                }
                s.task.supportTemp = {};
                s.task.supportIndex = 0;
                s.task.supportManaged = false;
            }

            fm.hide(s.flow.getElementFlowId("supportModal"), s.flow.getElementFlowId('customerSupportSubTable'));
        }

        s.saveSupportModal = function () {
            fm.hide(s.flow.getElementFlowId("supportModal"), s.flow.getElementFlowId('customerSupportSubTable'));
        }


        s.$on(s.flow.getEventId("addPotential"), function (event) {

            s.task.potential = {};
            s.task.potentialManaged = false;

            if (s.task.page.name === s.create_name) {

                if (s.task.customerCreate.warCustomerMarketSchoolYears === undefined) {
                    s.task.customerCreate.warCustomerMarketSchoolYears = [];
                }

                s.task.customerCreate.warCustomerMarketSchoolYears.push(s.task.potential);
                s.task.potentialIndex = s.task.customerCreate.warCustomerMarketSchoolYears.length - 1;
            } else if (s.task.page.name === s.edit_name) {
                if (s.task.customerEdit.warCustomerMarketSchoolYears === undefined) {
                    s.task.customerEdit.warCustomerMarketSchoolYears = [];
                }
                s.task.customerEdit.warCustomerMarketSchoolYears.push(s.task.potential);
                s.task.potentialIndex = s.task.customerEdit.warCustomerMarketSchoolYears.length - 1;
            }

            s.onChangeSchoolYear = function (item) {
                if (s.task.page.name === s.create_name) {
                    s.task.customerCreate.warCustomerMarketSchoolYears[s.task.potentialIndex].schoolYearDescription = item.description;
                    s.task.customerCreate.warCustomerMarketSchoolYears[s.task.potentialIndex].schoolYear = item.id;
                } else if (s.task.page.name === s.edit_name) {
                    s.task.customerEdit.warCustomerMarketSchoolYears[s.task.potentialIndex].schoolYearDescription = item.description;
                    s.task.customerEdit.warCustomerMarketSchoolYears[s.task.potentialIndex].schoolYear = item.id;
                }

            }

            fm.show(s.flow.getElementFlowId("potentialModal"));
        });


        s.$on(s.flow.getEventId("editPotential"), function (event, id, index) {

            if (s.task.page.name === s.create_name) {
                angular.copy(s.task.customerCreate.warCustomerMarketSchoolYears[index], s.task.potentialTemp);
                s.task.tempSchoolYear = {
                    description: s.task.customerCreate.warCustomerMarketSchoolYears[index].schoolYearDescription,
                    id: s.task.customerCreate.warCustomerMarketSchoolYears[index].schoolYear
                };
            } else if (s.task.page.name === s.edit_name) {
                angular.copy(s.task.customerEdit.warCustomerMarketSchoolYears[index], s.task.potentialTemp);
                s.task.tempSchoolYear = {
                    description: s.task.customerEdit.warCustomerMarketSchoolYears[index].schoolYearDescription,
                    id: s.task.customerEdit.warCustomerMarketSchoolYears[index].schoolYear
                };
            }
            s.task.potentialManaged = true;
            s.task.potentialIndex = index;
            fm.show(s.flow.getElementFlowId("potentialModal"));
        });


        s.processOptions = [{label: 'Centralized', value: 'CENTRALIZED'}, {
            label: 'De-centralized',
            value: 'DECENTRALIZED'

        }];

        s.natureOfPurchaseOptions = [{label: 'Outright', value: "OUTRIGHT"}, {label: "Rental", value: "RENTAL"}];

        s.ownershipOptions = [{label: "Public", value: "PUBLIC"}, {label: "Private", value: "PRIVATE"}];


        s.$watch(function (scope) {
            if (!scope.task.edit) return;
            return scope.task.edit.agent;
        }, function (newValue, oldValue) {
            if (newValue) {
                s.task.customerEdit.ownerAgentId = newValue.id;
                s.task.customerEdit.regionCode = newValue.region;
            }
        });


        s.$watch(function (scope) {
            if (!scope.task.create)return;
            return scope.task.create.agent;
        }, function (newValue, oldValue) {
            if (newValue) {
                s.task.customerCreate.ownerAgentId = newValue.id;
                s.task.customerCreate.regionCode = newValue.region;
            }
        });


        s.validPotential = function (warCustomerMarketSchoolYear) {
            var valid = true;

            if (!s.task.potentialManaged) {
                if (!warCustomerMarketSchoolYear.schoolYear) {
                    ms.danger(s.flow.getElementFlowId('potentialInfoMessage'), "Please select a school year.", 3000).open();
                    valid = false;
                }

                if (!warCustomerMarketSchoolYear.marketPotential) {
                    ms.danger(s.flow.getElementFlowId('potentialInfoMessage'), "Please input a market potential.", 3000).open();
                    valid = false;
                }
            } else {
                if (!warCustomerMarketSchoolYear.marketPotential) {
                    ms.danger(s.flow.getElementFlowId('potentialInfoMessage'), "Please input a market potential.", 3000).open();
                    valid = false;
                }
            }

            return valid;

        }

        s.savePotential = function () {
            var wcmsy = undefined;

            if (s.task.page.name === s.create_name) {
                wcmsy = s.task.customerCreate.warCustomerMarketSchoolYears[s.task.potentialIndex];
            }
            else if (s.task.page.name === s.edit_name) {
                wcmsy = s.task.customerEdit.warCustomerMarketSchoolYears[s.task.potentialIndex];
            }

            var valid = s.validPotential(wcmsy);

            console.info("valid", valid);

            if (valid) {
                console.info("wcmsy", wcmsy);
                wcmsy.marketPotentialSegment = getMarketSegment(wcmsy.marketPotential);
                fm.hide(s.flow.getElementFlowId('potentialModal'));
            }
        }


        s.cancelPotential = function () {
            if (!s.task.potentialManaged) {
                if (s.task.page.name === s.create_name) {
                    s.task.customerCreate.warCustomerMarketSchoolYears.splice(s.task.potentialIndex, 1);
                }
                else if (s.task.page.name === s.edit_name) {
                    s.task.customerEdit.warCustomerMarketSchoolYears.splice(s.task.potentialIndex, 1);
                }
            } else {
                if (s.task.page.name === s.create_name) {
                    console.log(s.task.potentialTemp);
                    s.task.customerCreate.warCustomerMarketSchoolYears[s.task.potentialIndex] = s.task.potentialTemp;
                }
                else if (s.task.page.name === s.edit_name) {
                    s.task.customerEdit.warCustomerMarketSchoolYears[s.task.potentialIndex] = s.task.potentialTemp;
                }
            }
            fm.hide(s.flow.getElementFlowId('potentialModal'));
        }


    }])
    .filter("position", ["flowHttpService", function (f) {

        return function (input) {
            if (input) {
                return f.getGlobal(s.getPositionName + input, false).success(function (data) {
                    console.log(data);
                    return data;
                }).error(function () {
                    return "none"
                })
                return "none";
            } else {
                return "none";
            }

        };
    }])
    .filter("decision", [function () {
        return function (input) {
            if (input) {
                return input ? "yes" : "no";
            }
            return "no";
        }
    }]);