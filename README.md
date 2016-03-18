# Dynamic Groupable Related List

A package to quickly create complex custom related list. 

## Installation and Setup

1. Click the install link on the design library page

2. Go to the DGRL Setup tab
	
	* define the objects you will query
	* specify the fields to use in the list
	* specify the order and grouping
	* specify the built in aggregate functions for your groupings
	* provide a unique name

3. Create a wrapper visualforce page with the following markup:

	```java
	    <apex:page standardController="<objectController>" applyBodyTag="false">
	        <c:DGRL DGRLName="<dgrlName>" mainObjectId="{!Id}"></c:DGRL>
	    </apex:page>
	```

	* ***objectController*** would be the name of the object in the detail page. For example, if the DGRL is going on the Account detail page this would be "Account"
	* ***dgrlName*** would be DGRL__c.Name specified in step 2 above.

4. Go to the page layout editor for the detail page in question and drag the page onto the page layout.

## Code to Implement
Currently the package is not completely dynamic. As a result, you will need to write some javascript before ui-grid will show anything. What follows are what you will need to do.

All code to edit is in the DGRL.resource in a single file: ***scripts/main.js***

### 

### ColumnDef

Review documentation on the [ColumnDef](http://ui-grid.info/docs/#/api/ui.grid.cellNav.api:ColumnDef) ui-grid parameter. The purpose of this parameter is to customize various column settings like the name of the header.

The most importand attribute of this step is the ***field*** attribute. This should match the SFDC api name of the field.

Here is an example of this:

```javascript
$scope.gridOptions = {
        rowHeight: 23,
        showGridFooter: false,
        showColumnFooter: true,
        enableFiltering: false,
        enableSorting: true,
        groupingShowCounts: false,
        enableHorizontalScrollbar:uiGridConstants.scrollbars.NEVER,
        columnDefs: [{
                name: 'Person / Entity',
                displayName: 'Person / Entity',
                field: 'Entity__r.Name',
                width: '15%',
                enableColumnMenu: false,
                cellTooltip: true,
                headerTooltip:true,
                grouping: {
                    groupPriority: 0
                },
                sort: {
                    priority: 1,
                    direction: 'asc'
                },
                cellClass: 'grid-align',
                cellTemplate: '<div class="ui-grid-cell-contents"><a ng-if="!col.grouping || col.grouping.groupPriority === undefined || col.grouping.groupPriority === null || ( row.groupHeader && col.grouping.groupPriority === row.treeLevel )" target="_parent" href="{{grid.appScope.baseURL}}/{{grid.appScope.getId(row)}}" >{{COL_FIELD}}</a></div>'
            }, {
                name: 'Prism',
                displayName: '',
                field: 'Prism__c',
                enableColumnMenu: false,
                width: '30',
                cellTemplate: '<div class="ui-grid-cell-contents"><a ng-if="!row.groupHeader" target="_parent" href="http://prism.nb.com/AcctSpecificReports/default.aspx?acctno={{row.entity.Financial_Account__r.Account_Number__c}}" ><img src=https://nbhnw--c.na12.content.force.com/servlet/servlet.ImageServer?id=015U0000002pUXW&oid=00DU0000000LyEC> </a></div>'
            }, {
                name: 'Account #',
                field: 'Financial_Account__r.Account_Number__c',
                enableColumnMenu: false,
                cellTooltip: true,
                headerTooltip:true,
                sort: {
                    priority: 2,
                    direction: 'asc'
                },
                cellTemplate: '<div class="ui-grid-cell-contents"><a target="_parent" href="/{{row.entity.Financial_Account__c}}" class="ui-grid-cell-contents">{{COL_FIELD CUSTOM_FILTERS}}</a></div>'
            }, {
                name: 'Account Name',
                field: 'Account_Name__c',
                width: '15%',
                enableColumnMenu: false,
                cellTooltip: true,
                headerTooltip:true
            }, {
                name: 'Relationship / Role',
                field: 'Relationship_Role__c',
                width: '15%',
                enableColumnMenu: false,
                cellTooltip: true,
                headerTooltip:true
            },

            {
                field: 'Account_Status__c',
                name: 'Account Status',
                enableColumnMenu: false,
                cellTooltip: true,
                headerTooltip:true
            }, {
                field: 'Financial_Account__r.Manager_Sales_Code__c',
                name: 'Manager / Sales Code',
                enableColumnMenu: false,
                cellTooltip: true,
                headerTooltip:true
            }, {
                name: 'Discretionary',
                field: 'Discretionary__c',
                enableColumnMenu: false,
                cellTooltip: true,
                headerTooltip:true
            }, {
                field: 'AccountValueOP',
                name: 'Account Value - OP',
                width: '9%',
                enableColumnMenu: false,
                cellTooltip: true,
                headerTooltip:true,
                displayName: 'Total OP Value',
                customTreeAggregationFinalizerFn: function(aggregation) {
                    aggregation.rendered = aggregation.value;
                },
                cellFilter: 'currency',
                footerCellFilter: 'currency',
                treeAggregationType: uiGridGroupingConstants.aggregation.SUM,
                cellTemplate: '<div><div class="ui-grid-cell-contents isNumeric" title="TOOLTIP">{{COL_FIELD CUSTOM_FILTERS}}</div></div>',
                footerCellTemplate: '<div><div class="ui-grid-cell-contents isNumeric">{{grid.appScope.grandTotal.op|currency}}</div></div>'
            }, {
                field: 'AccountValueIP',
                name: 'Account Value - IP',
                width: '9%',
                cellTooltip: true,
                headerTooltip:true,
                enableColumnMenu: false,
                displayName: 'Total IP Value',
                customTreeAggregationFinalizerFn: function(aggregation) {
                    aggregation.rendered = aggregation.value;
                },
                cellFilter: 'currency',
                footerCellFilter: 'currency',
                treeAggregationType: uiGridGroupingConstants.aggregation.SUM,
                cellTemplate: '<div><div class="ui-grid-cell-contents isNumeric" title="TOOLTIP">{{COL_FIELD CUSTOM_FILTERS}}</div></div>',
                footerCellTemplate: '<div><div class="ui-grid-cell-contents isNumeric">{{grid.appScope.grandTotal.ip|currency}}</div></div>'
            }
        ], 
```