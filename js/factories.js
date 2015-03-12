/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var HOST = "http://localhost:9080/rex-services/";

angular.module("flowFactories", [])
    .constant("HOST", HOST)
    .constant("VIEWER", "vendors/ViewerJS/#"
);

/*add http://192.168.1.2:9080/rex-war/ when accessing via remote*/

