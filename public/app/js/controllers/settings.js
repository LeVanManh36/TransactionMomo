'use strict'

angular.module('controllers.settings', [])
  .controller('SettingsCtrl', function ($scope, $rootScope, piUrls, dataLoader) {

    $scope.settings = {};
    // getSettings
    dataLoader.fetchData(piUrls.settings, {}, (err, data) => {
      if (err) {
        console.log('dataLoader.getSettings error', err);
      } else {
        $scope.settings = data;
      }
    });

    $scope.saveSettings = () => {
      dataLoader.postData(piUrls.settings, $scope.settings)
        .then(data => {
          $scope.settings = data.data;
        })
        .catch(err => {
          console.log('Update settings error', err)
        });
    }
  });
