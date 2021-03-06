define([ "public/assets/javascripts/lib/utils/throttle.js" ], function(throttle) {

  describe("Throttle", function() {

    var interval;

    afterEach(function() {
      clearInterval(interval);
    });

    it("Should return a function", function() {
      var result = throttle(new Function, 200)
      expect(typeof result).toBe("function");
    });

    describe("Execute the given callback only once per wait time", function() {
      var instance,
          callbackInc = 0;

      beforeEach(function() {
        jasmine.clock().install();
        jasmine.clock().mockDate();

        instance = throttle(function() {
          callbackInc++;
        }, 25);

        for (var i = 0; i < 6; i++) {
          instance();
          jasmine.clock().tick(10);
        }
      });

      afterEach(function() {
        jasmine.clock().uninstall()
      });

      it("has triggered the callback", function() {
        expect(callbackInc).toBe(2);
      });

    });

    describe("Applying callback with arguments", function() {
      var instance, spy;

      beforeEach(function(done) {
        spy = jasmine.createSpy();

        instance = throttle(function() {
          spy.apply(this, arguments);
          done();
        }, 10);

        instance("foo", "bar");
      });

      it("has triggered the callback with arguments applied", function() {
        expect(spy).toHaveBeenCalledWith("foo", "bar");
      });

    });

    describe("Applying callback with a given scope", function() {
      var instance, callback, scope;

      beforeEach(function(done) {
        scope = {
          prop: "change me"
        };

        callback = function(changeTo) {
          this.prop = changeTo;
          done();
        };

        instance = throttle(callback, 10, scope);

        instance("changed");
      });

      it("has changed the value within the given scope", function() {
        expect(scope.prop).toBe("changed");
      });

    });

  });

});
