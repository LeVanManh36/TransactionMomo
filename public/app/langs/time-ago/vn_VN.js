'use strict';

angular.module('yaru22.angular-timeago').config(function (timeAgoSettings) {
  timeAgoSettings.strings['vn_VN'] = {
    prefixAgo: null,
    prefixFromNow: null,
    suffixAgo: 'trước',
    suffixFromNow: 'từ bây giờ',
    seconds: 'ít hơn 1 phút',
    minute: 'khoảng 1 phút',
    minutes: '%d phút',
    hour: 'khoảng 1 giờ',
    hours: 'khoảng %d giờ',
    day: '1 ngày',
    days: '%d ngày',
    month: 'khoảng 1 tháng',
    months: '%d tháng',
    year: 'khoảng 1 năm',
    years: '%d năm',
    numbers: []
  };
});
