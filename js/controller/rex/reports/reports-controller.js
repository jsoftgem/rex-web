angular.module("reportsController",["fluid","ngResource","datatables","angular.filter","flowServices"]).controller("reportsCtrl",["$scope","DTOptionsBuilder","DTColumnBuilder","flowMessageService","flowModalService","$compile","$filter","sessionService","HOST","$timeout","flowFrameService","userProfile","hasProfile",function(s,dto,dtc,ms,fm,c,f,ss,h,t,ffs,up,hp){s.totalProductivity=function(planned,unplanned,target){var total=100*(planned+unplanned)/target;return total>125&&(total=125),total},s.task.pageAgent="report_weekly_agent",s.task.service="services/war/report_weekly_service",s.task.serviceCustomer=s.task.service+"/agent_customer",s.task.hideAgentFilter=!1,s.task.getCustomers=function(report){if(report.view=!report.view,report.view){report.loaded=!1;var url=s.task.serviceCustomer,count=0;report.year&&(url+="?year="+report.year,count++),report.reportMonth&&(count>0?url+="&":count++,url+="month="+report.reportMonth.label.toUpperCase()),report.week&&(count>0?url+="&":count++,url+="week="+report.week),report.agentId&&(count>0&&(url+="&"),url+="agent="+report.agentId),report.region&&(count>0&&(url+="&"),url+="region="+report.region),s.http.get(url).success(function(data){report.customers=data,report.loaded=!0})}},s.task.getDayName=function(dayOfWeek){return getDayName(dayOfWeek)},s.task.reportTable=$("#"+s.flow.getElementFlowId("reportTable")),s.task.print={},s.task.print.current=function(){s.task.reportTable.print({globalStyles:!0,iframe:!0,noPrintSelector:".no-print",manuallyCopyFormValues:!0,deferred:$.Deferred()})},s.flow.onRefreshed=function(){s.task.query()},s.task.load=function(){s.task.newReport=function(){var report={};return report.tag="all",report.size=25,report.start=0,report.isAgent=!1,report.isYear=!1,report.isMonth=!1,report.isRegion=!1,report},s.task.report=s.task.newReport(),hp.check("agent",s.task).success(function(valid){s.task.hideAgentFilter=valid,s.task.report.isAgent=valid,s.task.report.agent=up.agent,console.info("profileAgent",up)}),s.task.change=function(){s.task.report.isYear||(s.task.report.year=void 0),s.task.report.isMonth||(s.task.report.month=void 0),s.task.report.isAgent||(s.task.report.agent=void 0),s.task.report.isRegion||(s.task.report.region=void 0)},s.task.query=function(){var url="services/war/report_weekly_service/agents?",agentId=void 0!==s.task.report.agent?s.task.report.agent.id:void 0,count=0;s.task.report.isYear&&(url+="isYear=true&year="+s.task.report.year,count++),s.task.report.isMonth&&(count>0?url+="&":count++,url+="isMonth=true&month="+s.task.report.month),s.task.report.isAgent&&(count>0?url+="&":count++,url+="isAgent=true&agentId="+agentId),s.task.report.isRegion&&(count>0?url+="&":count++,url+="isRegion=true&region="+s.task.report.region),s.task.valid()&&s.task.report.closed===!1&&(count>0&&(url+="&"),s.task.report.size&&(url+="size="+s.task.report.size),s.task.report.tag&&(url+="&tag="+s.task.report.tag),s.task.report.start&&(url+="&start="+s.task.report.start),s.http.get(url).success(function(data){s.task.report.size=data.size,s.task.report.tag=data.tag,s.task.report.weeklyReports=data.weeklyReports}))},s.task.valid=function(){var valid=!0;return s.task.report.isYear&&void 0===s.task.report.year&&(s.flow.message.danger("Please select a year."),valid=!1),s.task.report.isMonth&&void 0===s.task.report.month&&(s.flow.message.danger("Please select a month."),valid=!1),s.task.report.isAgent&&void 0===s.task.report.agent&&(s.flow.message.danger("Please select an agent."),valid=!1),s.task.report.isRegion&&void 0===s.task.report.region&&(s.flow.message.danger("Please select a region."),valid=!1),valid}},s.task.postLoad=function(){s.$watch(function(scope){return scope.task.report.isYear},function(newValue,oldValue){newValue!==oldValue&&s.task.change()}),s.$watch(function(scope){return scope.task.report.isMonth},function(newValue,oldValue){newValue!==oldValue&&s.task.change()}),s.$watch(function(scope){return scope.task.report.isAgent},function(newValue,oldValue){newValue!==oldValue&&s.task.change()}),s.$watch(function(scope){return scope.task.report.isRegion},function(newValue,oldValue){newValue!==oldValue&&s.task.change()}),s.$watch(function(scope){return scope.task.report.year},function(newValue,oldValue){newValue!==oldValue&&(s.task.report.closed=!1,s.task.query())}),s.$watch(function(scope){return scope.task.report.month},function(newValue,oldValue){newValue!==oldValue&&(s.task.report.closed=!1,s.task.query())}),s.$watch(function(scope){return scope.task.report.agent},function(newValue,oldValue){newValue!==oldValue&&(s.task.report.closed=!1,s.task.query())}),s.$watch(function(scope){return scope.task.report.region},function(newValue,oldValue){newValue!==oldValue&&(s.task.report.closed=!1,s.task.query())})},s.task.page.load=function(){this.name===s.task.pageAgent&&s.task.query()}}]).controller("reportsMCtrl",["$scope","DTOptionsBuilder","DTColumnBuilder","flowMessageService","flowModalService","$compile","$filter","sessionService","HOST","$timeout","flowFrameService","hasProfile","userProfile",function(s,dto,dtc,ms,fm,c,f,ss,h,t,ffs,hp,up){s.task.hideAgentFilter=!1,s.task.pageCustomer="report_monthly_customer",s.task.newReport=function(){var report={};return report.tag="all",report.size=25,report.start=0,report.isAgent=!1,report.isYear=!1,report.isMonth=!1,report.isRegion=!1,report},s.$on(s.flow.event.getRefreshId(),function(){s.task.query()}),hp.check("agent",s.task).success(function(valid){s.task.hideAgentFilter=valid,s.task.report.isAgent=valid,s.task.agent=up.agent}),s.task.change=function(){s.task.report.start=0,s.task.report.size=25,s.task.report.isYear||(s.task.report.schoolYear=void 0),s.task.report.isMonth||(s.task.report.month=void 0),s.task.report.isAgent||(s.task.agent=void 0),s.task.report.isRegion||(s.task.report.region=void 0),s.task.report.isCustomer||(s.task.customer=void 0)},s.task.query=function(){var url="services/war/report_monthly_service/customers?",count=0;s.task.report.isYear&&(url+="isYear=true&schoolYear="+s.task.report.schoolYear,count++),s.task.report.isMonth&&(count>0?url+="&":count++,url+="isMonth=true&month="+s.task.report.month),s.task.report.isAgent&&(count>0?url+="&":count++,url+="isAgent=true&agentId="+s.task.agent.id),s.task.report.isRegion&&(count>0?url+="&":count++,url+="isRegion=true&region="+s.task.report.region),s.task.report.isCustomer&&(count>0?url+="&":count++,url+="isCustomer=true&customerId="+s.task.customer.id),s.task.valid()&&(count>0&&(url+="&"),url+="size="+s.task.report.size,url+="&tag="+s.task.report.tag,url+="&start="+s.task.report.start,s.http.get(url).success(function(data){s.task.report=data}))},s.task.valid=function(){var valid=!0;return s.task.report.isYear&&void 0===s.task.report.schoolYear&&(s.flow.message.danger("Please select a year."),valid=!1),s.task.report.isMonth&&void 0===s.task.report.month&&(s.flow.message.danger("Please select a month."),valid=!1),s.task.report.isAgent&&void 0===s.task.agent&&(s.flow.message.danger("Please select an agent."),valid=!1),s.task.report.isRegion&&void 0===s.task.report.region&&(s.flow.message.danger("Please select a region."),valid=!1),s.task.report.isCustomer&&void 0===s.task.customer&&(s.flow.message.danger("Please select a customer"),valid=!1),valid},s.task.changeTag=function(filter,tag){"all"===tag?filter.limitTo={}:"20"===tag?filter.limitTo=20:"50"===tag&&(filter.limitTo=50)},s.$watch(function(scope){return scope.task.report.isYear},function(){s.task.change()}),s.$watch(function(scope){return scope.task.report.isMonth},function(){s.task.change()}),s.$watch(function(scope){return scope.task.report.isAgent},function(){s.task.change()}),s.$watch(function(scope){return scope.task.report.isRegion},function(){s.task.change()}),s.$watch(function(scope){return scope.task.report.isCustomer},function(){s.task.change()}),s.$watch(function(scope){return scope.task.report.schoolYear},function(){s.task.query()}),s.$watch(function(scope){return scope.task.report.month},function(){s.task.query()}),s.$watch(function(scope){return scope.task.agent},function(){s.task.query()}),s.$watch(function(scope){return scope.task.report.region},function(){s.task.query()}),s.$watch(function(scope){return scope.task.customer},function(){s.task.query()}),s.task.page.load=function(){this.name===s.task.pageAgent&&(s.task.report=s.task.newReport(),s.task.query())}}]).controller("reportCustomerSummary",["$scope","DTOptionsBuilder","DTColumnBuilder","flowMessageService","flowModalService","$compile","$filter","sessionService","HOST","$timeout","flowFrameService","hasProfile","userProfile",function(s,dto,dtc,ms,fm,c,f,ss,h,t,ffs,hp,up){s.task.home="report_monthly_customer",s.task.view="Table",s.task.refresh=function(){s.task.query()},s.flow.onRefreshed=function(){s.task.refresh()},s.task.page.load=function(data){s.task.report={},s.task.order="materialsAdvisor",this.name===s.task.home&&(s.task.report.data=data,s.task.report.filter=JSON.parse(this.getParam),up.agent.id&&(this.title=up.agent.fullName+"'s Customer",s.task.report.filter.regionCode=up.agent.region,s.task.report.filter.agent=up.agent.id,s.task.isAgent=!0))},s.task.selectSchoolYear=function(item){s.task.report&&s.task.report.filter&&item&&(s.task.report.filter.schoolYear=item.id,s.task.query())},s.task.selectRegion=function(item){s.task.report.filter&&item&&(s.task.report.filter.regionCode=item.regionCode,s.task.query())},s.task.selectAgent=function(item){s.task.report.filter&&item&&(s.task.report.filter.agent=item.id,s.task.query())},s.task.query=function(){if(s.task.report.filter){console.info("agent-query",s.task.report);var filter=JSON.stringify(s.task.report.filter);s.flow.action("get",void 0,filter)}},s.task.clearFilters=function(){s.task.report.filter&&(s.task.report.filter=JSON.parse(s.task.page.getParam),s.task.schoolYear=void 0,s.task.agent=void 0,s.task.region=void 0,s.task.report.data={},s.task.query())},s.task.tag=function(tag){s.task.report.filter.tag=tag,"20"===tag?s.task.order="index":"50"===tag?s.task.order="index":s.task.order="materialsAdvisor",s.task.query()},s.$on(s.flow.event.getSuccessEventId(),function(event,data,method){console.info("reports-monthly-summary- getSuccessEventId",method),"get"===method&&(console.info("get",data),s.task.report.data=data)})}]);