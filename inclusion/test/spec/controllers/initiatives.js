'use strict';

describe('Controller: InitiativesCtrl', function () {

  // load the controller's module
  beforeEach(module('inclusionApp'));

  var InitiativesCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    InitiativesCtrl = $controller('InitiativesCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(InitiativesCtrl.awesomeThings.length).toBe(3);
  });
});
