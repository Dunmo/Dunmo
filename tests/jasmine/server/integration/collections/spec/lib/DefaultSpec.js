
describe('Setters', function () {

  describe('setBool', function () {
    var mock;

    beforeEach(function () {
      mock = {
        update: function (selector) { this.isBorked = selector.isBorked; },
        setIsBorked: Setters.setBool('isBorked')
      };
    });

    it('should set the property to the value', function () {
      mock.setIsBorked(false);
      expect(mock.isBorked).toBeFalsy();

      mock.setIsBorked(true);
      expect(mock.isBorked).toBeTruthy();

      mock.setIsBorked(false);
      expect(mock.isBorked).toBeFalsy();
    });

    it('should set the property to true by default', function () {
      mock.setIsBorked(false);
      expect(mock.isBorked).toBeFalsy();

      mock.setIsBorked();
      expect(mock.isBorked).toBeTruthy();
    });

  });

});

describe('collection', function () {

});
