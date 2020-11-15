'use strict';

angular.module('appServices', [
    'ui.router',
    'ui.bootstrap',
    'ui.sortable',
    'ui.utils.masks',
    'angularCSS',
    'appConfig',
    'controllers.index',
    'controllers.authenticate',
    'controllers.profiles',
    'controllers.accounts',
    'controllers.locations',
    'filters.utils',
    'directives.utils',
    'services.authenticate',
    'services.loader',
    'services.table',
    'services.utils',
    'ngStorage',
    'ngTable',
    'yaru22.angular-timeago',
    'pascalprecht.translate',
    'rzSlider'
  ])

  .config(function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, $translateProvider, appConstants) {

    // **************** localization ***************** //
    $translateProvider.useStaticFilesLoader({
      prefix: '/app/langs/',
      suffix: '.json'
    });

    const lang = langs.default;
    $translateProvider.fallbackLanguage(lang);
    $translateProvider.preferredLanguage(lang);
    $translateProvider.useSanitizeValueStrategy('escape'); // escape or escapeParameters
    // $translateProvider.useLocalStorage();

    // ***************** end ***************** //
    let urlOtherWise = '/start';
    $urlRouterProvider.otherwise(urlOtherWise);
    const {roles} = appConstants;
    const permissions = {
      admin: roles.admin,
      basic: [roles.admin, roles.maker, roles.checker],
      checker: [roles.admin, roles.checker],
      viewer: Object.values(roles)
    }

    $stateProvider

      .state("home", {
        abstract: true,
        url: "/",
        templateUrl: 'app/views/Main/menu.html',
        controller: 'IndexCtrl'
      })

      .state("start", {
        url: "/start",
        templateUrl: 'app/views/Main/start.html',
        controller: 'IndexCtrl',
        css: 'css/login.css',
      })

      // .state("home.settings", {
      //   url: "settings",
      //   views: {
      //     "main": {
      //       templateUrl: '/app/views/Setting/index.html',
      //       controller: 'SettingsCtrl'
      //     }
      //   },
      //   permissions: permissions.admin
      // })

      .state("home.changePw", {
        url: "changePw",
        views: {
          "main": {
            templateUrl: '/app/views/Profile/change_password.html',
            controller: 'ProfileCtrl'
          }
        }
      })

      .state("home.accounts", {
        url: "accounts",
        views: {
          "main": {
            templateUrl: 'app/views/Account/admin.html',
            controller: 'AccountsCtrl'
          }
        },
        permissions: roles.root
      })

      .state("home.users", {
        url: "users",
        views: {
          "main": {
            templateUrl: 'app/views/Account/user.html',
            controller: 'UserCtrl'
          }
        },
        permissions: permissions.admin
      })

      .state("home.users_disabled", {
        url: "users-disabled",
        views: {
          "main": {
            templateUrl: 'app/views/Account/trash.html',
            controller: 'UsersDisabledCtrl'
          }
        },
        permissions: permissions.admin
      })

      .state("home.areas", {
        url: "areas",
        views: {
          "main": {
            templateUrl: 'app/views/Area/index.html',
            controller: 'AreaCtrl'
          }
        },
        permissions: permissions.admin
      })

      // .state("login", {
      //   url: "/login",
      //   templateUrl: 'app/views/Login/login.html',
      //   controller: 'LoginController',
      //   controllerAs: "vm",
      //   css: 'css/login.css',
      // })

      .state("login", {
        url: "/login",
        templateUrl: 'app/views/Login/login_v1.html',
        controller: 'LoginController',
        controllerAs: "vm",
        css: ['fonts/Linearicons/icon-font.min.css', 'css/login_v1/util.css', 'css/login_v1/main.css'],
      })

    $httpProvider.interceptors.push(function ($q, $rootScope, $location) {

      var onlineStatus = false;

      return {
        'response': function (response) {
          if (response.status === appConstants.HTTP_UNAUTHORIZED) return $location.path("login");

          if (!onlineStatus) {
            onlineStatus = true;
            $rootScope.$broadcast('onlineStatusChange', onlineStatus);
          }
          return response || $q.when(response);
        },

        'responseError': function (response) {
          if (response.status === appConstants.HTTP_UNAUTHORIZED) return $location.path("login");

          if (onlineStatus) {
            onlineStatus = false;
            $rootScope.$broadcast('onlineStatusChange', onlineStatus);
          }
          return $q.reject(response);
        }
      };
    });

  })

  .run(function ($window, $modal, $http, $rootScope, $location, $localStorage, appLocales, $translate, timeAgoSettings) {
    // Keep user logged in after page refresh
    if ($localStorage.currentUser) {
      let currentUser = $localStorage.currentUser;
      $http.defaults.headers.common.Authorization = "Bearer " + currentUser.token;
      $http.defaults.headers.common.timezone = getTimeZone();
      $rootScope.authUser = currentUser;
    }

    function getTimeZone() {
      let value = new Date().getTimezoneOffset();
      return -(value / 60)
    }

    // redirect to login page if not logged in and trying to access a restricted page
    $rootScope.$on("$locationChangeStart", function (event, next, current) {
      let publicPages = ["/login"];
      let restrictPage = publicPages.indexOf($location.path()) > -1;
      if (restrictPage || !$localStorage.currentUser) {
        $location.path("login");
      }
    });

    $rootScope.applyLocalization = (langKey) => {
      $translate.use(langKey);
      timeAgoSettings.overrideLang = langs.timeAgo[langKey];
      $rootScope.dateFormatFn = langs.dateFormat[langKey];
      $http.defaults.headers.common.language = langKey;
      $window.document.title = langs.translations[langKey].app_name
    }

    // set localization default
    $rootScope.languages = appLocales.languages;
    $rootScope.defaultLanguage = langs.default || appLocales.defaultLanguage;
    if (!$localStorage.currentLang) {
      $localStorage.currentLang = $rootScope.defaultLanguage
    }
    $rootScope.applyLocalization($localStorage.currentLang);

    $rootScope.changeLanguage = (langKey) => {
      $localStorage.currentLang = langKey;
      $rootScope.applyLocalization(langKey);
    };

    $rootScope.$on("$stateChangeStart", function (event, next, nParams, current, params) {
      let {permissions} = next;
      if (permissions) {
        if (typeof permissions === "string") permissions = [permissions];
        if (!permissions.includes($rootScope.authUser.role)) {
          $location.path('/start')
        }
      }
    });
    $rootScope.$on("$locationChangeSuccess", function (event, newUrl, oldUrl) {
      $rootScope.startNewestUrl = newUrl;
      $rootScope.startPreviousUrl = oldUrl;
    });

    let currentBrowser = $window.navigator.userAgent.toLowerCase();

    /**
     * extends string prototype object to get a string with a number of characters from a string.
     *
     * @type {Function|*}
     */

    String.prototype.trunc = String.prototype.trunc ||
      function (n) {

        // this will return a substring and
        // if its larger than 'n' then truncate and append '...' to the string and return it.
        // if its less than 'n' then return the 'string'
        return this.length > n ? this.substr(0, n - 1) + '...' : this.toString();
      };
  });
