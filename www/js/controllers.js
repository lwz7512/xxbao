angular.module('starter.controllers', [])

.controller('GlobalCtrl', function($scope, $rootScope, $log, $ionicLoading, $ionicPopup){
    // Setup the loader
  $scope.show = function() {
    $ionicLoading.show({
      // template: 'loading...',
      template: '<ion-spinner icon="lines" class="spinner-stable"></ion-spinner>',//ionic 1.0.1@2015/07/25
      animation: 'fade-in',
      showBackdrop: false,
      maxWidth: 50,
      showDelay: 0
    });
  };

  $scope.hide = function(){
    $ionicLoading.hide();
  };

  $scope.alert = function(msg){
    var alertPopup = $ionicPopup.alert({
      title: '应用提示',
      template: msg,
      okText: '好的',
    });
  };


  $scope.$on('refresh', function(event){
    $scope.show();
  });
  $scope.$on('complete', function(event){
    $scope.hide();
  });
  $scope.$on('error', function(event, msg){
    $scope.hide();
    $scope.alert(msg);
  });

  // Set the default/global locale
  moment.locale('zh-cn');

})
// -- 今日限行 --
.controller('DashCtrl', function($scope, $rootScope, $log, $timeout, Calculator, DB, Cars) {
  var self = this;

  $scope.car = {};
  $scope.todayNums = [];//今日限行尾号

  $scope.validPeriod = '2015年4月13日 ~ 2016年4月10日';
  var now = moment();
  if(now.isAfter('2016-04-11')) $scope.validPeriod = '2016年4月11日 ~ 2017年4月8日';

  //Today available cars...
  $scope.availableCars = [];

  self.filter = function(){
    var toRemoved = [];
    Cars.all().then(function(result){
      $scope.availableCars = result;
      for(var i in $scope.availableCars){
        var carnumber = $scope.availableCars[i]['carnumber'];
        var tailNum = carnumber.substr(carnumber.length-1);
        //私家车按尾号轮换
        if($scope.todayNums.indexOf(tailNum)>-1){
          toRemoved.push($scope.availableCars[i]);
        }
      }
      for(var i in toRemoved){
        var index = $scope.availableCars.indexOf(toRemoved[i]);
        $scope.availableCars.splice(index, 1);
      }
    });
  }

  self.init = function(){
    // var todayCtrlNum = '4,9';
    var todayCtrlNum = Calculator.calculate();
    $scope.todayNums = todayCtrlNum.split(',');
  }

  $scope.showHalfStop = function(){
    // $log.debug($scope.car);
    var now = moment().date();
    $scope.todayNums = [];
    if($scope.car.halfstop){//单双号限行
      if(now % 2 ==0){
        $scope.todayNums.push('1','3','5','7','9');
      } else {
        $scope.todayNums.push('2','4','6','8','0');
      }
    } else {//恢复尾号轮换
      self.init();
    }
    self.filter();
  };
  // -- 派车 --
  $scope.dispatch = function(car){
    // $log.debug(car);
    car.status = car.status?0:1;//已派
    Cars.update(car).then(function(){
      $log.debug('update success!');
      $timeout(function(){
        $scope.$apply();
      });
    });
  };

  //check sqlite status on first display
  //@2014/12/31
  $rootScope.$on('dbReady', function(){//listen on the DB service dispatched event
    self.init();
    self.filter();
  });
  // while switch in from other menu
  $scope.$on('$ionicView.enter', function(e) {
    if (!DB.available) return;

    $scope.showHalfStop();
  });
})
// -- 车辆管理 --
.controller('ChatsCtrl', function($scope, $log, $timeout, Cars) {
  var self = this;

  self.update = function(car){
    for(var i in $scope.cars){
      if($scope.cars[i]==car){
        $scope.cars.splice(i, 1);
        $timeout(function(){
          $scope.$apply();
        });
      }
    }
  };
  $scope.cars = [];
  Cars.all().then(function(result){
    $scope.cars = result;
  });

  $scope.$on('$ionicView.enter', function(e) {
    if(Cars.new){
      $scope.cars.push(Cars.new);
      delete Cars.new;
    }
    $scope.$apply();
  });

  $scope.remove = function(car){
    $log.debug('delete: '+car.id);
    Cars.deleteById(car.id).then(function(){
      self.update(car);
    });
  };

})
// -- 添加车辆 --
.controller('ChatDetailCtrl', function($scope, $stateParams, $ionicHistory, $log, Cars) {
  $scope.car = {carnumber:'', title:''};
  $scope.saveCar = function(){
    // $log.debug($scope.car);
    //save the car
    Cars.new = $scope.car;

    // carnumber,title,status,type
    var type = $scope.car.public ? 1 : 0;
    Cars.insert($scope.car.carnumber, $scope.car.title, 0, type).then(function(){
      $ionicHistory.goBack();
    });
  };

})
// -- 我的账号 --
.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
