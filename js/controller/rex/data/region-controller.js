

angular.module("regionController",["fluid", "ngResource", "datatables", "ngCookies"])
.controller("regionCtrl", ["$scope", "DTOptionsBuilder", "DTColumnBuilder", "flowMessageService", "flowModalService", "$compile", "$filter", "$cookies", function (s, dto, dtc, ms, fm, c, f, co) {
		
	 s.deleleModalId = "regionDeleteModal";
	 s.create_name = "region_create";
 	 s.edit_name = "region_edit";
 	 s.home = "region";
 	 s.submit_button = "region_submit";

	var create = new CreateControl();
	create.id="region_create_ctl";
	create.action= function(){
		s.task.regionCreate = {};
		s.flow.goTo(s.create_name);
	}

	var save = new SaveControl();
	save.id = "region_save_ctl";
	save.action = function(){
		$("#" + s.flow.getElementFlowId(s.submit_button)).trigger("click");
	}

	var delCtl = new DeleteControl();
	delCtl.id="region_del_ctl"; 
	delCtl.action= function(){
		fm.show(s.flow.getElementFlowId(s.deleleModalId));
	}
			s.dtOptions = new FlowOptionsGET(dto, s.flow.getHomeUrl(), s, c, co);
    		s.dtColumns = FlowColumns(dtc);
	   	 	s.dtColumns.push(dtc.newColumn("regionCode").withTitle("Region code").withOption("searchable", true));
			s.dtColumns.push(dtc.newColumn("regionName").withTitle("Region name").withOption("searchable", true));
	


	s.edit = function(id){
		s.task.regionEdit = {};
		s.task.tempEdit = {};
		s.flow.goTo(s.edit_name,id);	
	}

	s.delete = function(id){
		fm.show(s.flow.getElementFlowId(s.deleleModalId));
		s.http.get("services/war/region_query/getInstance/", id).success(function (data) {
        s.task.regionEdit = data;
     });
	}

	s.save = function(){
		if(s.page.name === s.edit_name){
			if(!angular.equals(s.task.regionEdit,s.task.tempEdit)){
				s.flow.action("put",s.task.regionEdit, s.task.regionEdit.id);
			}else{
				s.flow.message.info(UI_MESSAGE_NO_CHANGE);
			}
		}else if(s.page.name === s.create_name){
			s.flow.action("put", s.task.regionCreate);
		}
	}


	s.$on(s.flow.event.getSuccessEventId(),function(event,data,method){

		if(method ==="put"){
			if(s.page.name === s.edit_name){
				s.task.regionEdit = {};
				angular.copy(s.task.regionEdit,s.task.tempEdit);
				s.flow.goToHome();
			}else if(s.page.name === s.create_name){
				s.task.regionCreate = {};
				s.flow.goToHome();
			}
		}

	});


	s.$on(s.flow.event.getRefreshId(), function () {
                    s.dtOptions.reloadData();
                });



	s.flow.pageCallBack = function (page, data, source) {
                    if (s.edit_name === page) {
                        if (!s.task.regionEdit.id || source === "refresh") {
                            s.task.regionEdit = data;
                            angular.copy(s.task.regionEdit, s.task.tempEdit);
                        }
                    } else if (s.home === page) {
                        s.dtOptions.reloadData();
                    }

                    s.flow.addControl(save, [s.edit_name, s.create_name]);
                    s.flow.addControl(delCtl,s.edit_name);
                    s.flow.addControl(create, s.home);
                };

    s.deleteConfirm = function () {
                    s.flow.action("delete", s.task.regionEdit, s.task.regionEdit.id);
                    fm.hide(s.flow.getElementFlowId("regionDeleteModal"));
                    if (s.page.name !== s.home) {
                        s.flow.goToHome();
                    }
                    s.dtOptions.reloadData();
                };

                s.deleteCancel = function () {
                    fm.hide(s.flow.getElementFlowId("regionDeleteModal"));
                };

}]);