/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var HOST = "http://192.168.1.7:8080/rex-services/";

angular.module("flowFactories", [])
    .constant("HOST", HOST)
    .constant("VIEWER", "vendors/ViewerJS/#")
    .constant("REX_VERSION", "1.2")
    .constant("FLUID_VERSION", "1.2b");

function withHost(url) {
    if (url && url.charAt(0) === '/') {
        url = url.substring(1, url.length - 1);
    }
    console.debug("withHost.url", url);
    return HOST + url;
}

/*add http://192.168.1.2:9080/rex-war/ when accessing via remote*/

