'use strict';

angular.module('piAuth.service', [])
  .factory('AuthenticationService', function ($http, $localStorage, piUrls, piConstants, dataLoader) {

    function Login(username, password, callback) {
      dataLoader.postData(piUrls.login, {username, password}, (err, data) => {
        if (err) {
          return callback(err.message);
        }
        data = data.data;
        const roles = Object.values(piConstants.roles);
        if (roles.indexOf(data.user.role) < 0) {
          callback("Message.error.permission");
        } else {
          let currentUser = {token: data.token, ...data.user};
          $localStorage.currentUser = currentUser;
          // add jwt token to auth header for all request made by the $http service
          $http.defaults.headers.common.Authorization = "Bearer " + data.token;
          // execute call back with true to indicate successful login
          callback(null, currentUser);
        }
      })
    }

    function Logout() {
      // remove user from local storage and clear http auth header
      delete $localStorage.currentUser;
      $http.defaults.headers.common.Authorization = "";
    }

    return {
      Login: Login,
      Logout: Logout
    }
  });