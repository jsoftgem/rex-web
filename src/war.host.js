var HOST = "http://war.rexpublishing.com.ph:9080/rex-services/";

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

