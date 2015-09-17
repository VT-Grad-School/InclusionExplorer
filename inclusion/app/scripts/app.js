'use strict';

/**
 * @ngdoc overview
 * @name inclusionApp
 * @description
 * # inclusionApp
 *
 * Main module of the application.
 */
angular
  .module('inclusionApp', [
    'ngAnimate',
    'ngAria',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main',
        reloadOnSearch: false,
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'about'
      })
      .when('/contact', {
        templateUrl: 'views/contact.html',
      })
      // .when('/initiatives', {
      //   templateUrl: 'views/initiatives.html',
      //   controller: 'InitiativesCtrl',
      //   controllerAs: 'initiatives'
      // })
      .otherwise({
        redirectTo: '/'
      });
  });
