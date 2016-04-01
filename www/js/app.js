// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

.run(function($ionicPlatform, $log, DB) {
  $ionicPlatform.ready(function() {

    //manual hide splash now, @2016/03/31
    if(navigator.splashscreen) navigator.splashscreen.hide();

    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    // init database...
    DB.init();
    $log.debug('xxbao started!');

  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  // 禁用视图缓存 @2016/03/30
  // 不然切换视图设置时，不重新初始化
  $ionicConfigProvider.views.maxCache(0);

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  //
  // 规则说明：@2016/03/29
  // 子状态名称规则：父状态名称 + '.' + 子模块名称
  // 由根URL /dash 和state/url 接起来构成 ion-tab对应的href
  // 由state/views对象的key，对应tabs.html/ion-nav-view的name参数
  $stateProvider

  // 所有模块的根路径 @2016/03/31
  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html',
    controller: 'GlobalCtrl'
  })

  .state('tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashCtrl'
      }
    }
  })

  .state('tab.chats', {
      url: '/chats',
      views: {
        'tab-chats': {
          templateUrl: 'templates/tab-chats.html',
          controller: 'ChatsCtrl'
        }
      }
    })
  .state('tab.chat-add', {
    url: '/chats/add',
    views: {
      'tab-chats': {
        templateUrl: 'templates/chat-detail.html',
        controller: 'ChatDetailCtrl'
      }
    }
  })
  .state('tab.chat-history', {//查看行车历史
    url: '/chats/:carID',
    views: {
      'tab-chats': {
        templateUrl: 'templates/chat-history.html',
        controller: 'ChatHistoryCtrl'
      }
    }
  })

  .state('tab.about', {
    url: '/about',
    views: {
      'tab-about': {
        templateUrl: 'templates/tab-about.html',
        // controller: 'AboutCtrl'
      }
    }
  })
  .state('tab.contactus', {
    url: '/about/contactus',
    views: {
      'tab-about': {
        templateUrl: 'templates/tab-contactus.html',
        // controller: 'AboutCtrl'
      }
    }
  })
  .state('tab.products', {
    url: '/about/products',
    views: {
      'tab-about': {
        templateUrl: 'templates/tab-products.html',
        // controller: 'AboutCtrl'
      }
    }
  })

  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/dash');

});
