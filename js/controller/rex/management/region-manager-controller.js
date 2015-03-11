angular.module("regionManager", ["fluid", "ngResource", "datatables", "ngCookies", "flowServices"])
    .controller('regionManagerCtrl', ["$scope", "DTOptionsBuilder", "DTColumnBuilder", "flowMessageService",
        "flowModalService", "$compile", "$filter", "$cookies", "userProfile", "imageService", function (s, dto, dtc, ms, fm, c, f, co, up, is) {
            s.task.preLoad = function () {
                s.task.home_page = "region_manager_home";
                s.task.home_url = "services/war/agent_light_query/find_managed_agents?manager=";
                s.task.view_top_url = "services/war/customer_tag_query/by_assigned_agents?agentId=";
                s.task.rsm = {};
                s.imageService = is;
                s.flow.onRefreshed = function () {
                    if (s.task.page.name === s.task.home_page) {
                        s.http.get(s.task.home_url, up.agent.id)
                            .success(function (rsm) {
                                s.task.rsm = rsm;
                            });
                    }
                }
            };


            s.openTagEditor = function (agent) {
                agent.viewTop = false;
                s.task.tagEditorAgent = agent;
                s.flow.action("post", undefined, agent.id);
            }

            s.closeTagEditor = function () {
                fm.hide(s.flow.getElementFlowId("tagEditorModal"));
            }

            s.checkIfAdded = function (customer) {
                var $customer = {valid: true};

                angular.forEach(s.task.tagEditorAgent.topCustomers, function (cust, index) {
                    if (cust.customerId === customer.id) {
                        this.valid = false;
                    }
                }, $customer);


                return $customer.valid;
            }

            s.swap = function ($index, $next) {
                console.info("swap", $index + " - " + $next);
                var t = s.task.tagEditorAgent.topCustomers[$index];
                var nextIndex = $index + 1;
                var sourceIndex = $next + 1;
                s.task.tagEditorAgent.topCustomers[$next].index = nextIndex;
                t.index = sourceIndex;

                s.task.tagEditorAgent.topCustomers[$index] = s.task.tagEditorAgent.topCustomers[$next];

                s.task.tagEditorAgent.topCustomers[$next] = t;

            }

            s.saveTopSchool = function (agent) {

                var topCustomers = agent.topCustomers;

                if (topCustomers) {
                    s.flow.action("put", topCustomers, agent.id);
                }

            }

            s.removeTopSchool = function ($index, agent) {
                if ($index < agent.topCustomers.length) {
                    agent.topCustomers.splice($index, 1);
                }

                for (var i = 1; i <= agent.topCustomers.length; i++) {
                    agent.topCustomers[(i - 1)].index = i;
                }

            }

            s.viewTopSchools = function (agent) {
                if (agent.viewTop) {
                    agent.viewTop = false;
                } else {
                    agent.loading = true;
                    s.http.post(s.task.view_top_url, undefined, agent.id)
                        .success(function (data) {
                            agent.topCustomers = data;
                        }).then(function () {
                            agent.viewTop = true;
                            agent.loading = false;
                        })
                }


            }

            s.addToTop = function (customer) {
                var $customer = {valid: true};

                angular.forEach(s.task.tagEditorAgent.topCustomers, function (cust, index) {
                    if (cust.customerId === customer.id) {
                        this.valid = false;
                    }
                }, $customer);

                if ($customer.valid) {
                    var customerTag = {};
                    customerTag.agentId = s.task.tagEditorAgent.id;
                    customerTag.customerId = customer.id;
                    customerTag.regionCode = s.task.tagEditorAgent.region;
                    customerTag.marketDescription = customer.marketDetail;
                    customerTag.customerName = customer.school.name;
                    s.task.tagEditorAgent.topCustomers.push(customerTag);
                    customerTag.index = s.task.tagEditorAgent.topCustomers.length;
                }


            }

            s.$on(s.flow.event.getSuccessEventId(), function (event, data, method) {

                if (method === "post") {
                    s.task.tagEditorAgent.customers = data;
                    s.http.post(s.task.view_top_url, undefined, s.task.tagEditorAgent.id)
                        .success(function (data) {
                            s.task.tagEditorAgent.topCustomers = data;
                        })
                        .then(function () {
                            fm.show(s.flow.getElementFlowId("tagEditorModal"));
                        })

                } else if (method === "put") {
                    fm.hide(s.flow.getElementFlowId("tagEditorModal"));
                }


            });

            s.task.page.load = function () {
                if (this.name === s.task.home_page) {
                    s.http.get(s.task.home_url, up.agent.id)
                        .success(function (rsm) {
                            s.task.rsm = rsm;
                        });
                }
            }

        }]);