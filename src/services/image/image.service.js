(function () {
    'use strict';
    angular.module('war.services')
        .service('imageService', ImageService);

    ImageService.$inject = ['flowHttpService'];

    function ImageService(f) {
        this.url = "services/download_service/getContent/";

        this.getAvatar = function (id) {
            return id ? f.host + this.url + id : '../images/gallery/profile_default.png';
        };

        return this;
    }
})();