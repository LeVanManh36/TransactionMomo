
(function ($) {
  // Use Strict
  "use strict";
  try {
    let progressbarSimple = $('.js-progressbar-simple');
    progressbarSimple.each(function () {
      let that = $(this);
      let executed = false;
      $(window).on('load', function () {
        that.waypoint(function () {
          if (!executed) {
            executed = true;
            /*progress bar*/
            that.progressbar({
              update: function (current_percentage, $this) {
                $this.find('.js-value').html(current_percentage + '%');
              }
            });
          }
        }, {
          offset: 'bottom-in-view'
        });
      });
    });
  } catch (err) {
    console.log(err);
  }
})(jQuery);

(function ($) {
  // USE STRICT
  "use strict";
  // Scroll Bar
  try {
    let jscr1 = $('.js-scrollbar1');
    if (jscr1[0]) {
      const ps1 = new PerfectScrollbar('.js-scrollbar1');
    }
    let jscr2 = $('.js-scrollbar2');
    if (jscr2[0]) {
      const ps2 = new PerfectScrollbar('.js-scrollbar2');
    }
  } catch (error) {
    console.log(error);
  }
})(jQuery);

(function ($) {
  // USE STRICT
  "use strict";
  // Select 2
  try {
    $(".js-select2").each(function () {
      $(this).select2({
        minimumResultsForSearch: 20,
        dropdownParent: $(this).next('.dropDownSelect2')
      });
    });
  } catch (error) {
    console.log(error);
  }
})(jQuery);

(function ($) {
  // USE STRICT
  "use strict";
  // Load more
  try {
    let list_load = $('.js-list-load');
    if (list_load[0]) {
      list_load.each(function () {
        let that = $(this);
        that.find('.js-load-item').hide();
        let load_btn = that.find('.js-load-btn');
        load_btn.on('click', function (e) {
          $(this).text("Loading...").delay(1500).queue(function (next) {
            $(this).hide();
            that.find(".js-load-item").fadeToggle("slow", 'swing');
          });
          e.preventDefault();
        });
      })
    }
  } catch (error) {
    console.log(error);
  }
})(jQuery);

(function ($) {
  // USE STRICT
  "use strict";

  try {
    $('[data-toggle="tooltip"]').tooltip();
  } catch (error) {
    console.log(error);
  }

  // Chatbox
  try {
    let inbox_wrap = $('.js-inbox');
    let message = $('.au-message__item');
    message.each(function () {
      let that = $(this);
      that.on('click', function () {
        $(this).parent().parent().parent().toggleClass('show-chat-box');
      });
    });
  } catch (error) {
    console.log(error);
  }
})(jQuery);
