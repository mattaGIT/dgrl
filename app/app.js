'use strict';

var app = angular.module('DGRL', ['ui.grid', 'ui.grid.grouping', 'ngForce'])
.directive('grid', function(){
    return {
        restrict: 'E',
        transclude: false,
        scope: {},
        controller: 'listController',
        template: '<div ui-grid="gridOptions" class="myGrid" ui-grid-grouping></div>'
    }
})


.controller('listController', function($scope, vfr){
    vfr.query('SELECT Id FROM Relationship_Group__c').then(function(result){console.log(result)});

    $scope.gridOptions = { 
        enableSorting: true,
        enableGridMenu: false,
        treeRowHeaderAlwaysVisible: false,
        groupingNullLabel: ' ',
        columnDefs: 
        [ {field: 'totalAUM'},
           {field: 'futureEventDate'},
           {field: 'comments'},
           {field: 'membersInRelationshipGroup', type: 'number'} ]
    };
    var data = [{'totalAUM':'1800000',
                'futureEventDate': '10/20/2016',
                'comments': 'This is a relationship group',
                'membersInRelationshipGroup': 8},
                {'totalAUM':'300210',
                'futureEventDate': '7/31/2016',
                'comments': 'Relationship group 2',
                'membersInRelationshipGroup': 5},
                {'totalAUM':'19200',
                'futureEventDate': '7/31/2016',
                'comments': 'Relationship group 3',
                'membersInRelationshipGroup': 20},
                {'totalAUM':'8000',
                'futureEventDate': '7/12/2016',
                'comments': 'Relationship group 4',
                'membersInRelationshipGroup': 1},
                {'totalAUM':'62050',
                'futureEventDate': '12/31/2016',
                'comments': 'Relationship group 5',
                'membersInRelationshipGroup': 16},
                {'totalAUM':'20',
                'futureEventDate': '10/20/2016',
                'comments': 'Relationship group 6',
                'membersInRelationshipGroup': 9}];

    $scope.gridOptions.data = data;
});