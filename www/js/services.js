angular.module('starter.services', [])

.factory('Calculator', function($log) {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [];

//   (一)自2015年4月13日至2015年7月11日，星期一至星期五限行机动车车牌尾号分别为：1和6、2和7、3和8、4和9、5和0(机动车车牌尾号为英文字母的按0号管理，下同)；
// 　　(二)自2015年7月12日至2015年10月10日，星期一至星期五限行机动车车牌尾号分别为：5和0、1和6、2和7、3和8、4和9；
// 　　(三)自2015年10月11日至2016年1月9日，星期一至星期五限行机动车车牌尾号分别为：4和9、5和0、1和6、2和7、3和8；
// 　　(四)自2016年1月10日至2016年4月10日，星期一至星期五限行机动车车牌尾号分别为：3和8、4和9、5和0、1和6、2和7。

  var ctrlprotocol_2015 = {
    '2015-04-13 2015-07-11':['1,6','2,7','3,8','4,9','5,0'],
    '2015-07-12 2015-10-10':['5,0','1,6','2,7','3,8','4,9'],
    '2015-10-11 2016-01-09':['4,9','5,0','1,6','2,7','3,8'],
    '2016-01-10 2016-04-10':['3,8','4,9','5,0','1,6','2,7'],
  };
  var ctrlprotocol_2016 = {
    '2016-04-11 2016-07-09':['2,7','3,8','4,9','5,0','1,6'],
    '2016-07-10 2016-10-08':['1,6','2,7','3,8','4,9','5,0'],
    '2016-10-09 2017-01-07':['5,0','1,6','2,7','3,8','4,9'],
    '2017-01-08 2017-04-08':['4,9','5,0','1,6','2,7','3,8'],
  };

  /**
   * 计算周几限行号码，不传参数默认计算今天
   * @param  {[type]} day 周几 - 1
   * @return {[type]}     [description]
   * @2016/03/30
   */
  function calculateTodayCtrlNum(day){
    // $log.debug(moment().format('L'));
    var currentProtocol = ctrlprotocol_2015;
    var now = moment();

    if(now.isAfter('2016-04-11')) currentProtocol = ctrlprotocol_2016;
    // 2016/03/30添加周几参数
    // 如果没有参数是今天
    // 这时变成 00:00:00
    if(typeof day != 'undefined') now = moment().startOf('week').add(day, 'days');
    // FIXME, 填上时分秒 @2016/04/11
    now.hours(moment().hour()).minutes(moment().minute()).seconds(moment().second());

    for(var key in currentProtocol){
      var startDate = moment(key.split(' ')[0]);
      var endDate = moment(key.split(' ')[1]);
      // $log.debug(startDate.unix());
      // $log.debug(endDate.unix());
      if(now.isBefore(endDate) && now.isAfter(startDate)){
        // 取星期几来判断
        if(now.day()>5 || !now.day()) return '^_^';//周末周日不限行
        // 周几比数组索引大1
        var todayCtrlNum = currentProtocol[key][now.day()-1];

        return todayCtrlNum;
      }
    }
    return '^_^';
  }

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    },
    calculate: calculateTodayCtrlNum,
  };//end of return

});//end of factory
