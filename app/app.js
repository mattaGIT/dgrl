'use strict';

var app = angular.module('DGRL', ['ngAnimate', 'ui.grid', 'ngForce', 'sf', 'ui.grid.grouping'])
    .directive('dgrl', function() {
        return {
            template: '<div ng-controller="MainCtrl"> <p ng-show="lastChange"> <div id="grid1" ui-grid="gridOptions" ui-grid-grouping class="grid" style="width:100%;"></div></div>'
        }
    })

.controller('MainCtrl', ['$scope', '$q', '$timeout', 'vfr', 'sf', '$interval', 'uiGridConstants', 'uiGridGroupingConstants', '$filter', function($scope, $q, $timeout, vfr, sf, $interval, uiGridConstants, uiGridGroupingConstants, $filter) {


    var setGroupValues = function(columns, rows) {
        columns.forEach(function(column) {
            if (column.grouping && column.grouping.groupPriority > -1) {
                // Put the balance next to all group labels.
                column.treeAggregationFn = function(aggregation, fieldValue, numValue, row) {
                    if (typeof(aggregation.value) === 'undefined') {
                        aggregation.value = 0;
                    }
                    aggregation.value = aggregation.value + row.entity.balance;
                };
                column.customTreeAggregationFinalizerFn = function(aggregation) {
                    if (typeof(aggregation.groupVal) !== 'undefined') {
                        aggregation.rendered = aggregation.groupVal;
                    } else {
                        aggregation.rendered = null;
                    }
                };
            }
        });
        return columns;
    };


    $scope.ids = [sf.Id];
    $scope.object1 = {};
    $scope.object1.fields = [];
    $scope.object1.query = [];
    $scope.object1.data = [];
    $scope.object1.shownFields = [];
    $scope.object1.oName = sf.Grouping_1_Object;
    $scope.object1.groupingField = sf.Grouping_1_Field;
    $scope.object1.groupingFieldSet = sf.Grouping_1_Field_Set;
    $scope.object1.groupingParentField = sf.Grouping_1_Parent_Field;

    $scope.object2 = {};
    $scope.object2.fields = [];
    $scope.object2.query = [];
    $scope.object2.data = [];
    $scope.object2.shownFields = [];
    $scope.object2.oName = sf.Grouping_2_Object;
    $scope.object2.groupingField = sf.Grouping_2_Field;
    $scope.object2.groupingFieldSet = sf.Grouping_2_Field_Set;
    $scope.object2.groupingParentField = sf.Grouping_2_Parent_Field;

    $scope.faMap = [];

    $scope.gridOptions = {
        rowHeight: 23,
        showGridFooter: false,
        showColumnFooter: true,
        enableFiltering: false,
        enableSorting: true,
        groupingShowCounts: false,
        columnDefs: [{
            name: 'Person / Entity',
            field: 'Entity__r.Name',
            enableColumnMenu: false,
            grouping: {
                groupPriority: 1
            },
            sort: {
                priority: 1,
                direction: 'desc'
            },
            cellTemplate: '<div><div ng-if="!col.grouping || col.grouping.groupPriority === undefined || col.grouping.groupPriority === null || ( row.groupHeader && col.grouping.groupPriority === row.treeLevel )" class="ui-grid-cell-contents" title="TOOLTIP">{{COL_FIELD CUSTOM_FILTERS}}</div></div>'
        }, {
            name: 'Account #',
            field: 'Financial_Account__r.Account_Number__c',
            enableColumnMenu: false,
            sort: {
                priority: 2,
                direction: 'desc'
            },
        }, {
            name: 'Account Role',
            field: 'Role__c',
            enableColumnMenu: false,
        }, {
            field: 'Financial_Account__r.Total_Account_Value__c',
            name: 'Account Value',
            enableColumnMenu: false,
            cellFilter: 'currency',
        }, {
            field: 'AccountValueOP',
            name: 'Account Value OP',
            enableColumnMenu: false,
            cellFilter: 'currency',
            footerCellFilter: 'currency',
            treeAggregationType: uiGridGroupingConstants.aggregation.SUM,
            customTreeAggregationFinalizerFn: function(aggregation) {
                aggregation.rendered = aggregation.value;
            },
            displayName: 'Account Value - OP'
        }, {
            field: 'AccountValueIP',
            name: 'Account Value IP',
            enableColumnMenu: false,
            cellFilter: 'currency',
            footerCellFilter: 'currency',
            treeAggregationType: uiGridGroupingConstants.aggregation.SUM,
            customTreeAggregationFinalizerFn: function(aggregation) {
                aggregation.rendered = aggregation.value;
            },
            displayName: 'Account Value - IP'
        }],

        onRegisterApi: function(gridApi) {
            $scope.gridApi = gridApi;
            $scope.gridApi.grid.registerColumnsProcessor(setGroupValues, 410);
            $scope.gridApi.grid.registerDataChangeCallback(function() {
                $scope.gridApi.treeBase.expandAllRows();
            })
        }
    };

    function applyRules(fas) {
        var faN;
        var faE;
        var fapId;
        var faType;
        var fa;
        var faMap = [];
        for (var i = 0; i < fas.length; i++) {
            faN = fas[i].Financial_Account__r.Account_Number__c;
            faE = fas[i].Entity__c;
            fapId = fas[i].Id;
            faType = (fas[i].Role__c == 'Interested Party') ? 'i' : 'o';
            fa = _.find(faMap, {
                'faNum': faN,
                'faE': faE
            });
            if (!fa) {
                faMap.push({
                    'faNum': faN,
                    'faE': faE,
                    'type': faType,
                    'Id': fapId
                });
            } else if (fa.type == 'i' && faType == 'o') {
                _.remove(faMap, {
                    'faNum': faN,
                    'faE': faE
                });
                faMap.push({
                    'faNum': faN,
                    'faE': faE,
                    'type': faType,
                    'Id': fapId
                });
            }
        }
        for (var i = 0; i < faMap.length; i++) {
            fa = _.find(fas, {
                'Id': faMap[i].Id
            });

            if (faMap[i].type == 'o') {
                fa.AccountValueOP = fa.Financial_Account__r.Total_Account_Value__c;
            } else {
                fa.AccountValueIP = fa.Financial_Account__r.Total_Account_Value__c;
            }

        }
        return fas;
    }

    function getFields(obj) {
        return vfr.describeFieldSet(obj.oName, obj.groupingFieldSet).then(function(results) {
            obj.shownFields = results;
            makeQuery(obj, $scope.ids);

            console.log(obj);
        }).then(function(results) {
            return vfr.query(obj.query);
        }).then(function(results) {
            obj.data = results.records;
            var groupingLookup = obj.groupingField.substring(0, obj.groupingField.indexOf("__r.") + 2) + 'c';
            $scope.ids = _.pluck(obj.data, groupingLookup);
        })
    }

    function makeQuery(obj) {
        obj.fields = obj.shownFields.slice();
        var otherFields = [{
            fieldPath: obj.groupingField
        }, {
            fieldPath: obj.groupingParentField
        }, {
            fieldPath: 'Name'
        }];
        var allFields = otherFields.concat(obj.shownFields.slice());
        obj.fields = _.unique(otherFields.concat(obj.shownFields), 'fieldPath');
        obj.query = 'SELECT ';
        obj.query += _.pluck(obj.fields, 'fieldPath').join(', ');
        obj.query += ' FROM ' + obj.oName + ' WHERE ' + obj.groupingParentField + ' IN '
        obj.query += '(\'' + $scope.ids.join('\',\'') + '\')';
    }

    function getRGs() {
        var rgQuery = 'SELECT Id, Name FROM Relationship_Group__c WHERE ';
        rgQuery += 'Parent_Relationship_Group__c = ' + $scope.ids;
        rgQuery += ' OR Id =' + $scope.ids;

        return vfr.query(rgQuery).then(function(results) {
            $scope.ids = _.pluck(results.records, 'Id');
        });
    }

    getRGs().then(function(results) {
        return getFields($scope.object1);
    }).then(function(results) {
        return getFields($scope.object2);
    }).then(function(results) {
        $scope.object2.data = applyRules($scope.object2.data);
        $scope.gridOptions.data = $scope.object2.data;
    })


}])
