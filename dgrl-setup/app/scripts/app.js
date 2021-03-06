var dgrlSetup = angular.module('myApp', ['ngMaterial', 'ngMessages', 'templates', 'ngForce', 'ngAnimate', 'sf','dgrl'])
    .directive('dgrlSetup', function() {
        return {
            templateUrl: 'views/main.html'
        }
    })

.directive('relatedObject', function() {
        return {
            controller: function($scope) {
                $scope.ctrl = {};
                $scope.getFD = $scope.main.getFD;
                $scope.relationship.fields = [];
                $scope.relationship.selected = [];
                $scope.transformChip = function(chip) {
                    // If it is an object, it's already a known chip
                    if (angular.isObject(chip)) {
                        return chip;
                    }

                    // Otherwise, create a new one
                    return { name: chip, type: 'new' }
                }
            },
            scope: {
                relationship: '=relationship',
                main: '='
            },
            templateUrl: 'views/related.html',
            replace: true
        }
    })
    .controller('mainCtrl', function($scope, $templateCache, vfr, $timeout, sf, $mdDialog, $mdToast) {

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

        function filterResults(searchText, results) {
            results = searchText ? results.filter(textMatch(searchText)) : results;
            // results = filterCond ? results.filter(filterCond(results)) : results;
            return results;
        }
        ///main vars
        var self = this;
        self.dgrl = {
            'name': sf.name,
            'id': sf.id
        };
        // self.mainObject = {};
        self.relationships = [];
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
        self.getSO();
        self.getFD = function(searchText, r) {
            if (r.fields.length == 0)
                return self.getFieldDescribe(r.Name).then(
                    function(results) {
                        r.fields = lowerCaseResults(results);
                        return filterResults(searchText, r.fields);
                    })
            else
                return filterResults(searchText, r.fields);
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


        self.noRelationships = true;

        self.checkEmpty = function() {
                if (self.relationships.length==0) {
                    self.showDialog('main');
                }
            }
            ////dialog

        $scope.$watch('relationships', function() {
            if (self.relationships.length != 0)
                self.noRelationships = false;
        });
        self.showDialog = function(type) {

            $mdDialog.show({
                    controller: DialogController,
                    templateUrl: 'views/objects.toast.html',
                    clickOutsideToClose: true,
                    fullscreen: false,
                    locals: {
                        main: $scope.main,
                        type: type
                    }
                })
                .then(function(o) {
                    self.relationships.push(o)
                }, function(o) {
                    // self.object = o;
                });

        };


        function DialogController($scope, $mdDialog, main, type) {
            $scope.main = main
            $scope.relationship = {};
            $scope.hide = function() {
                $mdDialog.hide($scope.o);
            };

            $scope.cancel = function() {
                $mdDialog.cancel($scope.o);
            };

            $scope.answer = function() {
                $scope.selectedObject.type = type
                $mdDialog.hide($scope.selectedObject);
            };
        }


    })
    .config(function($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('teal', {
                'default': '600', // by default use shade 400 from the pink palette for primary intentions
                'hue-1': '700', // use shade 100 for the <code>md-hue-1</code> class
                'hue-2': '700', // use shade 600 for the <code>md-hue-2</code> class
                'hue-3': '900' // use shade A100 for the <code>md-hue-3</code> class
            })
            // If you specify less than all of the keys, it will inherit from the
            // default shades
            .accentPalette('lime', {
                'default': '400' // use shade 200 for default, and keep all other shades the same
            });
    });


[{

}]
