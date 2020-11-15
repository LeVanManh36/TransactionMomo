'use strict';

//ims Admin services

angular.module('services.utils', [])
  //https://github.com/logicbomb/lvlFileUpload
  .factory('fileUploader', ['$rootScope', '$q', '$localStorage', function ($rootScope, $q, $localStorage) {
    let xhr, completeTransferDone;
    let svc = {
      post: function (files, data, progressCb) {
        
        return {
          to: function (uploadUrl) {
            let deferred = $q.defer()
            if (!files || !files.length) {
              deferred.reject("No files to upload");
              return;
            }
            
            xhr = new XMLHttpRequest();
            completeTransferDone = false;
            
            xhr.upload.onprogress = function (e) {
              $rootScope.$apply(function () {
                let percentCompleted;
                if (e.lengthComputable) {
                  if (e.loaded == e.total)
                    completeTransferDone = true;
                  percentCompleted = Math.round(e.loaded / e.total * 100);
                  if (progressCb) {
                    progressCb(percentCompleted);
                  } else if (deferred.notify) {
                    deferred.notify(percentCompleted);
                  }
                }
              });
            };
            
            xhr.onload = function (e) {
              $rootScope.$apply(function () {
                let ret = {
                  files: files,
                  data: {},
                  status: xhr.status
                };
                try {
                  ret.data = angular.fromJson(xhr.responseText)
                } catch (e) {
                  ret.data = "ResponseText Parsing error"
                }
                deferred.resolve(ret);
              })
            };
            
            xhr.upload.onerror = function (e) {
              let msg = xhr.responseText ? xhr.responseText : "An unknown error occurred posting to '" + uploadUrl + "'";
              $rootScope.$apply(function () {
                deferred.reject(msg);
              });
            }
            
            xhr.upload.onabort = function (e) {
              let msg = xhr.responseText ? xhr.responseText : "Abort uploading files to '" + uploadUrl + "'";
              deferred.reject({type: 'USER_ABORTED', msg: msg});
            }
            
            let formData = new FormData();
            if (data) {
              formData.append('data', JSON.stringify(data))
            }
            
            for (let idx = 0; idx < files.length; idx++) {
              formData.append('assets', files[idx]);
            }
            
            xhr.open("POST", uploadUrl);
            if ($localStorage.currentUser) {
              xhr.setRequestHeader('Authorization', 'Bearer ' + $localStorage.currentUser.token);
            }
            
            xhr.send(formData);
            
            return deferred.promise;
          }
        };
      },
      
      cancel: function () {
        xhr.upload.onprogress = function () {
        };
        if (!completeTransferDone) xhr.abort();
      }
    };
    
    return svc;
  }])
  
  .factory('onlineStatusInterceptor', ['$q', '$rootScope', function ($q, $rootScope) {
    let onlineStatus = false;
    
    return {
      response: function (response) {
        if (!onlineStatus) {
          onlineStatus = true;
          $rootScope.$broadcast('onlineStatusChange', onlineStatus);
        }
        return response || $q.when(response);
      },
      
      responseError: function (rejection) {
        if (onlineStatus) {
          onlineStatus = false;
          $rootScope.$broadcast('onlineStatusChange', onlineStatus);
        }
        return $q.reject(rejection);
      }
    };
  }])
  
  .factory('socket', function ($rootScope, piUrls) {
    let socket = io.connect(piUrls.base);
    
    return {
      io: socket,
      session: socket.socket,
      
      on: function (eventName, cb) {
        socket.on(eventName, function () {
          let args = arguments;
          $rootScope.$apply(() => {
            cb.apply(socket, args);
          });
        });
      },
      
      emit: function (eventName, data, cb) {
        socket.emit(eventName, data, function () {
          let args = arguments;
          $rootScope.$apply(() => {
            if (cb) cb.apply(socket, args);
          });
        })
      }
    };
  })
  
  .factory("ngPopup", ["$modal", function ($modal) {
    
    return {
      confirm: function (objString, cb, cbCancel) {
        return (
          $modal.open({
            templateUrl: '/app/views/components/confirm-popup.html',
            controller: [
              '$scope', '$modalInstance', 'msg',
              function ($scope, $modalInstance, msgObj) {
                if (!msgObj.title) {
                  msgObj.title = 'Popup.confirm.msg';
                }

                $scope.noPrepend = true;
                if (msgObj.text && msgObj.text.indexOf('--') === 0) {
                  $scope.noPrepend = false;
                  msgObj.text = msgObj.text.substring(2)
                }
                $scope.msgObj = msgObj;
                
                $scope.ok = function () {
                  $modalInstance.close('ok');
                  cb();
                };
                
                $scope.cancel = function () {
                  $modalInstance.dismiss('cancel');
                  if (cbCancel) cbCancel();
                };
              }
            ],
            resolve: {
              msg: function () {
                return typeof objString === "string" ? {text: objString} : {...objString};
              }
            }
          })
        )
      },
      
      status: function (objString, cb) {
        return (
          $modal.open({
            templateUrl: '/app/views/components/status-popup.html',
            controller: ['$scope', '$modalInstance', 'msg', function ($scope, $modalInstance, msgObj) {
              $scope.msgObj = msgObj;
              $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
                if (cb) cb();
              };
            }],
            resolve: {
              msg: function () {
                return {...objString};
              }
            }
          })
        )
      }
    }
  }])
  
  .factory('saveChangesPrompt', ['$rootScope', function ($rootScope) {
    
    let messages = {
      navigate: "You will loose unsaved changes if you leave this page",
      reload: "You will loose unsaved changes if you reload this page"
    };
    
    // empty return function
    // defined here because in some instances we call this
    // as a callback when it may not be defined, so defining here prevents the
    // need for `typeof` checks later on
    //
    var removeFunction = function () {
    };
    
    // check if form is dirty
    var isFormDirty = function (form) {
      let d = (form.$dirty) ? true : false;
      //console.log('ARE FORMS DIRTY? ' + d);
      return d;
    };
    
    return {
      init: function (form) {

        // @todo optimse this, because this code is duplicated.

        function confirmExit() {
          //console.log('REFRESH / CLOSE detected');
          // @todo this could be written a lot cleaner!
          
          if (isFormDirty(form)) {
            return messages.reload;
          } else {
            removeFunction();
            window.onbeforeunload = null;
          }
        }
        
        // bind our reload check to the window unload event
        // which is called when a user tries to close a tab, click back button, swipe back (iOS) or refresh the page
        window.onbeforeunload = confirmExit;
        
        // calling this function later will unbind this, acting as $off()
        removeFunction = $rootScope.$on('stateChangeStart', function (event, next, current) {

          //console.log('ROUTE CHANGE detected');
          // @todo this could be written a lot cleaner!

          if (isFormDirty(form)) {
            if (!confirm(messages.navigate)) {
              event.preventDefault(); // user clicks cancel, wants to stay on page
            } else {
              removeFunction(); // unbind our `locationChangeStart` listener
              window.onbeforeunload = null; // clear our the `refresh page` listener
            }
          } else {
            removeFunction(); // unbind our `locationChangeStart` listener
            window.onbeforeunload = null; // clear our the `refresh page` listener
          }

        });
      },

      // @todo need to support this somehow within the directive
      removeListener: function () {
        //console.log('CHOOSING TO REMOVE THIS FUNCTION');
        removeFunction();
        window.onbeforeunload = null;
      }
    }
  }])
  
  // get commands 
  .factory('commands', function () {
    
    let storedArr = ['*** Or use any bash command ***',
      'uptime',
      'date',
      'ifconfig',
      'ls ../media',
      'tail -200 /home/pi/forever_out.log'
    ];
    
    let current = storedArr.length;
    
    return {
      previous: function () { // get previous command
        --current;
        if (current <= 0) current = 0;
        return storedArr[current];
      },
      
      next: function () { // get next command
        ++current;
        if (current >= storedArr.length) current = storedArr.length;
        return storedArr[current];
      },
      
      save: function (cmd) { // save command
        storedArr.push(cmd);
        current = storedArr.length;
      }
    }
  })
  
  // read file input
  .factory('fileReader', function () {
    
    return {
      /** read file excel
       * option: cellDates = true/false, cellText = true/false, cellNF = true/false, dateNF = 'YYYY-MM-DD' or 'dd/MM/yyyy'
       * dateCompare: 1899-12-30
       * cell.type == date: value is number <== moment(date).diff(moment(dateCompare))
       ==> date = moment(dateCompare).add(value, 'd').format('YYYY-MM-DD' or 'dd/MM/yyyy')
       *
       * cell.type == time: value is float <== seconds / (24 * 60 * 60) ==>  86400 (1 day).
       ==>  seconds = value * 86400 ==> value = formatDate from seconds.
       **/
      excel: function (file, option = {}, cb) {
        let reader = new FileReader();
        let raw = true;
        if (Object.keys(option).length) {
          raw = false
          option = {...option, type: 'array'}
        } else {
          option = {type: 'array'};
        }
        
        reader.onload = function (e) {
          let data = e.target.result;
          data = new Uint8Array(data);
          let workbook = XLSX.read(data, option);
          let result = [];
          workbook.SheetNames.forEach(function (sheetName) {
            let ws = workbook.Sheets[sheetName];
            let rows = XLSX.utils.sheet_to_json(ws, {header: 1, raw: false});
            if (rows.length) result.push(rows);
          });
          cb(result);
        };
        reader.readAsArrayBuffer(file);
      }
    }
  });
