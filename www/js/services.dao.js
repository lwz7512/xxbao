angular.module('starter.services')

// demo service example to act as an end
.factory('Cars', function (DB, $log) {
  var self = this;

  self.insert = function (carnumber,title,status,type) {
    var sql = "INSERT INTO cars (carnumber,title,status,type)";
    sql += " VALUES(";
    sql += "'" + carnumber + "',";
    sql += "'" + title + "',";
    sql += status + ",";
    sql += type + ")";
    // console.debug(sql);
    return DB.query(sql).then(function (result) {
      return result;
    });
  };

  self.deleteById = function (id) {
    var sql = "DELETE FROM cars WHERE id = ?";
    return DB.query(sql, [id]).then(function (result) {
      return result;
    });
  };

  self.exist = function (carnumber) {
    var sql = "SELECT COUNT(*) AS exist FROM cars WHERE carnumber = ?";
    return DB.query(sql, [carnumber]).then(function (result) {
      var count = DB.fetch(result);;
      return count['exist'];
    });
  };


  self.update = function (car) {
    var sql = "UPDATE cars SET ";
    sql += "carnumber = '" + car.carnumber + "', ";
    sql += "title = '" + car.title + "', ";
    sql += "status = " + car.status + ", ";
    sql += "type = " + car.type;
    sql += " WHERE id = " + car.id;
    return DB.query(sql).then(function (result) {
      return result;
    });
  };


  self.all = function () {
    return DB.query('SELECT * FROM cars')
      .then(function (result) {
        return DB.fetchAll(result);
      });
  };

  self.clear = function () {
    return DB.query("DELETE FROM cars").then(function (result) {
      return result;
    });
  };

  self.getById = function (id) {
    return DB.query('SELECT * FROM cars WHERE id = ?', [id])
      .then(function (result) {
        return DB.fetch(result);
      });
  };

  return self;
})

.factory('Histories', function (DB, $log) {
  var self = this;

  self.insert = function (carid, work_time) {
    var sql = "INSERT INTO histories (carid,work_time)";
    sql += " VALUES(";
    sql += carid + ",";
    sql += work_time + ")";
    // console.debug(sql);
    return DB.query(sql).then(function (result) {
      return result;
    });
  };

  self.getHisBy = function (carID) {
    return DB.query('SELECT * FROM histories WHERE carid = ? ORDER BY work_time DESC', [carID])
      .then(function (result) {
        return DB.fetchAll(result);
      });
  };


  return self;
});
