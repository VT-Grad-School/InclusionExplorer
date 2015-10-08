'use strict';

/**
 * @ngdoc function
 * @name inclusionApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the inclusionApp
 */
angular.module('inclusionApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomePeople = [
      'Karen DePauw',
      'Dannette Gomez Beane',
      'Marcy Schnitzer',
      'Stephanie House-Niamke',
      'Roxanna Link',
      'Isabella Sereno Berrizbeitia',
      'Maria Elisa Christie',
      'Nathan Self',
      'Michael Stewart',
    ];
  });
