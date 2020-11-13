'use strict'

angular.module('piCompanies.controllers', [])
  .controller('CompanyCtrl',
    function ($scope, piUrls, $modal, piPopup, dataLoader, piNgTable) {

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
        $scope.filters = piNgTable.setConditions(params);

        return dataLoader.getCompanies($scope.filters)
          .then(data => {
            let {filters, ...others} = data;
            $scope.objects = {...$scope.objects, ...others};
            params.total($scope.objects.total);
            return data.list_data;
          })
          .catch(err => {
            console.log('dataLoader.getCompanies error:', err)
          })
      }

      var initTable = () => {
        $scope.tableParams = piNgTable.init(
          reloadData,
          piNgTable.default.option,
          piNgTable.default.counts
        )
      }

      initTable();

      $scope.$on('modal.shown', function () {
        console.log('Modal is shown!');
      });

      $scope.newObject = {};
      $scope.statusMsg = null;
      $scope.selectedObject = null;

      $scope.fn = {
        add() {
          $scope.selectedObject = null;
          $scope.newObject = {};

          $scope.modal = $modal
            .open({
              templateUrl: '/app/views/Company/components/form.html',
              scope: $scope
            })
        },

        edit(obj) {
          $scope.selectedObject = obj;
          $scope.newObject = Object.assign({}, obj);

          $scope.modal = $modal
            .open({
              templateUrl: '/app/views/Company/components/form.html',
              scope: $scope
            })
        },

        delete(obj) {
          piPopup.confirm(
            {
              confirmText: "Confirm.delete.company",
              replacement: {subject: obj.name}
            },
            () => {
              let params = {hardDelete: true};
              dataLoader.deleteData(`${piUrls.companies}/${obj._id}`, params, (err, data) => {
                if (!err) {
                  $scope.tableParams.reload();

                  piPopup.status({
                    title: 'Breadcrumb.companies.delete',
                    msg: data.message
                  })
                } else {
                  piPopup.status({
                    title: 'Breadcrumb.companies.delete',
                    msg: err.message
                  })
                }
              })
            }
          )
        },

        save() {
          let params = $scope.newObject;
          if (!Number.isInteger(params.storageConfig.capacity) || params.storageConfig.capacity < 0) {
            return $scope.statusMsg = 'Validate.invalid.capacity';
          }

          dataLoader.postData(piUrls.companies, params, (err, data) => {
            if (!err) {
              $scope.tableParams.reload();
              $scope.fn.abort();

              piPopup.status({
                title: 'Breadcrumb.companies.create',
                msg: data.message
              })
            } else {
              $scope.statusMsg = err.message;
            }
          })
        },

        update() {
          let params = $scope.newObject;
          if (!Number.isInteger(params.storageConfig.capacity) || params.storageConfig.capacity < 0) {
            return $scope.statusMsg = 'Validate.invalid.capacity';
          }

          dataLoader.putData(`${piUrls.companies}/${params._id}`, params, (err, data) => {
            if (!err) {
              $scope.tableParams.reload();
              $scope.fn.abort();

              piPopup.status({
                title: 'Breadcrumb.companies.edit',
                msg: data.message
              })
            } else {
              $scope.statusMsg = err.message;
            }
          })
        },

        abort() {
          $scope.newObject = {};
          $scope.statusMsg = null;
          $scope.selectedObject = null;
          $scope.modal.close();
        },

        changeUnique() {
          $scope.statusMsg = null;
        }
      };
    });
