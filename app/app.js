'use strict';

var app = angular.module('DGRL', []);

app.controller('listController', function(){
    var pageSizes, currentPageSize;

    $scope.gridOptions.data = simplifiedServices;

    // Options that set which features are enabled / disabled on UI-Grid
    $scope.gridOptions = {
        enableSorting: true,
        enableFiltering: true,
        enableGridMenu: false,
        groupUseEntireRow: true,
        treeRowHeaderAlwaysVisible: false,
        groupingNullLabel: 'Null', 
        paginationPageSizes: pageSizes, 
        paginationPageSize: currentPageSize,
        enableColumnMenus: false,
        columnDefs: [ 
            { name: 'field1', displayName: 'Investor Account', 
              grouping: {groupPriority: 0},
              sort: { priority: 0, direction: 'desc' },
              headerCellTemplate:'views/templateHeaderCell.html',
              //cellTemplate:'<div ng-if="row.groupHeader">{{row.entity[col.field]}}</div>',
              filter: {placeholder:"filter..."},
              filterHeaderTemplate: 'views/column-filter.html',
              enableHiding: false,
              cellTooltip: false, 
              headerToolTip: false 
            },  
            { name: 'field2', displayName: 'Fund', 
              enableHiding: false, 
              headerCellTemplate:'views/templateHeaderCell.html',
              filter: {placeholder:"filter..."},
              filterHeaderTemplate: 'views/column-filter.html',
              cellTooltip: false,
              headerToolTip: false
            },
            { name: 'field3', displayName: 'Service Type', 
              headerCellTemplate:'views/templateHeaderCell.html',
              filter: {term: '*', type: uiGridConstants.filter.SELECT, selectOptions: serviceTypes},
              filterHeaderTemplate: 'views/column-filter.html',
              enableHiding: false,
              cellTooltip: false,
              headerToolTip: false
            },
            { name: 'field4', displayName: 'Frequency', 
              headerCellTemplate:'views/templateHeaderCell.html',
              filter: {term: '*', type: uiGridConstants.filter.SELECT, selectOptions: frequencyTypes},
              filterHeaderTemplate: 'views/column-filter.html',
              enableHiding: false,
              cellTooltip: false,
              headerToolTip: false
            },
            { name: 'field5', displayName: 'Method', 
              headerCellTemplate:'views/templateHeaderCell.html',
              filter: {term: '*', type: uiGridConstants.filter.SELECT, selectOptions: methodTypes},
              filterHeaderTemplate: 'views/column-filter.html',
              enableHiding: false,
              cellTooltip: false,
              headerToolTip: false
            },
            { name: 'field6', displayName: 'Start Date', 
              enableFiltering: false, 
              enableHiding: false,
              cellTooltip: false,
              headerToolTip: false
            },
            { name: 'field7', displayName: 'Remove',
              cellTemplate: 'views/removeCellTemplate.html',
              enableFiltering: false, 
              enableHiding: false,
              cellTooltip: false,
              headerToolTip: false,
              enableSorting:false
            }
        ],
        onRegisterApi: function(gridApi) {
            $scope.gridApi = gridApi;
        }
    };
}]);