angular.module('inclusionApp')
  .directive('navigation', ['$rootScope', '$q', function ($rootScope, $q) {
    return {
      restrict: 'E',
      templateUrl: 'views/directives/navigation.html',
      link: function ($scope, iElement, iAttrs) {
        $scope.deferredSearch = {};
        $scope.searchNodes = function (query) {
          $scope.deferredSearch[query] = $q.defer();
          $rootScope.$emit('searchNodes', {
            query: query,
          });
          return $scope.deferredSearch[query];
        };

        $rootScope.$on('nodeSearchResults', function (evt, resultsObj) {
          console.log(resultsObj);
          $scope.deferredSearch[resultsObj.query].resolve(resultsObj.results);
          delete $scope.deferredSearch[resultsObj.query];
        });
      },
    };
  }]);