define( ['jquery','lib/utils/asset_fetch', 'lib/core/authenticator','lib/core/shopping_cart', 'lib/core/msg', 'lib/utils/local_store', 'lib/managers/select_group_manager', 'lib/core/ad_manager', 'lib/core/ad_manager_v2'], ($, AssetFetch, Authenticator, ShoppingCart, Msg, LocalStore, SelectGroupManager, AdManager, AdManager2) ->

  class Base

    constructor: (args={})->
      if LocalStore.getCookie('lp-new-sign-in')
        @authenticateUser()
      else
        @oldAuthenticateUser()

      @showUserBasket()
      @initAds() unless args.secure
      @showCookieComplianceMsg()
      @initialiseSelectGroupManager()
      @addNavTracking()

    authenticateUser: ->
      @auth = new Authenticator()

      $.ajax
        url: @auth.getNewStatusUrl()
        dataType: "json"
        error: =>
          @oldAuthenticateUser(@auth)
        success: (user) =>
          # The data returned is defined in community at: app/controllers/users_controller.rb@status
          window.lp.user = user

          # Legacy, keep until the old stuff is discarded and Authenticator has been refactored.
          window.lpLoggedInUsername = user.username || "";
          window.facebookUserId = user.facebook_uid;
          window.surveyEnabled = "false";
          window.timestamp = user.timestamp;
          window.referer = "null";

          @auth.update()

    oldAuthenticateUser: (auth) ->
      @auth = auth || new Authenticator()
      AssetFetch.get "https://secure.lonelyplanet.com/sign-in/status", () =>
        @auth.update()

    initAds: ->

      if (lp.getCookie('lpAdManager'))
        @adManager = new AdManager2(window.lp.ads)
      else
        # Treat ad manager as a singleton so that we don't attempt to re-init
        # in apps that require and call this manually.
        AdManager.init()


    showUserBasket: ->
      shopCart = new ShoppingCart()

    initialiseSelectGroupManager: ->
      new SelectGroupManager()

    showCookieComplianceMsg: ->
      if LocalStore.get('cookie-compliance') is undefined or LocalStore.get('cookie-compliance') is null
        args =
          content: "<p class='cookie-text'><strong>Hi there,</strong> we use cookies to improve your experience on our website. You can <a class='cookie-link' href='http://www.lonelyplanet.com/legal/cookies'>update your settings</a> by clicking the Cookie Policy link at the bottom of the page.</p>"
          style: "row--cookie-compliance js-cookie-compliance"
          userOptions :
            close: true
            more: true
          delegate:
            onRemove : ->
              $('div.js-cookie-compliance').removeClass('is-open')
              $('div.js-cookie-compliance').addClass('is-closed')
            onAdd : ->
              window.setTimeout( ( => $('div.js-cookie-compliance').addClass('is-open')), 1)
        msg = new Msg(args)
        LocalStore.set('cookie-compliance', true)

    addNavTracking: ->
      $('#js-primary-nav').on 'click', '.js-nav-item', ->
        window.s.linkstacker($(@).text())

      $('#js-primary-nav').on 'click', '.js-nav-cart', ->
        window.s.linkstacker("shopping-cart")

      $('#js-primary-nav').on 'submit', '.js-nav-search', ->
        window.s.linkstacker("search")

      $('#js-secondary-nav').on 'click', '.js-nav-item', ->
        window.s.linkstacker($(@).text() + "-sub")

      $('#js-breadcrumbs').on 'click', '.js-nav-item', ->
        window.s.linkstacker("breadcrumbs")

      $('#js-footer-nav').on 'click', '.js-nav-item', ->
        window.s.linkstacker("footer")
)
