'use strict';

angular.module('pisignage.services')
  .factory('dataLoader', function ($http, piUrls, piConstants, $state, $rootScope) {

    return {
      // options: method, url, params or data ...
      fetchApi(options, cb) {
        if (!cb) {
          return new Promise((resolve, reject) => {
            $http(options)
              .success((data, status) => {
                if (status === piConstants.HTTP_SUCCESS) return resolve(data)
                reject(data)
              })
              .error((data, status) => {
                reject(data)
              })
          })
        } else {
          $http(options)
            .success((data, status) => {
              if (status === piConstants.HTTP_SUCCESS) {
                cb(null, data)
              } else {
                cb(data, status)
              }
            })
            .error((err, status) => {
              cb(err, status)
            })
        }
      },

      fetchData(url, params = {}, cb = null) {
        // console.log("params loader",params)
        let options = {method: 'GET', url, params};
        if (!cb) return new Promise((resolve, reject) => {
          this.fetchApi(options)
            .then(data => resolve(data.data))
            .catch(err => reject(err))
        });

        return this.fetchApi(options, (err, data) => {
          if (err) return cb(err, data);

          return cb(null, data.data);
        });
      },

      postData(url, params, cb = null) {
        return this.fetchApi({method: 'POST', url, data: params}, cb)
      },

      putData(url, params, cb = null) {
        return this.fetchApi({method: 'PUT', url, data: params}, cb)
      },

      deleteData(url, params, cb = null) {
        return this.fetchApi({method: 'DELETE', url, params}, cb)
      },

      getUsers(params = null) {
        return this.fetchData(piUrls.users, params)
      },

      getUsersDisabled(params = null) {
        return this.fetchData(piUrls.users_disabled, params)
      },

      getAccounts(params = null) {
        return this.fetchData(piUrls.accounts, params)
      },

      getRoles(params = null) {
        return this.fetchData(`${piUrls.users}/getRoles`, params)
      },
      
      getAreas(params = null) {
        return this.fetchData(piUrls.areas, params)
      }
    }
  });
