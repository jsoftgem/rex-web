angular.module("defaulController",["fluid", "ngResource", "datatables", "ngCookies"])
.controller("defaultCtl",["$scope", "DTOptionsBuilder", "DTColumnBuilder", "flowMessageService", "flowModalService", "$compile", "$filter", "$cookies", 
	function(s, dto, dtc, ms, fm, c, f, co){

	 s.task.preLoad = function(){
		s.task.deleleModalId = "defaultDeleteModal";
     	s.task.create_name = "default_create";
     	s.task.edit_name = "default";
     	s.task.home = "default";
     	s.task.submit_button = "default_submit";
     	s.task.create_ctl_id = "default_create_ctl";
     	s.task.save_ctl_id = "default_save_ctl";
     	s.task.del_ctl_id = "default_del_ctl";
     	s.task.getInstanceQuery = "services/war/school_year_query/getInstance/";

     	s.flow.controls = [new CreateControl(), new SaveControl(), new DeleteControl()];
	 	s.flow.controls[0].id= s.task.create_ctl_id;
	 	s.flow.controls[0].action= function(){
	 		s.flow.goTo(s.task.create_name);
     	}
     	s.flow.controls[0].pages = s.task.home;
     	s.flow.controls[1].id = s.task.save_ctl_id;
     	s.flow.controls[1].action = function(){
        	$("#" + s.flow.getElementFlowId(s.task.submit_button)).trigger("click");
     	}
     	s.flow.controls[1].pages = [s.task.create_name,s.task.edit_name];

     	s.flow.controls[2].id = s.task.del_ctl_id; 
	 	s.flow.controls[2].action= function(){
        fm.show(s.flow.getElementFlowId(s.task.deleleModalId));
     	}
     	s.flow.controls[2].pages = [s.task.edit_name];

     	s.task.edit = function(id){
        	s.task.modelEdit = {};
        	s.task.tempEdit = {};
        	s.flow.goTo(s.task.edit_name,id);  
    	}

    	s.task.delete = function(id){
        	fm.show(s.flow.getElementFlowId(s.task.deleleModalId));
        	s.http.get(s.task.getInstanceQuery, id).success(function (data) {
        		s.task.modelEdit = data;
     		});
    	}


    	s.$on(s.flow.event.getSuccessEventId(),function(event,data,method){

        	if(method ==="put"){
            	if(s.page.name === s.edit_name){
               	 	s.task.modelEdit = {};
                	angular.copy(s.task.modelEdit,s.task.tempEdit);
                	s.flow.goToHome();
            	}else if(s.page.name === s.create_name){
                	s.task.modelCreate = {};
                	s.flow.goToHome();
            	}
        	}



         s.$on(s.flow.event.getRefreshId(), function () {
                    s.dtOptions.reloadData();
         });

    	});


   		s.flow.pageCallBack = function (page, data, source) {
                   if (s.edit_name === page) {
                        if (!s.task.modelEdit.id || source === "refresh") {
                            s.task.modelEdit = data;
                            angular.copy(s.task.modelEdit, s.task.tempEdit);
                        }
                    } else if (s.home === page) {
                        s.dtOptions.reloadData();
                    }
     	};


     	s.task.deleteConfirm = function () {
                    s.flow.action("delete", s.task.modelEdit, s.task.modelEdit.id);
                    fm.hide(s.flow.getElementFlowId(s.task.deleleModalId));
                    if (s.page.name !== s.home) {
                        s.flow.goToHome();
                    }
                    s.dtOptions.reloadData();
                };

    	s.task.deleteCancel = function () {
                    fm.hide(s.flow.getElementFlowId(s.task.deleleModalId));
    	};

	}
		
	 	s.dtOptions = new FlowOptionsGET(dto, s.flow.getHomeUrl(), s, c, co);
   		s.dtColumns = FlowColumns(dtc,"task.edit","task.delete");
   		s.dtColumns.push(dtc.newColumn("description").withTitle("Description").withOption("searchable", true));
  
}])
.controller("defaultCreateCtl",["$scope","flowMessageService", "flowModalService", "$compile", "$filter", "$cookies", 
	function(s, ms, fm, c, f, co){

		s.task.modelCreate = {};

		s.save = function (){
			s.flow.action("put", s.task.modelCreate);
		}



}])
.controller("defaultEditCtl",["$scope","flowMessageService", "flowModalService", "$compile", "$filter", "$cookies", 
	function(s, ms, fm, c, f, co){

		s.task.modelEdit = {};

		s.save = function (){
			 if(!angular.equals(s.task.modelEdit,s.task.tempEdit)){
                s.flow.action("put",s.task.modelEdit, s.task.modelEdit.id);
            }else{
                s.flow.message.info(UI_MESSAGE_NO_CHANGE);
            }
		}


}]);


