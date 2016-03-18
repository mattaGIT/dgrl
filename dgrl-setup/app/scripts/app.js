var dgrlSetup = angular.module('myApp', ['ngMaterial', 'ngMessages', 'templates', 'ngForce', 'ngAnimate', 'sf'])
    .directive('dgrlSetup', function() {
        return {
            templateUrl: 'views/main.html'
        }
    })
    // .config(function($stateProvider, $urlRouterProvider) {
    //
    //     $stateProvider
    //
    //     // route to show our basic form (/form)
    //
    //     // nested states
    //     // each of these sections will have their own view
    //     // url will be nested (/form/profile)
    //     .state('objects', {
    //         url: '/objects.html',
    //         templateUrl: 'views/objects.html'
    //     })
    //
    //     // url will be /form/interests
    //     .state('fields', {
    //         url: '/fields.html',
    //         templateUrl: 'views/fields.html'
    //     })
    //
    //     // catch all route
    //     // send users to the form page
    //     $urlRouterProvider.otherwise('/objects.html');
    // })
    .directive('relatedObject', function() {
        var controller = function($scope) {
            // $scope.isJoiner = ($scope.relationship.type == 'joiner');
            // $scope.relationship.order = $scope.$index;
        }
        return {
            templateUrl: 'views/related.html',
            controller: controller
        }
    })
    .controller('mainCtrl', function($scope, $templateCache, vfr, $timeout, sf, $mdDialog) {

        //for matching
        function textMatch(query) {
            var lowercaseQuery = angular.lowercase(query);
            return function filterFn(item) {
                return (item.value.indexOf(lowercaseQuery) != -1);
            };
        }

        function lookupMatch() {
            return function filterFn(item) {
                return (item.Reference.length != 0);
            };
        }

        function lowerCaseResults(results) {
            return results.map(function(result) {
                result.value = result.Name.toLowerCase();
                return result;
            });
        }

        function filterResults(searchText, results, filterCond) {
            results = searchText ? results.filter(textMatch(searchText)) : results;
            results = filterCond ? results.filter(filterCond(results)) : results;
            return results;
        }
        ///main vars
        console.log(sf.Id);
        var self = this;
        self.dgrl = {
            'name': sf.name,
            'id': sf.id
        };
        // self.mainObject = {};
        self.relationships = [];
        self.relationships.push({
            type: 'main'
        });
        //query vars
        self.sObjects = [];
        self.fields = [];

        //queries
        self.getDescribeSobjects = vfr.send('DGRL_Setup.getSobjectNames', vfr.standardOptions, false);
        self.getFieldDescribe = vfr.send('DGRL_Setup.getFieldDescribe', vfr.standardOptions, false);


        //binding with database sfdc->client
        self.getSO = function(searchText) {
            if (self.sObjects.length == 0)
                return self.getDescribeSobjects().then(function(results) {
                    self.sObjects = lowerCaseResults(results);
                    return filterResults(searchText, self.sObjects);
                })
            else {
                return filterResults(searchText, self.sObjects);
            }
        };
        self.getFD = function(searchText, r) {
            return self.getFieldDescribe(r.object.Name).then(function(results) {
                r.fields = lowerCaseResults(results);
                // self.fields = _.union(self.fields, r.fields);
                return filterResults(searchText, r.fields, lookupMatch);
            })
        };


        //dataBinding
        self.getObjects = function(searchText, r) {
            return self.getFieldDescribe(r.object.Name).then(function(results) {
                self.fields = _.union(self.fields, r.fields);
            })
        };

        self.saveObjects = function(searchText, r) {
            var dgrl = {
                'Name': self.dgrl.name,
                'Name__c': self.dgrl.name
            };
            var savePromise = function() {
                return vfr.upsert('DGRL__c', 'Name__c', sf.Name__c, JSON.stringify(dgrl)).then(
                    function(results) {
                        console.log(results);
                    },
                    function(results) {
                        console.log(results);
                    }
                )
            }
            return savePromise();
        };

        //utils for data structure with database sfdc->client
        self.updateFields = function(searchText, r) {
            return self.getFieldDescribe(r.object.Name).then(function(results) {
                self.fields = _.union(self.fields, r.fields);
            })
        };
        //for the fab button
        self.addRelationship = function(type) {
            if (self.relationships.length != 0) {
                var relationship = {
                    'type': type,
                    'parentObject': self.relationships[self.relationships.length - 1]
                };
            } else {
                var relationship = {
                    'type': type,
                    'parentObject': self.mainObject
                };
            }

            self.relationships.push(relationship);
        };

        //fab code
        $scope.addFAB = {};
        $scope.addFAB.isOpen = true;
        $scope.addFAB.tooltipVisible = false;
        // On opening, add a delayed property which shows tooltips after the speed dial has opened
        // so that they have the proper position; if closing, immediately hide the tooltips
        $scope.$watch('addFAB.isOpen', function(isOpen) {
            if (isOpen) {
                $timeout(function() {
                    $scope.addFAB.tooltipVisible = $scope.addFAB.isOpen;
                }, 600);
            } else {
                $scope.addFAB.tooltipVisible = $scope.addFAB.isOpen;
            }
        });
        //translation

    })
    .config(function($mdThemingProvider) {
        // Configure a dark theme with primary foreground yellow
        $mdThemingProvider.theme('docs-dark', 'default')
            .primaryPalette('light-blue')
            .dark();

    })
