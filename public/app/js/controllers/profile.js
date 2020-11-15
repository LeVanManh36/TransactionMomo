'use strict'

angular.module('controllers.profiles', [])
  .controller('ProfileCtrl', function ($scope, piUrls, ngPopup, $localStorage, $location, $window, dataLoader) {

    $scope.object = {};
    $scope.statusMsg = null;

    $scope.fn = {
      changePw() {
        dataLoader.postData(piUrls.changePassword, $scope.object)
          .then(data => {
            $scope.fn.abort();

            ngPopup.status(
              {
                title: 'Breadcrumb.accounts.changePassword',
                msg: data.message
              },
              () => {
                delete $localStorage.currentUser;
                $location.path("login");
              }
            )
          })
          .catch(err => {
            // $scope.statusMsg = err.message;
            ngPopup.status(
              {
                title: 'Breadcrumb.accounts.changePassword',
                msg: err.message
              }
            )
          })
      },

      back() {
        $window.history.back()
      },

      abort() {
        $scope.object = {};
        $scope.statusMsg = null;
      },

      changeNewPw() {
        $scope.statusMsg = null;
      }
    };
  });
