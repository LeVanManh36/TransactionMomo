'use strict';

angular.module('piLabels.controllers', [])

  .controller('LabelCtrl', function ($scope, $modal, piConstants, piUrls, piPopup, dataLoader, piNgTable) {

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

      return dataLoader.getLabels($scope.filters)
        .then(data => {
          let {filters, ...others} = data;
          $scope.objects = {...$scope.objects, ...others};
          params.total($scope.objects.total);
          return data.list_data;
        })
        .catch(err => {
          console.log('dataLoader.getLabels error:', err)
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
    $scope.options = {};
    $scope.modes = piConstants.labelOptions;
    $scope.modes.map(item => {
      if (item.value) $scope.options[item.value] = item.label
    });

    $scope.fn = {
      add() {
        $scope.selectedObject = null;
        $scope.newObject = {};
        $scope.modal = $modal
          .open({
            templateUrl: '/app/views/Label/components/form.html',
            scope: $scope
          })
      },

      edit(obj) {
        // console.log('Edit: ', obj);
        $scope.selectedObject = obj;
        $scope.newObject = Object.assign({}, obj);
        $scope.modal = $modal
          .open({
            templateUrl: '/app/views/Label/components/form.html',
            scope: $scope
          })
      },

      delete(obj) {
        piPopup.confirm(
          {
            confirmText: "Confirm.delete.tags",
            replacement: {subject: obj.name}
          },
          () => {
            // console.log('Delete: ', obj);
            let params = {hardDelete: true};
            dataLoader.deleteData(`${piUrls.labels}/${obj._id}`, params, (err, data) => {
              if (!err) {
                $scope.tableParams.reload();

                piPopup.status({
                  title: 'Breadcrumb.tags.delete',
                  msg: data.message
                })
              } else {
                piPopup.status({
                  title: 'Breadcrumb.tags.delete',
                  msg: err.message
                })
              }
            })
          }
        )
      },

      save() {
        let params = $scope.newObject;
        dataLoader.postData(piUrls.labels, params, (err, data) => {
          if (!err) {
            $scope.tableParams.reload();
            $scope.fn.abort();

            piPopup.status({
              title: 'Breadcrumb.tags.create',
              msg: data.message
            })
          } else {
            $scope.statusMsg = err.message;
          }
        })
      },

      update() {
        // console.log('Update: ', $scope.newObject)
        let params = $scope.newObject;
        dataLoader.postData(`${piUrls.labels}/${params._id}`, params, (err, data) => {
          if (!err) {
            $scope.tableParams.reload();
            $scope.fn.abort();

            piPopup.status({
              title: 'Breadcrumb.tags.edit',
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
