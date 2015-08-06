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


.controller('listController', function($scope, vfr, $q, sf){
    var groupMember = 'Relationship_Group_Member__c';
    var groupRelatedField = 'Relationship_Group__c'
    var groupMemberFields = [];

    var accountParty = 'Financial_Account_Party__c';
    var accountRelatedField = 'Entity__c';
    var accountPartyFields = [];

    var columns = [];
    var groupMemberPromise = getFieldSet(groupMember, groupMember.replace('__c', '_DGRL'), groupMemberFields, columns);
    var accountPartyPromise = getFieldSet(accountParty, accountParty.replace('__c', '_DGRL'), accountPartyFields, columns);

    var data = [];

    $q.all([groupMemberPromise, accountPartyPromise]).then(
        function(){
            console.log('group member fields: ' + groupMemberFields);
            console.log('account party fields: ' + accountPartyFields);
            console.log('column defs:', columns);

            var query = buildQuery(groupMember, groupMemberFields, groupRelatedField, sf.Id);
            console.log('query1: ' + query);

            var groupMemberObjs = [];

            vfr.query(query).then(function(result){

                var len = result.records.length;
                var ids = '';

                for(var j = 0; j < len; j++){
                    groupMemberObjs[result.records[j].Group_Member__c] = result.records[j];
                    ids += '\''+result.records[j].Group_Member__c+'\'';
                    if(j < len-1){
                        ids += ',';
                    }
                }

                var query2 = buildQuery(accountParty, accountPartyFields, accountRelatedField, ids);
                console.log('query2: ' + query2);

                return vfr.query(query2);

            }).then(function(result){
                var length = result.records.length;
                for(var h = 0; h < length; h++){
                    var mergedRow = angular.merge({}, result.records[h], groupMemberObjs[result.records[h][accountRelatedField]]);
                    data.push(mergedRow);
                }
            }).catch(function(error){console.error(error)});

            // Need to also query for Financial_Account_Party__c records where 
            // Entity__c is in the Relationship_group_member query results,
            // then need to combine those results in the data array
        }
    );

    $scope.gridOptions = {
        enableSorting: true,
        enableGridMenu: false,
        treeRowHeaderAlwaysVisible: false,
        groupingNullLabel: ' ',
        columnDefs: columns
    };

    $scope.gridOptions.data = data;

    function getFieldSet(objType, fieldSetName, fieldArray){
        return vfr.describeFieldSet(objType, fieldSetName).then(
            function(result){
                for(var i = 0; i < result.length; i++){
                    fieldArray.push(result[i].fieldPath);
                    columns.push({name: result[i].label, field: result[i].fieldPath});
                }
            }
        ).catch(
            function(error){
                console.error(error);
            }
        );
    };

    function buildQuery(objType, fields, relatedObjField, relatedIds){
        var query = 'SELECT Id, ' + relatedObjField + ', ';
        var len = fields.length;
        for(var i = 0; i < len; i++){
            query += fields[i];
            if(i < len-1){
                query += ',';
            }
        }

        return query + ' FROM ' + objType + ' WHERE ' + relatedObjField + ' IN (' + relatedIds + ')';
    }
});