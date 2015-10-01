'use strict';
angular.module('inclusionApp')
  .directive('navigation', ['$rootScope', '$q', '$location', function ($rootScope, $q, $location) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'views/directives/navigation.html',
      link: function ($scope) {
        // $scope.$watch('searchQuery', function (newVal) {
        //   $rootScope.$emit('searchNodes', {
        //     query: newVal,
        //   });
        // });

        // $scope.location = $location;

        // $scope.searchNodes = function (query) {
        //   $scope.query = query;
        //   // console.log('searchNode', query.length);
        //   $scope.deferred = $q.defer();
        //   $rootScope.$emit('searchNodes', {
        //     query: query,
        //   });
        //   return $scope.deferred.promise;
        // };

        // $rootScope.$on('nodeSearchResults', function (evt, results) {
        //   // console.log(results);
        //   $scope.deferred.resolve(Object.keys(results.results));
        // });
      },
    };
  }]);