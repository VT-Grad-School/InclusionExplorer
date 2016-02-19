'use strict';
angular.module('inclusionApp')
  .directive('navigation', ['$rootScope', '$q', '$location', function ($rootScope, $q, $location) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'views/directives/navigation.html',
      link: function ($scope) {

        $scope.isActive = function (path) {
          return $location.path() === path;
        };
      },
    };
  }]);