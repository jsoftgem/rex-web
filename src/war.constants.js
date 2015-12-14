var HOST = "http://war.rexpublishing.com.ph:8080/rex-services/";

(function () {
    'use strict';
    angular.module('war.app')
        .constant('HOST', HOST)
        .constant('VIEWER', 'vendors/ViewerJS/#')
        .constant('REX_VERSION', '1.3')
        .constant('FLUID_VERSION', '1.2c')
        .constant('APP_KEY', 'Zmx1aWRfcGxhdGZvcm1fc3VwZXJfYXBwbGljYXRpb25fYnlfamVyaWNvX2RlZ3V6bWFu');
})();

function withHost(url) {
    if (url && url.charAt(0) === '/') {
        url = url.substring(1, url.length - 1);
    }
    console.debug("withHost.url", url);
    if (url.indexOf(HOST) > -1) {
        return url;
    } else {
        return HOST + url;
    }
}
