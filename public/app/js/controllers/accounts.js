'use strict'

angular.module('controllers.accounts', [])
  // Controller manage accounts admin
  .controller('AccountsCtrl', function ($scope, piUrls, $state, $modal, $window, piPopup, dataLoader, ngDataTable) {

    $scope.objects = {
      list_data: [],
      total: 0,
      skip: 0,
      limit: 0
    };

    $scope.filters = {
      init: true,
      currentPage: 0,
      pageSize: 10,
      "sorting[]": [],
      "filters[]": []
    };

    var reloadData = (params) => {
      $scope.filters = ngDataTable.setConditions(params);

      return dataLoader.getAccounts($scope.filters)
        .then(data => {
          let {filters, ...others} = data;
          $scope.objects = {...$scope.objects, ...others};
          params.total($scope.objects.total);
          return data.list_data;
        })
        .catch(err => {
          console.log('dataLoader.getAccounts error:', err)
        })
    }

    var initTable = () => {
      $scope.tableParams = ngDataTable.init(
        reloadData,
        ngDataTable.default.option,
        ngDataTable.default.counts
      )
    }

    initTable();

    $scope.newUser = {};
    $scope.statusMsg = null;
    $scope.selectedUser = null;

    $scope.$on('modal.shown', function () {
      console.log('Modal is shown!');
    });

    $scope.fn = {
      add() {
        $scope.selectedUser = null;
        $scope.newUser = {};
        $scope.modal = $modal
          .open({
            templateUrl: '/app/views/Account/components/admin-form.html',
            scope: $scope
          })
      },

      edit(user) {
        $scope.selectedUser = user;
        $scope.newUser = Object.assign({}, user);
        $scope.modal = $modal
          .open({
            templateUrl: '/app/views/Account/components/admin-form.html',
            scope: $scope
          })
      },

      delete(user) {
        piPopup.confirm(
          {
            confirmText: "Confirm.delete.account",
            replacement: {subject: user.email}
          },
          () => {
            dataLoader.deleteData(`${piUrls.accounts}/${user._id}`, {}, (err, data) => {
              if (!err) {
                $scope.tableParams.reload();

                piPopup.status({
                  title: 'Breadcrumb.accounts.delete',
                  msg: data.message
                })
              } else {
                piPopup.status({
                  title: 'Breadcrumb.accounts.delete',
                  msg: err.message
                })
              }
            });
          }
        )
      },

      save() {
        let params = $scope.newUser;
        dataLoader.postData(piUrls.accounts, params, (err, data) => {
          if (!err) {
            $scope.tableParams.reload();
            $scope.fn.abort();

            piPopup.status({
              title: 'Breadcrumb.accounts.create',
              msg: data.message
            })
          } else {
            $scope.statusMsg = err.message;
          }
        })
      },

      update() {
        let params = $scope.newUser;
        dataLoader.putData(`${piUrls.accounts}/${params._id}`, params, (err, data) => {
          if (!err) {
            $scope.tableParams.reload();
            $scope.fn.abort();

            piPopup.status({
              title: 'Breadcrumb.accounts.edit',
              msg: data.message
            })
          } else {
            $scope.statusMsg = err.message;
          }
        })
      },

      abort() {
        $scope.newUser = {};
        $scope.statusMsg = null;
        $scope.selectedUser = null;
        $scope.modal.close();
      },

      changeEmail() {
        $scope.statusMsg = null;
      },

      resetPwd(user) {
        piPopup.confirm(
          {
            confirmText: "Confirm.resetPassword",
            replacement: {subject: user.email}
          },
          () => {
            dataLoader.putData(`${piUrls.resetPassword}/${user._id}`, {}, (err, data) => {
              piPopup.status({
                title: 'Breadcrumb.auth.resetPassword',
                msg: err ? err.message : data.message
              })
            });
          }
        )
      }
    };
  })
  // Controller manage accounts normal
  .controller('UserCtrl', function ($scope, piUrls, $state, $modal, $window, piPopup, dataLoader, ngDataTable) {

    $scope.companies = [];

    $scope.roles = [];
    $scope.roleOptions = {};
    dataLoader.getRoles()
      .then(data => {
        $scope.roles = data.map(({value, label}) => {
          label = `Roles.${label}`
          $scope.roleOptions[value] = label;
          return {value, label}
        })
      })
      .catch(err => {
        console.log('dataLoader.getRoles error:', err)
      });

    $scope.objects = {
      list_data: [],
      total: 0,
      skip: 0,
      limit: 0
    };

    $scope.filters = {
      init: true,
      currentPage: 0,
      pageSize: 10,
      "sorting[]": [],
      "filters[]": []
    };

    var reloadData = (params) => {
      $scope.filters = ngDataTable.setConditions(params);

      return dataLoader.getUsers($scope.filters)
        .then(data => {
          let {filters, ...others} = data;
          $scope.objects = {...$scope.objects, ...others};
          params.total($scope.objects.total);
          return data.list_data;
        })
        .catch(err => {
          console.log('dataLoader.getUsers error:', err)
        })
    }

    var initTable = () => {
      $scope.tableParams = ngDataTable.init(
        reloadData,
        ngDataTable.default.option,
        ngDataTable.default.counts
      )
    }

    initTable();

    $scope.newUser = {};
    $scope.statusMsg = null;
    $scope.selectedUser = null;

    $scope.$on('modal.shown', function () {
      console.log('Modal is shown!');
    });

    $scope.fn = {
      add() {
        $scope.selectedUser = null;
        $scope.newUser = {};
        $scope.modal = $modal
          .open({
            templateUrl: '/app/views/Account/components/user-form.html',
            scope: $scope
          })
      },

      edit(user) {
        $scope.selectedUser = user;
        $scope.newUser = Object.assign({}, user);
        $scope.modal = $modal
          .open({
            templateUrl: '/app/views/Account/components/user-form.html',
            scope: $scope
          })
      },

      delete(user) {
        piPopup.confirm(
          {
            confirmText: "Confirm.delete.account",
            replacement: {subject: user.email}
          },
          () => {
            dataLoader.deleteData(`${piUrls.users}/${user._id}`, {}, (err, data) => {
              if (!err) {
                $scope.tableParams.reload();

                piPopup.status({
                  title: 'Breadcrumb.accounts.delete',
                  msg: data.message
                })
              } else {
                piPopup.status({
                  title: 'Breadcrumb.accounts.delete',
                  msg: err.message
                })
              }
            });
          }
        )
      },

      save() {
        let params = $scope.newUser;
        dataLoader.postData(piUrls.users, params, (err, data) => {
          if (!err) {
            $scope.tableParams.reload();
            $scope.fn.abort();

            piPopup.status({
              title: 'Breadcrumb.accounts.create',
              msg: data.message
            })
          } else {
            $scope.statusMsg = err.message;
          }
        })
      },

      update() {
        let params = $scope.newUser;
        dataLoader.putData(`${piUrls.users}/${params._id}`, params, (err, data) => {
          if (!err) {
            $scope.tableParams.reload();
            $scope.fn.abort();

            piPopup.status({
              title: 'Breadcrumb.accounts.edit',
              msg: data.message
            })
          } else {
            $scope.statusMsg = err.message;
          }
        })
      },

      abort() {
        $scope.newUser = {};
        $scope.statusMsg = null;
        $scope.selectedUser = null;
        $scope.modal.close();
      },

      changeEmail() {
        $scope.statusMsg = null;
      },

      resetPwd(user) {
        piPopup.confirm(
          {
            confirmText: "Confirm.resetPassword",
            replacement: {subject: user.email}
          },
          () => {
            dataLoader.putData(`${piUrls.resetPassword}/${user._id}`, {}, (err, data) => {
              piPopup.status({
                title: 'Breadcrumb.auth.resetPassword',
                msg: err ? err.message : data.message
              })
            });
          }
        )
      },

      lockAcc(user) {
        piPopup.confirm(
          {
            confirmText: "Confirm.lockAccount",
            replacement: {subject: user.email}
          },
          () => {
            dataLoader.putData(`${piUrls.lockAcc}/${user._id}`, {}, (err, data) => {
              if (!err) {
                $scope.tableParams.reload();
              } else {
                console.log('lock account error: ', err);
              }
            });
          }
        )
      },

      unlockAcc(user) {
        piPopup.confirm(
          {
            confirmText: "Confirm.unlockAccount",
            replacement: {subject: user.email}
          },
          () => {
            dataLoader.putData(`${piUrls.unlockAcc}/${user._id}`, {}, (err, data) => {
              if (!err) {
                $scope.tableParams.reload();
              } else {
                console.log('unlock account error: ', err);
              }
            });
          }
        )
      },
    };
  })
  // Controller manage accounts in trash
  .controller('UsersDisabledCtrl', function ($scope, piUrls, $state, $modal, $window, piPopup, dataLoader, ngDataTable) {

    $scope.roles = [];
    $scope.roleOptions = {};
    dataLoader.getRoles()
      .then(data => {
        $scope.roles = data.map(({value, label}) => {
          label = `Roles.${label}`
          $scope.roleOptions[value] = label;
          return {value, label}
        })
      })
      .catch(err => {
        console.log('dataLoader.getRoles error:', err)
      });

    $scope.objects = {
      list_data: [],
      total: 0,
      skip: 0,
      limit: 0
    };

    $scope.filters = {
      init: true,
      currentPage: 0,
      pageSize: 10,
      "sorting[]": [],
      "filters[]": []
    };

    var reloadData = (params) => {
      $scope.filters = ngDataTable.setConditions(params);
      return dataLoader.getUsersDisabled($scope.filters)
        .then(data => {
          let {filters, ...others} = data;
          $scope.objects = {...$scope.objects, ...others};
          params.total($scope.objects.total);
          return data.list_data;
        })
        .catch(err => {
          console.log('dataLoader.getUsers error:', err)
        })
    }

    var initTable = () => {
      $scope.tableParams = ngDataTable.init(
        reloadData,
        ngDataTable.default.option,
        ngDataTable.default.counts
      )
    }

    initTable();

    $scope.fn = {

      delete(user) {
        piPopup.confirm(
          {
            confirmText: "Confirm.delete.account",
            replacement: {subject: user.email}
          },
          () => {
            dataLoader.deleteData(`${piUrls.users_disabled}/${user._id}`, {}, (err, data) => {
              if (!err) {
                $scope.tableParams.reload();

                piPopup.status({
                  title: 'Breadcrumb.accounts.delete',
                  msg: data.message
                })
              } else {
                piPopup.status({
                  title: 'Breadcrumb.accounts.delete',
                  msg: err.message
                })
              }
            });
          }
        )
      },

      restore(user) {
        piPopup.confirm(
          {
            confirmText: "Confirm.restoreAccount",
            replacement: {subject: user.email}
          },
          () => {
            dataLoader.putData(`${piUrls.users_disabled}/${user._id}`, {}, (err, data) => {
              if (!err) {
                $scope.tableParams.reload();

                piPopup.status({
                  title: 'Breadcrumb.accounts.restore',
                  msg: data.message
                })
              } else {
                piPopup.status({
                  title: 'Breadcrumb.accounts.restore',
                  msg: err.message
                })
              }
            })
          }
        )
      }
    };
  });
