'use strict';
angular.module('myApp', ['vAccordion', 'templates', 'ngAnimate', 'ngForce', 'angucomplete-alt'])
    .directive('dgrlSetup', function() {
        return {
            templateUrl: 'views/main.html'
        }
    })
    .directive('relatedObject',function() {
        // function link(scope, element, attrs, controller, transcludeFn) {
        //     scope.relationship = {};
        //     controller.relationships.push(scope.relationship);
        // }
        //
        // function controller($scope) {
        //     var getChildRelationships = vfr.send('DGRL_Setup.getChildRelationships', vfr.standardOptions, false);
        //     $scope.relationship = getChildRelationships();
        // }
        return {
            // scope: {
            //     parent: '=parent'
            // },
            require: '^vPane',
            replace:true,
            scope:false,
            templateUrl: 'views/related.html'
        }
    })
    .controller('mainCtrl', function($scope, $templateCache, vfr) {
        $scope.relationships = [];
        $scope.mainObject = {};
        $scope.sObjectNames = [];

        //custom vfr
        $scope.init = vfr.send('DGRL_Setup.init', vfr.standardOptions, false);
        // $scope.relatedQ = vfr.send('mn_s1.runRelatedQuery', vfr.standardOptions, false);


        $scope.init().then(
            function(results) {
                $scope.sObjectNames = results.sObjectNames;
            },
            function(results) {
                $scope.error = results;
                console.log($scope.error);
            });


        $scope.selected = undefined;
        $scope.states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Dakota', 'North Carolina', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];
    })
