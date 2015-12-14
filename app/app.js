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
    var customTreeAggregationFn = function(aggregation, fieldValue, value, row) {
        // calculates the average of the squares of the values
        if (typeof(aggregation.count) === 'undefined') {
            aggregation.count = 0;
        }
        aggregation.count++;
        aggregation.value = value;
    }


    $scope.baseURL= sf.baseURL;
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
    $scope.object1.whereCondition = 'Exclude_From_Rollup__c = false';

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
            displayName: 'Person / Entity',
            field: 'Entity__r.Name',
            enableColumnMenu: false,
            grouping: {
                groupPriority: 0
            },
            sort: {
                priority: 1,
                direction: 'asc'
            },
            cellClass:'grid-align',
            cellTemplate: '<div class="ui-grid-cell-contents"><a ng-if="!col.grouping || col.grouping.groupPriority === undefined || col.grouping.groupPriority === null || ( row.groupHeader && col.grouping.groupPriority === row.treeLevel )" target="_parent" href="{{grid.appScope.baseURL}}/{{grid.appScope.getId(row)}}" >{{COL_FIELD}}</a></div>'
        }, {
            name: 'EDM Id',
            displayName: 'EDM Id',
            field: 'Entity__r.EDM_ID__c',
            enableColumnMenu: false,
            customTreeAggregationFinalizerFn: function(aggregation) {
                aggregation.rendered = aggregation.value;
            },
            cellTemplate: '<div><div class="ui-grid-cell-contents" ng-if="row.groupHeader" title="TOOLTIP">{{COL_FIELD CUSTOM_FILTERS}}</div></div>',
            customTreeAggregationFn: customTreeAggregationFn

        }, {
            name: 'Prism',
            field: 'Prism__c',
            enableColumnMenu: false,
            width: '50',
            cellTemplate: '<div class="ui-grid-cell-contents"><a ng-if="!row.groupHeader" target="_parent" href="http://prism.nb.com/AcctSpecificReports/default.aspx?acctno={{row.entity.Financial_Account__r.Account_Number__c}}" ><img src=https://nbhnw--c.na12.content.force.com/servlet/servlet.ImageServer?id=015U0000002pUXW&oid=00DU0000000LyEC> </a></div>'

        }, {
            name: 'Account #',
            field: 'Financial_Account__r.Account_Number__c',
            enableColumnMenu: false,
            sort: {
                priority: 2,
                direction: 'asc'
            },
            cellTemplate: '<div class="ui-grid-cell-contents"><a target="_parent" href="{{grid.appScope.baseURL}}/{{row.entity.Financial_Account__c}}" class="ui-grid-cell-contents">{{COL_FIELD CUSTOM_FILTERS}}</a></div>'

        }, {
            name: 'Account Name',
            field: 'Account_Name__c',
            enableColumnMenu: false
        }, {
            name: 'Account Type',
            field: 'Account_Type__c',
            enableColumnMenu: false
        }, {
            name: 'Relationship / Role',
            field: 'Relationship_Role__c',
            enableColumnMenu: false
        },

        {
            field: 'Account_Status__c',
            name: 'Account Status',
            enableColumnMenu: false
        }, {
            field: 'Financial_Account__r.Manager_Sales_Code__c',
            name: 'Sales / Manager Code',
            enableColumnMenu: false,
        }, {
            name: 'Discretionary',
            field: 'Discretionary__c',
            enableColumnMenu: false,
            width: '100'
        }, {
            field: 'Financial_Account__r.Total_Account_Value__c',
            name: 'Account Value',
            enableColumnMenu: false,
            cellFilter: 'currency',
            cellTemplate: '<div><div class="ui-grid-cell-contents isNumeric" title="TOOLTIP">{{COL_FIELD CUSTOM_FILTERS}}</div></div>'
        }, {
            field: 'AccountValueOP',
            name: 'Account Value - OP',
            enableColumnMenu: false,
            displayName: 'Total OP Value',
            customTreeAggregationFinalizerFn: function(aggregation) {
                aggregation.rendered = aggregation.value;
            },
            cellFilter: 'currency',
            footerCellFilter: 'currency',
            treeAggregationType: uiGridGroupingConstants.aggregation.SUM,
            displayName: 'Total OP Value',
            cellTemplate: '<div><div class="ui-grid-cell-contents isNumeric" title="TOOLTIP">{{COL_FIELD CUSTOM_FILTERS}}</div></div>',
            footerCellTemplate: '<div><div class="ui-grid-cell-contents isNumeric">{{col.aggregationValue|currency}}</div></div>'
        }, {
            field: 'AccountValueIP',
            name: 'Account Value - IP',
            enableColumnMenu: false,
            displayName: 'Total IP Value',
            customTreeAggregationFinalizerFn: function(aggregation) {
                aggregation.rendered = aggregation.value;
            },
            cellFilter: 'currency',
            footerCellFilter: 'currency',
            treeAggregationType: uiGridGroupingConstants.aggregation.SUM,
            cellTemplate: '<div><div class="ui-grid-cell-contents isNumeric" title="TOOLTIP">{{COL_FIELD CUSTOM_FILTERS}}</div></div>',
            footerCellTemplate: '<div><div class="ui-grid-cell-contents isNumeric">{{col.aggregationValue|currency}}</div></div>'
        }
        ],

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
    $scope.getId = function(row)
    {
        var theId = row.treeNode.children[0].row.entity.Entity__c;
        return theId;
    }

    function getFields(obj) {
        return vfr.describeFieldSet(obj.oName, obj.groupingFieldSet).then(function(results) {
            obj.shownFields = results;
            makeQuery(obj, obj.whereCondition);

            console.log(obj);
        }).then(function(results) {
            return vfr.query(obj.query);
        }).then(function(results) {
            obj.data = results.records;
            var groupingLookup = obj.groupingField.substring(0, obj.groupingField.indexOf("__r.") + 2) + 'c';
            $scope.ids = _.pluck(obj.data, groupingLookup);
        })
    }

    function makeQuery(obj, whereCondition) {
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
        if (whereCondition) {
            obj.query += ' AND ' + whereCondition;
        }
    }

    function getRGs() {
        var rgQuery = 'SELECT Id, Name FROM Relationship_Group__c WHERE Id IN ';
        rgQuery += '(SELECT Child_Relationship_Group__c  FROM Relationship_Group_Association__c WHERE Parent_Relationship_Group__c= '  ;
        rgQuery += '\''+$scope.ids +'\')';

        return vfr.query(rgQuery).then(function(results) {
            var newIds = _.pluck(results.records, 'Id');
            $scope.ids.push(newIds);
            $scope.ids = _.uniq($scope.ids);
        },
        function(results) {
            console.log(results);
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
