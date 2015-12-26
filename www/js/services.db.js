angular.module('starter.services')

// **************** camera/DB service @2015/08/25 *********************
.factory('CameraSrv', function(){
    var self = this;

    self.shoot = function(onPhotoSuccess, onPhotoFailure) {
    if(navigator.camera) {
      var photoOpt = {
        quality: 50,
        destinationType: Camera.DestinationType.DATA_URL,
        allowEdit : true,
        encodingType: Camera.EncodingType.JPEG,//use jpeg to corresponding data:image/jpeg
        targetWidth: 100,
        targetHeight: 100,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false
      };
      navigator.camera.getPicture(onPhotoSuccess, onPhotoFailure, photoOpt);
    }else{
      console.error("camera not exist!");
    }
  };

    return self;
})

// ************* DB wrapper service ******************
.factory('DB', function($q, $log, $rootScope) {
    var self = this;
    self.db = null;
    self.available = false;

    self.prepare = function(){
      if (window.sqlitePlugin) {// Use below in production
          self.db = window.sqlitePlugin.openDatabase(
              {name: 'xxbao'},
              function(){//ok callback
                  self.available = true;
                  $(document).trigger('dbReady');
              });
      }else{// Use below in development
          var maxSize = 655360; // in bytes, 650k
          self.available = true;
          self.db = window.openDatabase('xxbao', '1.0', 'database', maxSize);
          $rootScope.$broadcast('dbReady');
      }
    };

    self.init = function() {
      self.prepare();

      var cars = {
            name: 'cars',
            columns: [
                {name: 'id', type: 'integer primary key'},
                {name: 'carnumber', type: 'text'},
                {name: 'title', type: 'text'},
                {name: 'status', type: 'integer'},
                {name: 'type', type: 'integer'}
            ]
          };

      var columns = [];
      var column;
      for(var i in cars.columns){
        column = cars.columns[i];
        columns.push(column.name + ' ' + column.type);
      }
      var query = 'CREATE TABLE IF NOT EXISTS ' + cars.name + ' (' + columns.join(',') + ')';
      self.query(query);
    };


    self.dropOneTable = function(tbl_name) {
      self.query('DROP TABLE '+tbl_name).then(function(result){
          alert(tbl_name+" dropped!");
      });
    };

    self.query = function(query, bindings) {
      if (!self.db) {self.prepare();};

      bindings = typeof bindings !== 'undefined' ? bindings : [];
      var deferred = $q.defer();

      self.db.transaction(function(transaction) {
          transaction.executeSql(
              query,
              bindings,
              function(transaction, result) {//onSuccess
                  deferred.resolve(result);
              },
              function(transaction, error) {//onFailure
                  deferred.reject(error);
              });//end of executeSql
      });//end of transaction

      return deferred.promise;
    };

    //bindings: [[a, b], [c, d], ...]
    self.batchQuery = function(query, bindings) {
      if (!self.db) {self.prepare();};

      bindings = typeof bindings !== 'undefined' ? bindings : [];
      var deferred = $q.defer();

      self.db.transaction(
        function(transaction){
            for(var i=0; i<bindings.length; i++){
                transaction.executeSql(query, bindings[i]);
            }
        },
        function(error){//transaction failure
            deferred.reject(error);
        },
        function(){//transaction success
            deferred.resolve();
      });//end of transaction

      return deferred.promise;
    };

    // restore for the whole table @2015/02/17
    // @param clearsql: 'DELETE FROM ...'
    // @param insertsql: 'INSERT INTO ....'
    // @param bindings: [[a, b], [c, d], ...]
    self.restore = function(clearsql, insertsql, bindings) {
      if (!self.db) {self.prepare();};

      bindings = typeof bindings !== 'undefined' ? bindings : [];
      var deferred = $q.defer();

      self.db.transaction(
          function(transaction){
              transaction.executeSql(clearsql, []);//remove all
              for(var i=0; i<bindings.length; i++){
                  transaction.executeSql(insertsql, bindings[i]);//insert all
              }
          },
          function(error){//transaction failure
            deferred.reject(error);
          },
          function(){//transaction success
            deferred.resolve();
          });//end of transaction

      return deferred.promise;
    };

    /**
     * show table structure , include table name and the sql create it
     * @2014/09/30
     */
    self.dump = function() {
      var websql = "SELECT tbl_name, sql FROM sqlite_master WHERE type='table'";
      var sql = websql;
      self.query(sql).then(function(result){
          console.log(self.fetchAll(result));
      });
    }

    self.fetchAll = function(result) {
      var output = [];

      for (var i = 0; i < result.rows.length; i++) {
          output.push(result.rows.item(i));
      }

      return output;
    };

    self.fetch = function(result) {
      //FIX, no result fix
      //@2015/08/24
      if(!result.rows.length) return {};
      //$log.debug(result);

      return result.rows.item(0);
    };

    self.todayZeroClock = function(){
        var now = new Date();
        var todayZeroClock = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        return parseInt(todayZeroClock.getTime()/1000);
    };

    //get timestamp for sqlite in second
    //@2015/08/24
    self.timestamp = function(){
      return parseInt((new Date()).getTime()/1000);
    };

    /**
     * IMPORTANT FIX FOR DIFFRENT DEVICE:
     *
     * each insert operation need set id with this value;
     * @2015/07/16,19
     */
    self.getNextID = function(tablename){
      var currentRowID = window.localStorage.getItem(tablename);
      if (!currentRowID) {
        //Auto increment base value, set in updatefix.js
        var startId = window.localStorage.getItem("startRowID");
        currentRowID = startId;//use the default value;
      }
      var nextID = parseInt(currentRowID)+1;
      window.localStorage.setItem(tablename, nextID);//save it

      return nextID;
    };

    /**
     * check the docs arrary by field to remove the duplicated element;
     * docs, checked collection
     * field, checked field in each doc
     * @2015/11/03
     */
    self.removeDups = function(docs, field){
      var res = [];
      var map = {};
      for(var i = 0; i < docs.length; i++){
        if(!map[docs[i][field]]){
         res.push(docs[i]);
         map[docs[i][field]] = 1;
        }
      }
      return res;
    };

  return self;

});
//***************** end of DB wrapper ******************
