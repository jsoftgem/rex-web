(function () {
    'use strict';
    angular.module('war.core')
        .directive("fluidPrintReport", FluidPrintReport);

    function FluidPrintReport() {
        return {
            restrict: "A",
            scope: {printData: "="},
            link: FluidPrintReportLink
        };
        function FluidPrintReportLink(scope, element) {
            element.unbind("click");
            element.bind("click", function (e) {
                if (scope.printData) {
                    var $printView = $("<div>");
                    angular.forEach(scope.printData.regions, function ($region, $index) {
                        var $printPanel = $("<div>");

                        $printPanel.addClass("panel panel-primary");

                        var $regionHeader = $("<div>");

                        $regionHeader.addClass("panel-heading").addClass("text-center");

                        $regionHeader.html($region.region);

                        $printPanel.append($regionHeader);


                        var $panelBody = $("<div>");
                        $panelBody.addClass("panel-body");


                        var $agentTable = $("<table>");
                        $agentTable.addClass("table table-bordered table-condensed");
                        $agentTable.append($("<colgroup>")
                            .append($("<col>").attr("span", 4))
                            .append($("<col>").attr("span", 12).addClass("months-header"))
                            .append($("<col>").attr("span", 11).addClass("activity-header")));
                        if (scope.printData.labels) {

                            var $header = $("<thead>");
                            $header.append($("<th>").css("font-size", "9px").html("Top"));
                            $header.append($("<th>").css("font-size", "9px").html("Accounts"));

                            angular.forEach(scope.printData.labels, function ($label, $index) {
                                var $th = $("<th>");
                                $th.css("font-size", "9px");
                                $th.html($label);
                                $header.append($th);
                            });

                            $agentTable.append($header);
                        }

                        angular.forEach($region.agents, function ($agent, $indexA) {
                            var $agentTableBody = $("<tbody>");
                            $agentTableBody.append($("<tr>").append($("<td>").attr("colspan", "27")
                                .addClass("bg-warning").html($agent.materialsAdvisor)));


                            angular.forEach($agent.customers, function ($customer, $indexC) {

                                var $ctr = $("<tr>").css("font-size", "10px");

                                $ctr.append($("<td>").addClass("text-center").html($customer.top ? $customer.top : "Untagged"))
                                    .append($("<td>").addClass("text-center").html($customer.label));

                                $agentTableBody.append($ctr);

                                angular.forEach($customer.data, function ($data, $indexD) {
                                    $ctr.append($("<td>").addClass("text-center").html($data));
                                });

                            });

                            $agentTable.append($agentTableBody);
                        });
                        $panelBody.append($agentTable);
                        $printPanel.append($panelBody);
                        $printView.append($printPanel);

                    });
                    $printView.print({
                        globalStyles: true,
                        mediaPrint: false,
                        stylesheet: null,
                        noPrintSelector: ".no-print",
                        iframe: true,
                        append: null,
                        prepend: null,
                        manuallyCopyFormValues: true,
                        deferred: $.Deferred()
                    });
                }
            });
        }
    }

})();