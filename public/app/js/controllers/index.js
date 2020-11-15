'use strict';

angular.module('controllers.index', [])

  .controller('IndexCtrl', function ($rootScope, $scope, $state, $location, piConstants) {

    let currentUser = $rootScope.authUser;
    let redirectPath = 'login';
    if (currentUser) {
      $rootScope.isRoleAdmin = currentUser.role === piConstants.roles.admin;
      if ($location.$$path === '/start') {
        redirectPath = '/devices';
        if (currentUser.role === 'root') redirectPath = "/accounts";
        if (currentUser.role === 'admin') redirectPath = "/users";
        $location.path(redirectPath);
      }
    } else {
      $location.path(redirectPath);
    }

    $scope.getClass = (state) => {
      if ($state.current.name.indexOf(state) == 0) {
        return "active"
      } else {
        return ""
      }
    }
  });
