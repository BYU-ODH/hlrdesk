var chai = require('chai'),
    expect = chai.expect;

chai.use(require('chai-as-promised'));

describe('location', function() {
  beforeEach(require('./resetdb'));
  var location  = require ('../core/app_modules/location');

  describe('.list', function() {
    it('should return an iterable list of items', function*() {
      var locations = yield location.list;
      expect(locations.length).to.be.a('number');
    });
    it('should contain a name', function*() {
      var locations = yield location.list;
      var first = locations[0];
      expect(first).to.contain.keys(['name']);
    });
  });
  describe('#remove(name)', function() {
    it('should return true on success', function*() {
      var response = yield location.remove('Back Cabinet');
      expect(response).to.be.true;
    });
    it('should be rejected if the location does not exist', function*() {
      var promise = location.remove('yyy');
      expect(promise).to.eventually.be.rejected;
    });
    it('should reduce the length of location.list', function*() {
      var l1 = yield location.list;
      yield location.remove('Back Cabinet');
      var l2 = yield location.list;
      expect(l1).to.have.length.above(l2.length);
    });
  });
  describe('#create(location)', function() {
    it('should be rejected if the location already exists', function*() {
      var promise = location.create('Back Cabinet');
      expect(promise).to.eventually.be.rejected;
    });
    it('should increase the length of list', function*() {
      var l1 = yield location.list;
      yield location.create('Right Side Cabinet');
      var l2 = yield location.list;
      expect(l1).to.have.length.below(l2.length);
    });
  });
  describe('#update(name, new_name', function() {
    it('should be rejected if the current name does not exist', function*() {
      var promise = location.update('Right Side Cabinet', 'Left Side Cabinet');
      expect(promise).to.eventually.be.rejected;
    });
    it('should be rejected if the new name already exists', function*() {
      var promise = location.update('Back Cabinet', 'Reserve Drawer');
      expect(promise).to.eventually.be.rejected;
    });
    it('should resolve true on success', function*() {
      var result = yield location.update('Back Cabinet', 'Cool Back Cabinet');
      expect(result).to.be.true;
    });
  });
});
