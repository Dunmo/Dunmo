describe("Test", function() {
  var test;

  beforeEach(function() {
    test = {
      is_passing: true
    }
  });

  it("should pass", function() {
    expect(test.is_passing).toBe(true);
  });

  it("should be able to fail", function() {
    expect(test.is_passing).not.toBe(false);
  });
});
