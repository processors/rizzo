// ------------------------------------------------------------------------------
//
// Page Hopper
//
// ------------------------------------------------------------------------------

define([
  "jquery",
  "autocomplete",
  "lib/components/lightbox"
], function($, Autocomplete, LightBox) {

  "use strict";

  var config = {
        autocompleteInputClass: "js-autocomplete-page-hopper",
        listener: "body",
        linkClass: "js-page-hopper-opener"
      },
      $link, lightbox, isOpen, _this;

  function PageHopper(args) {
    $.extend(config, args);

    this.$listener = $(config.listener);
    this.init();
  }

  PageHopper.prototype.init = function() {
    _this = this;

    $link = $("<a class='" + config.linkClass + "' />");
    this.$listener.append($link);

    lightbox = new LightBox({
      customClass: "lightbox--page-hopper",
      $el: "body",
      $opener: "." + config.linkClass
    });

    this.listen();
  };

  // -------------------------------------------------------------------------
  // Subscribe to Events
  // -------------------------------------------------------------------------

  PageHopper.prototype.listen = function() {

    _this.$listener.on("keydown", function(e) {
      if (isOpen) { return; }

      // 75 =k
      if ( e.keyCode == 75 && (e.metaKey || e.ctrlKey) ) {
        $link.trigger("click");
        e.preventDefault();
      }
    });

    _this.$listener.on(":lightbox/open", function(event, data) {
      if (data.opener == $link[0]) {
        isOpen = true;
        _this.$listener.trigger(":lightbox/renderContent", "<div class='card card--page page-hopper'> <div class='card--page__header'><input class='page-hopper__input " + config.autocompleteInputClass + "' type='text'></div></div>");
      }
    });

    _this.$listener.on(":lightbox/contentReady", _this._setupAutocomplete);

    _this.$listener.on(":flyout/close", function() {
      isOpen = false;
    });

  };

  // -------------------------------------------------------------------------
  // Private Functions
  // -------------------------------------------------------------------------

  PageHopper.prototype._filterSections = function(searchTerm, callback) {
    var regex = new RegExp(searchTerm, "gim"),
        results = window.lp.pageHopper.sections.filter(function(current) {
          return regex.test(current.title);
        });

    callback(results);
  };

  PageHopper.prototype._setupAutocomplete = function() {
    new Autocomplete({
      el: "." + config.autocompleteInputClass,
      fetch: _this._filterSections,
      onItem: function(el) {
        location.href = el.href;
      },
      threshold: 2,
      limit: 4,
      template: {
        elementWrapper: "<div class='js-autocomplete'></div>",
        resultsWrapper: "<div class='autocomplete nav__submenu'></div>",
        resultsContainer: "<div class='autocomplete__results nav__submenu__content nav--stacked icon--tapered-arrow-up--after icon--white--after icon--white--bordered'></div>",
        resultsItem: "<a class='autocomplete__results__item nav__submenu__item nav__item nav__submenu__link' href='{{slug}}'>{{title}}<br /><span class='copy--caption'>{{slug}}</span></a>",
        resultsItemHighlightClass: "autocomplete__results__item--highlight",
        searchTermHighlightClass: "autocomplete__search-term--highlight",
        hiddenClass: "is-hidden"
      }
    });

    // To get around a weird bug where the lightbox was jumping out of the view.
    setTimeout(function() {
      $("." + config.autocompleteInputClass).focus();
    }, 250);
  };

  return PageHopper;
});
