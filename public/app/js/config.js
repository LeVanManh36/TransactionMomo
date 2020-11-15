
angular.module('appConfig', [])
  
  .constant('myUrls', (function () {
    
    let protocol, base = 'http://localhost/';
    //IE fix !
    if (!window.location.origin) {
      let port = window.location.port ? `:${ window.location.port}` : '';
      let host = `${window.location.protocol}//${window.location.hostname}`;
      window.location.origin = `${host}${port}`;
    }
    
    protocol = window.location.protocol.toLowerCase();
    if (protocol.indexOf("http") !== -1) base = `${window.location.origin}/`;
    // base = "http://192.168.6.136:3000/"
    
    return {
      base:                 base,
      register:             base + 'api/register',
      login:                base + 'api/login',
      logout:               base + 'api/logout',
      changePassword:       base + 'api/change-password',
      resetPassword:        base + 'api/reset-password',
      lockAcc:              base + 'api/lock-account',
      unlockAcc:            base + 'api/unlock-account',
      profile:              base + 'api/profile',
      settings:             base + 'api/settings',
      licenses:             base + 'api/licenses',
      accounts:             base + 'api/accounts',   // admin
      users:                base + 'api/users',      // normal
      users_disabled:       base + 'api/users-disabled',
      companies:            base + 'api/companies',
      areas:                base + 'api/areas',
      oohs:                 base + 'api/ooh-positions',
      labels:               base + 'api/labels'
    }
  })())
  
  .constant('appConstants', (function () {
    
    return {
      videoRegex:           /(mp4|mov|m4v|avi|webm|wmv|flv|mkv|mpg|mpeg|3gp)$/i,
      audioRegex:           /(mp3|m4a|mp4a|aac)$/i,
      imageRegex:           /(jpg|jpeg|png|gif|bmp)$/i,
      noticeRegex:          /\.html$/i,
      zipfileRegex:         /(.zip|.gz|.bz2)$/i,
      repofileRegex:        /\.repo$/i,
      liveStreamRegex:      /\.tv$/i,
      omxStreamRegex:       /\.stream$/i,
      linkURL:              /\.link$/i,
      CORSLink:             /\.weblink$/i,
      mediaRss:             /\.mrss$/i,
      nestedPlaylist:       /^__/i,
      groupNameRegEx:       /[&\/\\#,+()$~%'":*?<>{}\^]/g,
      pdffileRegex:         /\.pdf$/i,
      txtFileRegex:         /\.txt$/i,
      radioFileRegex:       /\.radio$/i,
      
      // config for filters
      labelMode: {
        player: 'players',
        asset: 'assets'
      },

      labelOptions: [
        {key: "asset", value: "assets", label: "Label.filterTags.assets"},
        {key: "player", value: "players", label: "Label.filterTags.players"}
      ],

      roles: {
        root: "root",
        admin: "admin",
        staff: "staff",
        customer: "customer",
        viewer: "viewer",
        owner: "owner"
      },

      subscriptions: [
        {label: "3months", value: "3"},
        {label: "6months", value: "6"},
        {label: "9months", value: "9"},
        {label: "12months", value: "12"},
        {label: "2years", value: "24"},
        {label: "3years", value: "36"}
      ],
  
      HTTP_SUCCESS: 200,
      HTTP_UNAUTHORIZED: 401
    }
  })())
  
  .constant('weeks', (function () { // all weeks for playlist time setting
    return ['All Days', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  })())
  
  .constant('days', (function () { // all days in month for playlist time setting
    
    return [
      'All Dates',
      '1', '2', '3', '4', '5', '6', '7', '8', '9',
      '10', '11', '12', '13', '14', '15', '16', '17', '18', '19',
      '20', '21', '22', '23', '24', '25', '26', '27', '28', '29',
      '30', '31'
    ]
  })())
  
  .constant('weeksObject', (function () { // all weeks for playlist time setting
    
    return [
      // {id: 0,label: 'Common.all'},
      {id: 1, label: 'Common.daysOfWeek.sun'},
      {id: 2, label: 'Common.daysOfWeek.mon'},
      {id: 3, label: 'Common.daysOfWeek.tue'},
      {id: 4, label: 'Common.daysOfWeek.wed'},
      {id: 5, label: 'Common.daysOfWeek.thu'},
      {id: 6, label: 'Common.daysOfWeek.fri'},
      {id: 7, label: 'Common.daysOfWeek.sat'}
    ]
  })())
  
  .constant('daysObject', (function () { // all days in month for playlist time setting
    
    return [
      // {id: 0,label: 'Common.all'},
      {id: 1, label: '1'}, {id: 2, label: '2'}, {id: 3, label: '3'},
      {id: 4, label: '4'}, {id: 5, label: '5'}, {id: 6, label: '6'},
      {id: 7, label: '7'}, {id: 8, label: '8'}, {id: 9, label: '9'},
      {id: 10, label: '10'}, {id: 11, label: '11'}, {id: 12, label: '12'},
      {id: 13, label: '13'}, {id: 14, label: '14'}, {id: 15, label: '15'},
      {id: 16, label: '16'}, {id: 17, label: '17'}, {id: 18, label: '18'},
      {id: 19, label: '19'}, {id: 20, label: '20'}, {id: 21, label: '21'},
      {id: 22, label: '22'}, {id: 23, label: '23'}, {id: 24, label: '24'},
      {id: 25, label: '25'}, {id: 26, label: '26'}, {id: 27, label: '27'},
      {id: 28, label: '28'}, {id: 29, label: '29'}, {id: 30, label: '30'},
      {id: 31, label: '31'}
    ]
  })())
  
  .constant('moment', moment)

  .constant('appLocales', (function () {
    return {
      defaultLanguage: "vi",
      languages: ["vi", "en", "ja"]
    }
  }))
  
  .constant('TZNames', (function () {
    
    return [
      'America/New_York',
      'Asia/Bahrain',
      'Asia/Bangkok',
      'Asia/Brunei',
      'Asia/Dili',
      'Asia/Dubai',
      'Asia/Ho_Chi_Minh',
      'Asia/Hong_Kong',
      'Asia/Istanbul',
      'Asia/Jakarta',
      'Asia/Kuala_Lumpur',
      'Asia/Macao',
      'Asia/Phnom_Penh',
      'Asia/Qatar',
      'Asia/Seoul',
      'Asia/Shanghai',
      'Asia/Singapore',
      'Asia/Taipei',
      'Asia/Tokyo',
      // 'Australia/North',
      // 'Australia/South',
      // 'Australia/Sydney',
      // 'Australia/West',
      // 'Canada/Atlantic',
      // 'Canada/Central',
      // 'Canada/Eastern',
      // 'Canada/Pacific',
      'Universal',
      'US/Alaska',
      'US/Central',
      'US/Eastern',
      'US/Hawaii',
      'US/Pacific',
      'US/Pacific-New',
      'UTC',
      'EST',
      'GMT'
    ]
  })());
