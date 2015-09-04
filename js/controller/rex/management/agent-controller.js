angular.module("agentController",["fluid","ngResource","datatables","flowServices","angular.filter"]).controller("agentCtrl",["$scope","DTOptionsBuilder","DTColumnBuilder","flowMessageService","flowModalService","$compile","$filter","sessionService",function(s,dto,dtc,ms,fm,c,f,ss){s.editPassword=!1;var create=new CreateControl;create.id="agent_create_ctl",create.action=function(){s.flow.goTo("agent_create")};var save=new SaveControl;save.id="agent_edit_ctl",save.action=function(){$("#"+s.flow.getElementFlowId("agent_submit")).trigger("click")},s.save=function(){if("agent_edit"===s.task.page.name)if(angular.equals(s.task.agentEdit,s.task.editTemp))s.flow.message.info(UI_MESSAGE_NO_CHANGE);else{if(s.editPassword){if(s.reTypePassword!==s.task.agentEdit.user.password)return void s.flow.message.warning("Password did not match.")}else s.task.agentEdit.user.password=null;s.flow.action("put",s.task.agentEdit,s.task.agentEdit.id)}else if("agent_create"===s.task.page.name){if(s.reTypePassword!==s.task.agentCreate.user.password)return void s.flow.message.warning("Password did not match.");s.flow.action("put",s.task.agentCreate)}};var deleteCtl=new DeleteControl;deleteCtl.id="agent_del_ctl",s.dtOptions=new FlowOptionsGET(dto,s.flow.getHomeUrl(),s,c,ss),s.dtColumns=FlowColumns(dtc),s.dtColumns.push(dtc.newColumn("user.flowUserDetail.fullName").withTitle("Name").withOption("searchable",!0)),s.dtColumns.push(dtc.newColumn("region").withTitle("Region").withOption("searchable",!0)),s.dtColumns.push(dtc.newColumn("active").withTitle("Active").withOption("searchable",!1).renderWith(function(data){return renderCheckbox(data)})),s.dtColumns.push(dtc.newColumn("online").withTitle("Online").withOption("searchable",!1).renderWith(function(data){return renderCheckbox(data)})),s.dtColumns.push(dtc.newColumn("createdDt").withTitle("Date created").renderWith(function(data){return renderDate(data,f)}).withOption("searchable",!1)),s.dtColumns.push(dtc.newColumn("startDt").withTitle("Last login date").renderWith(function(data){return renderDate(data,f)}).withOption("searchable",!1)),s.edit=function(id){s.task.agentEdit={},s.task.agentEdit.user={},s.task.editTemp={},s.flow.goTo("agent_edit",id)},s["delete"]=function(data){s.task.agentEdit=data,fm.show(s.flow.getElementFlowId("agentDeleteModal"))},s.flow.onPageChanging=function(page){return"agent_create"===page&&(s.task.agentCreate={},s.task.agentCreate.user={},s.task.agentCreate.user.flowUserDetail={},s.task.agentCreate.user.flowUserDetail.secretQuestion="When is your birthday? (yyyy-mm-dd)",s.reTypePassword="",angular.copy(s.task.agentCreate,s.tempData),void 0===s.task.agentCreate.user.flowUserProfileSet&&(s.task.agentCreate.user.flowUserProfileSet=[])),!0},s.$on(s.flow.event.getSuccessEventId(),function(event,data,method){"put"===method?"agent_edit"==s.task.page.name?(angular.copy(s.task.agentEdit,s.task.editTemp),s.flow.goToHome()):"agent_create"===s.task.page.name&&(s.task.agentCreate={},angular.copy(s.task.agentCreate,s.tempData),s.flow.goToHome()):"delete"===method&&"agent_home"===s.task.page.name&&s.dtInstance&&s.dtInstance.reloadData()}),s.$on(s.flow.event.getResizeEventId(),function(event,page,size){"agent_home"===page&&s.dtInstance&&s.dtInstance.reloadData()}),s.$on(s.flow.event.getResizeEventId(),function(event,page,size){"agent_home"===page&&s.dtInstance&&s.dtInstance.reloadData()}),s.$on(s.flow.event.getRefreshId(),function(){s.dtInstance&&s.dtInstance.reloadData()}),s.task.page.load=function(data,source){var page=this.name;"agent_edit"===page?s.task.agentEdit.id&&"refresh"!==source||(s.task.agentEdit=data,s.reTypePassword=s.task.agentEdit.user.password,s.oldPassword="",angular.copy(s.task.agentEdit.user.password,s.oldPassword)):"agent_home"===page&&s.dtInstance&&s.dtInstance.reloadData(),s.flow.addControl(save,["agent_edit","agent_create"]),s.flow.addControl(deleteCtl,"agent_edit"),s.flow.addControl(create,"agent_home")},s.$on(s.flow.getEventId("agent_del_ctl"),function(){fm.show(s.flow.getElementFlowId("agentDeleteModal"))}),s.deleteConfirm=function(){s.flow.action("delete",s.task.agentEdit,s.task.agentEdit.id),fm.hide(s.flow.getElementFlowId("agentDeleteModal")),"agent_home"!==s.task.page.name&&s.flow.goToHome(),s.dtInstance&&s.dtInstance.reloadData()},s.deleteCancel=function(){fm.hide(s.flow.getElementFlowId("agentDeleteModal"))}}]).controller("customerSummaryCtrl",["$scope","DTOptionsBuilder","DTColumnBuilder","flowMessageService","flowModalService","$compile","$filter","sessionService","hasProfile","userProfile","imageService",function(s,dto,dtc,ms,fm,c,f,ss,hp,up,is){s.imageService=is,s.flow.openTaskBaseUrl="services/flow_task_service/getTask?showToolBar=false&size=100&",s.editCustomer=function(customerId){s.flow.openTask("customer_task","customer_edit",customerId,!1)},s.editActivity=function(activityId){s.flow.openTask("daily_task","daily_edit",activityId,!1)},s.task.refresh=function(){s.task.page.name===s.task.homePage&&(s.http.post(this.homeUrl).success(function(data){s.task.agent.summary.result=data}),s.task.agent.selectedCustomer&&s.flow.action("post",void 0,s.buildQuery()))},s.$on(s.flow.event.getSuccessEventId(),function(event,data,method){s.task.page.name===s.task.homePage&&"post"===method&&(s.task.agent.activity=data)}),s.flow.onRefreshed=function(){s.task.refresh()},s.task.page.load=function(){s.task.agent=up.agent,s.task.agent.schoolYear=void 0,s.task.agent.month=void 0,s.task.agent.week="all",s.task.agent.activity={},s.task.agent.summary={},console.info("customerSummaryCtrl",this.name),"customer_agent_home"===this.name&&(this.title="assigned to "+s.task.agent.fullName,s.http.post("services/war/customer_light_query/find_by_assigned_agent").success(function(data){s.task.agent.summary.result=data}).then(function(){s.task.agent=up.agent}))},s.filter=function(){s.flow.action("post",void 0,s.buildQuery())},s.buildQuery=function(){var url="";return s.task.agent.selectedCustomer&&(url+="?customerId="+s.task.agent.selectedCustomer.id,s.task.agent.schoolYear&&(url+="&schoolYearId="+s.task.agent.schoolYear.id),s.task.agent.month&&(url+="&month="+s.task.agent.month),s.task.agent.week&&(url+="&week="+s.task.agent.week)),url},s.clearFilter=function(){s.task.agent.schoolYear=void 0,s.task.agent.month=void 0,s.task.agent.week="all",s.task.agent.activity={},s.task.refresh()},s.select=function(school){s.task.agent.selectedCustomer=school,s.task.agent.schoolYear&&s.filter()},s.prev=function(){if(s.task.agent.activity.hasPrevious){var url=s.buildQuery()+"&start="+s.task.agent.activity.previous;s.flow.action("post",void 0,url)}},s.next=function(){if(s.task.agent.activity.hasNext){var url=s.buildQuery()+"&start="+s.task.agent.activity.next;s.flow.action("post",void 0,url)}},s.goToSummary=function(){var param=s.task.agent.selectedCustomer.id;s.task.agent.schoolYear&&(param+="?schoolYear="+s.task.agent.schoolYear.id),s.flow.goTo("customer_agent_summary",param)}}]).controller("customerInfoCtrl",["$scope","DTOptionsBuilder","DTColumnBuilder","flowMessageService","flowModalService","$compile","$filter","sessionService","hasProfile","userProfile","imageService",function(s,dto,dtc,ms,fm,c,f,ss,hp,up,is){s.task.page.load=function(data){s.task.summaryPage="customer_agent_summary",s.task.summaryUrl="services/war/agent_customer_summary_query/customer_summary",s.task.chartId=s.flow.getElementFlowId("agentMonthlyBarChart"),console.info(this.name,data),this.name===s.task.summaryPage&&(s.task.origin?(console.info("origin",s.task.origin),s.task.agent=s.task.origin.agent,s.task.agent.schoolYear=s.task.origin.schoolYear):s.task.agent.schoolYear=data.schoolYear,up.agent.id&&(s.task.agent=up.agent),s.task.summary=data,s.task.title=s.task.summary.customer.school.name,this.title=s.task.agent.fullName,s.task.createChart())},s.task.refresh=function(){s.task.querySummary()},s.flow.onRefreshed=function(){s.task.refresh()},s.task.querySummary=function(){if(console.info("query_summary",s.task.summary),s.task.summary){var param=s.task.summary.customer.id;s.task.agent.schoolYear&&(param+="?schoolYear="+s.task.agent.schoolYear.id),s.flow.action("get",void 0,param)}},s.task.createChart=function(){var ctx=document.getElementById(s.task.chartId).getContext("2d");new Chart(ctx).Bar(s.task.summary.chart)},s.$on(s.flow.event.getSuccessEventId(),function(event,data,method){s.task.page.name===s.task.summaryPage&&"get"===method&&(s.task.summary=data,s.task.createChart())})}]);