'use strict'

angular.module('controllers.authenticate', [])

  .controller('LoginController', function ($rootScope, $location, AuthenticationService) {
    var vm = this;
    vm.login = login;

    initController();

    function initController() {
      // reset login status
      AuthenticationService.Logout();
      $rootScope.authUser = null;
    }

    function login() {
      vm.loading = true;
      AuthenticationService.Login(vm.email, vm.password, (err, user) => {
        if (!err) {
          $rootScope.authUser = user;
          let redirectPath = '/transactions';
          if (user.role === 'root') redirectPath = "/accounts";
          if (user.role === 'admin') redirectPath = "/payments";
          $location.path(redirectPath);
        } else {
          vm.error = err || "Message.error.login";
          vm.loading = false;
        }
      });
    }
  });
