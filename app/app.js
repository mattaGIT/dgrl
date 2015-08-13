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

.controller('listController', function($scope, $q, $timeout, vfr, sf){
    var primaryRelated = sf.PrimaryRelated;
    var primaryRelatedField = sf.PrimaryRelatedField;
    var primaryFields = [];

    var secondaryRelated = sf.SecondaryRelated;
    var secondaryRelatedField = sf.SecondaryRelatedField;
    var secondaryFields = [];

    var primaryGroupField = sf.PrimaryGroupField;
    var primaryGroupFieldType = sf.PrimaryGroupFieldType;
    var primaryGroupObj = sf.PrimaryGroupObj;
    var secondaryGroupField = sf.SecondaryGroupField;
    var secondaryGroupFieldType = sf.SecondaryGroupFieldType;
    var secondaryGroupObj = sf.SecondaryGroupObj;

    var columns = [];
    $scope.data = [];

    var primaryPromise = getFieldsAndColumns(primaryRelated, primaryRelated.replace('__c', '_DGRL'), 
                                                primaryFields, columns, primaryGroupField, secondaryGroupField);

    var secondaryPromise = getFieldsAndColumns(secondaryRelated, secondaryRelated.replace('__c', '_DGRL'), 
                                                secondaryFields, columns, primaryGroupField, secondaryGroupField);

    $q.all([primaryPromise, secondaryPromise]).then(
        function(){
            // console.log('primary fields: ' + primaryFields);
            // console.log('secondary fields: ' + secondaryFields);
            // console.log('column defs:', columns);

            var query = buildQuery(primaryRelated, primaryFields, primaryRelatedField, sf.Id);
            // console.log('query1: ' + query);

            var primaryObjs = [];

            vfr.query(query).then(function(result){

                var len = result.records.length;
                var ids = '';

                for(var j = 0; j < len; j++){
                    if(primaryObjs[result.records[j][primaryGroupField]] === undefined){
                        primaryObjs[result.records[j][primaryGroupField]] = [];
                    }

                    primaryObjs[result.records[j][primaryGroupField]].push(result.records[j]);
                    
                    ids += '\''+result.records[j][primaryGroupField]+'\'';
                    if(j < len-1){
                        ids += ',';
                    }
                }

                var query2 = buildQuery(secondaryRelated, secondaryFields, secondaryRelatedField, ids);
                // console.log('query2: ' + query2);

                return vfr.query(query2);

            }).then(function(result){

                var length = result.records.length;
                for(var h = 0; h < length; h++){

                    var rowsToMerge = primaryObjs[result.records[h][secondaryRelatedField]];
                    var toMergeLength = rowsToMerge.length;

                    for(var k = 0; k < toMergeLength; k++){
                        var mergedRow = angular.merge({}, result.records[h], rowsToMerge[k]);
                        $scope.data.push(mergedRow);
                    }
                }

                $timeout($scope.gridApi.treeBase.expandAllRows);

                // console.log('data: ', $scope.data);
            }).catch(function(error){console.error(error)});
        }
    );

    $scope.gridOptions = {
        enableSorting: true,
        enableGridMenu: false,
        treeRowHeaderAlwaysVisible: false,
        groupingNullLabel: ' ',
        columnDefs: columns,
        onRegisterApi: function(gridApi){
            $scope.gridApi = gridApi;
        }
    };

    $scope.gridOptions.data = $scope.data;

    function getFieldsAndColumns(objType, fieldSetName, fieldArray, columns, groupField1, groupField2){
        var hasGroupField1Name = false, hasGroupField2Name = false;
        var groupField1Name = groupField1.replace('__c', '__r') + '.Name';
        var groupField2Name = groupField2.replace('__c', '__r') + '.Name';

        return vfr.describeFieldSet(objType, fieldSetName).then(
            function(result){
                for(var i = 0; i < result.length; i++){
                    fieldArray.push(result[i].fieldPath);

                    if(result[i].fieldPath === groupField1){
                        columns.push( buildColumn(result[i], groupField1, primaryGroupFieldType, 0, true) );
                    } else if(result[i].fieldPath === groupField2){
                        columns.push( buildColumn(result[i], groupField2, secondaryGroupFieldType, 1, false) );
                    } else if(result[i].fieldPath === groupField1Name){
                        hasGroupField1Name = true;
                    } else if(result[i].fieldPath === groupField2Name){
                        hasGroupField2Name = true;
                    }else {
                        columns.push(
                            {   name: result[i].label, 
                                field: result[i].fieldPath
                            }
                        );
                    }
                }

                // We want to display names instead of Ids for reference fields
                if(!hasGroupField1Name && primaryGroupFieldType === 'REFERENCE' && primaryGroupObj === objType){
                    fieldArray.push(groupField1.replace('__c', '__r') + '.Name');
                }

                if(!hasGroupField2Name && secondaryGroupFieldType === 'REFERENCE' && secondaryGroupObj === objType){
                    fieldArray.push(groupField2.replace('__c', '__r') + '.Name');
                }
            }
        ).catch(
            function(error){
                console.error(error);
            }
        );
    };

    function buildColumn(field, groupField, groupFieldType, fieldPriority, isPrimary){
        return {
            name: field.label,
            field: field.fieldPath,
            grouping: {groupPriority: fieldPriority},
            sort: {priority: fieldPriority, direction: 'asc'},
            cellTemplate: '<div ng-if="!col.grouping || col.grouping.groupPriority === undefined || col.grouping.groupPriority === null || '
                        +'( row.groupHeader && col.grouping.groupPriority === row.treeLevel )" '
                        +'class="ui-grid-cell-contents" title="TOOLTIP">{{'
                        + getFieldToDisplay(groupFieldType, groupField, isPrimary)
                        +' CUSTOM_FILTERS}}</div>'
        }
    }

    // If the grouping field is a reference, we want to show a name instead of 
    // a Salesforce ID in the grid
    function getFieldToDisplay(fieldType, groupField, isPrimary){
        var rowString = 'row.treeNode.children[0]'
        if(fieldType === 'REFERENCE'){
            if(isPrimary){
                rowString += '.children[0].row.entity.'
                                + groupField.replace('__c','__r')+'.Name';
            } else {
                rowString += '.row.entity.'
                                + groupField.replace('__c','__r')+'.Name';
            }
        } else {
            rowString = 'COL_FIELD'
        }

        return rowString;
    }

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