'use strict';

var app = angular.module('DGRL', ['ngAnimate', 'ui.grid', 'ngForce', 'sf'])
    .directive('dgrl', function() {
        return {
            template: '<div ng-controller="MainCtrl"> <p ng-show="lastChange"> <div id="grid1" ui-grid="gridOptions" class="grid" style="width:100%;"></div></div>'
        }
    })

.controller('MainCtrl', ['$scope', '$q', '$timeout', 'vfr', 'sf', '$interval', 'uiGridConstants', '$filter', function($scope, $q, $timeout, vfr, sf, $interval, uiGridConstants, $filter) {

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
            groupingShowCounts:false,
            columnDefs: [{
                name: 'Account #',
                field: 'Financial_Account__r.Account_Number__c',
                enableColumnMenu:false,
                sort: {
                    priority: 1,
                    direction: 'asc'
                },

            }, {
                name: 'Account Role',
                field: 'Relationship_Role__c',
                enableColumnMenu:false,
            }, {
                field: 'Financial_Account__r.Total_Account_Value__c',
                name: 'Account Value',
                enableColumnMenu:false,
                cellFilter: 'currency',
                cellTemplate: '<div><div class="ui-grid-cell-contents isNumeric" title="TOOLTIP">{{COL_FIELD CUSTOM_FILTERS}}</div></div>'
            },
            {
                field: 'AccountValueOP',
                name: 'Account Value - OP',
                enableColumnMenu:false,
                cellFilter: 'currency',
                footerCellFilter: 'currency',
                aggregationType: uiGridConstants.aggregationTypes.sum, displayName: 'Total OP Value',
                cellTemplate: '<div><div class="ui-grid-cell-contents isNumeric" title="TOOLTIP">{{COL_FIELD CUSTOM_FILTERS}}</div></div>',
                footerCellTemplate:'<div><div class="ui-grid-cell-contents isNumeric">{{col.aggregationValue|currency}}</div></div>'
            },
            {
                field: 'AccountValueIP',
                name: 'Account Value - IP',
                enableColumnMenu:false,
                cellFilter: 'currency',
                footerCellFilter: 'currency',
                aggregationType: uiGridConstants.aggregationTypes.sum, displayName: 'Total IP Value',
                cellTemplate: '<div><div class="ui-grid-cell-contents isNumeric" title="TOOLTIP">{{COL_FIELD CUSTOM_FILTERS}}</div></div>',
                footerCellTemplate:'<div><div class="ui-grid-cell-contents isNumeric">{{col.aggregationValue|currency}}</div></div>'
            }],
            
            onRegisterApi: function(gridApi) {
                $scope.gridApi = gridApi;
            }
        };

        function applyRules(fas){
            var faN;
            var fapId;
            var faType;
            var fa;
            var faMap = [];
            for(var i=0;i<fas.length;i++)
            {
                faN = fas[i].Financial_Account__r.Account_Number__c;
                fapId = fas[i].Id;
                faType = (fas[i].Role__c =='Interested Party')?'i':'o';
                fa = _.find(faMap,{'faNum':faN});
                if(!fa)
                {
                    faMap.push({'faNum':faN,'type':faType,'Id':fapId});
                }
                else if(fa.type=='i'&&faType=='o')
                {
                    _.remove(faMap,{'faNum':faN});
                    faMap.push({'faNum':faN,'type':faType,'Id':fapId});
                }
            }
            for(var i=0;i<faMap.length;i++)
            {
                fa = _.find(fas,{'Id':faMap[i].Id});
                
                if(faMap[i].type=='o')
                {
                    fa.AccountValueOP = fa.Financial_Account__r.Total_Account_Value__c;
                }
                else
                {
                    fa.AccountValueIP = fa.Financial_Account__r.Total_Account_Value__c;
                }
                
            }
            return fas;
        }
        function getFields(obj) {
            vfr.describeFieldSet(obj.oName, obj.groupingFieldSet).then(function(results) {
                obj.shownFields = results;

                var add2Col = function(val, i, collection) {
                    var colDef = {};
                    colDef.field = val.fieldPath;
                    colDef.name = val.label;
                    return colDef;
                }
                makeQuery(obj);
            }).then(function(results) {
                return vfr.query(obj.query)
            }).then(function(results) {
                obj.data = results.records;
                var groupingLookup = obj.groupingField.substring(0, obj.groupingField.indexOf("__r.") + 2) + 'c';
                obj.data = applyRules(obj.data);
                $scope.gridOptions.data = obj.data;
                console.log(obj);
            }).catch(function(results) {
                console.error(results);
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
            obj.query += '(' + $scope.ids.join('","') + ')';
        }

        if ($scope.object1.oName) {
            getFields($scope.object1);
        }

        if ($scope.object2.oName) {
            getFields($scope.object2);
        }

    }])
