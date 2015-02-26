angular.module("regionManager", ["fluid", "ngResource", "datatables", "ngCookies"])
.controller('regionManagerCtrl', ["$scope", "DTOptionsBuilder", "DTColumnBuilder", "flowMessageService", "flowModalService", "$compile", "$filter", "$cookies","userProfile", function (s, dto, dtc, ms, fm, c, f, co,up) {
	s.task.preLoad = function(){
		s.task.home_page = "region_manager_home";
		s.task.home_url = "services/war/agent_light_query/find_managed_agents?manager=";
		s.task.rsm = {};
		
		s.flow.pageCallBack = function(page, data){
			if(page === s.task.home_page){
				s.http.get(s.task.home_url,up.agent.id)
				.success(function(rsm){
					s.task.rsm = rsm;
				});
			}
		}

		s.task.onRefreshed = function(){
			if(s.task.page.name === s.task.home_page){
				s.http.get(s.task.home_url,up.agent.id)
				.success(function(rsm){
					s.task.rsm = rsm;
				});
			}
		}



	}	



}]);