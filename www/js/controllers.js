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
  $scope.todayName = moment.weekdays()[moment().day()];//星期几？
  $scope.validPeriod = '2015年4月13日 ~ 2016年4月10日';
  var now = moment();
  if(now.isAfter('2016-04-11')) $scope.validPeriod = '2016年4月11日 ~ 2017年4月8日';
  //Today available cars...
  $scope.availableCars = [];
  $scope.totalCars = [];

  self.init = function(){
    // var todayCtrlNum = '4,9';
    var todayCtrlNum = Calculator.calculate();
    $scope.todayNums = todayCtrlNum.split(',');
  }

  self.filter = function(){
    var toRemoved = [];
    Cars.all().then(function(result){
      $scope.totalCars = result;
      $scope.availableCars = result;
      for(var i in $scope.availableCars){
        var carnumber = $scope.availableCars[i]['carnumber'];
        var tailNum = carnumber.substr(carnumber.length-1);
        //按尾号轮换
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
      // $log.debug('update success!');
      $timeout(function(){
        $scope.$apply();
      });
    });
  };

  // while switch in from other menu
  $scope.$on('$ionicView.enter', function(e) {
    if (!DB.available) return;

    $scope.showHalfStop();
  });

  $timeout(function(){
    self.filter();
  }, 500);//waiting database available...

  self.init();
})
// -- 车辆管理 --
.controller('ChatsCtrl', function($scope, $log, $timeout, Cars) {
  var self = this;

  self.update = function(carid){
    for(var i in $scope.cars){
      if($scope.cars[i].id == carid){
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
    $timeout(function(){
      $scope.$apply();
    });
  });

  $scope.remove = function(carid){
    // $log.debug('delete: '+carid);
    Cars.deleteById(carid).then(function(result){
      self.update(carid);
    });
  };

})
// -- 添加车辆 --
.controller('ChatDetailCtrl', function($scope, $stateParams, $ionicHistory, $log, Cars) {
  $scope.car = {carnumber:'', title:'', };
  $scope.saveCar = function(){
    if(!$scope.car.carnumber || !$scope.car.title) return;//blank check

    //add car type
    $scope.car.type = $scope.car.public ? 1 : 0;
    Cars.insert($scope.car.carnumber, $scope.car.title, 0, $scope.car.type).then(function(result){
      //save the car
      Cars.new = $scope.car;
      Cars.new.id = result.insertId;//FIXED, remember the new car id @2015/12/28

      $ionicHistory.goBack();
    });
  };

})
// -- 我的账号 --
.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: false
  };
})
// -- 我的账号 --
.controller('AboutCtrl', function($scope) {

});
