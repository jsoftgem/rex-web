/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

<<<<<<< HEAD
var HOST = "http://war.rexpublishing.com.ph:8080/rex-services/";

=======
var HOST = "http://war.rexpublishing.com.ph/:8080/rex-services";
/*var HOST = "http://localhost:9080/rex-services/";*/
>>>>>>> 31ddc0089f76afc75c79ba336fe692127fde2d22
angular.module("flowFactories", [])
    .constant("HOST", HOST)
    .constant("VIEWER", "vendors/ViewerJS/#")
    .constant("REX_VERSION", "1.0.1")
    .constant("FLUID_VERSION", "1.0b");

/*add http://192.168.1.2:9080/rex-war/ when accessing via remote*/

