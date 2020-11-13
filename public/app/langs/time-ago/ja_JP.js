'use strict';

angular.module('yaru22.angular-timeago').config(function (timeAgoSettings) {
  timeAgoSettings.strings['ja_JP'] = {
    prefixAgo: null,
    prefixFromNow: null,
    suffixAgo: '前',
    suffixFromNow: '今から',
    seconds: '約1分',
    minute: '１分',
    minutes: '%d分',
    hour: '1時間',
    hours: '%d時間',
    day: '1日間',
    days: '%d日間',
    month: '1ヶ月',
    months: '%dヶ月',
    year: '1年',
    years: '%d年',
    numbers: []
  };
});
