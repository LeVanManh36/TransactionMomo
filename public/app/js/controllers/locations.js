'use strict'

angular.module('controllers.locations', [])
  .controller('AreaCtrl',
    function ($scope, myUrls, $modal, ngPopup, dataLoader, ngDataTable) {

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

        return dataLoader.getAreas($scope.filters)
          .then(data => {
            let {filters, ...others} = data;
            $scope.objects = {...$scope.objects, ...others};
            params.total($scope.objects.total);
            return data.list_data;
          })
          .catch(err => {
            console.log('dataLoader.getAreas error:', err)
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
              templateUrl: '/app/views/Area/components/form.html',
              scope: $scope
            })
        },

        edit(obj) {
          $scope.selectedObject = obj;
          $scope.newObject = Object.assign({}, obj);
          $scope.modal = $modal
            .open({
              templateUrl: '/app/views/Area/components/form.html',
              scope: $scope
            })
        },

        delete(obj) {
          ngPopup.confirm(
            {
              confirmText: "Confirm.delete.areas",
              replacement: {subject: obj.name}
            },
            () => {
              let params = {hardDelete: true};
              dataLoader.deleteData(`${myUrls.areas}/${obj._id}`, params, (err, data) => {
                if (!err) {
                  $scope.tableParams.reload();

                  ngPopup.status({
                    title: 'Breadcrumb.areas.delete',
                    msg: data.message
                  })
                } else {
                  // console.log('Delete Area error: ', err, '-- status:', data);
                  ngPopup.status({
                    title: 'Breadcrumb.areas.delete',
                    msg: err.message
                  })
                }
              })
            }
          )
        },

        save() {
          let params = $scope.newObject;
          dataLoader.postData(myUrls.areas, params, (err, data) => {
            if (!err) {
              $scope.tableParams.reload();
              $scope.fn.abort();

              ngPopup.status({
                title: 'Breadcrumb.areas.create',
                msg: data.message
              })
            } else {
              // console.log('Save Area error: ', err, '-- status:', data);
              $scope.statusMsg = err.message;
            }
          })
        },

        update() {
          let params = $scope.newObject;
          dataLoader.putData(`${myUrls.areas}/${params._id}`, params, (err, data) => {
            if (!err) {
              $scope.tableParams.reload();
              $scope.fn.abort();

              ngPopup.status({
                title: 'Breadcrumb.areas.edit',
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
