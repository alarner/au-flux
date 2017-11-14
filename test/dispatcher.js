const expect = require('chai').expect;
const Dispatcher = require('../src/Dispatcher');
const Store = require('../src/Store');

describe('Dispatcher', function() {
	it('should exist', function() {
		expect(Dispatcher).to.be.a('function');
	});

	describe('on', function() {
		// const d = new Dispatcher();
		// const UserStore = Store.build('UserStore', d);
		// const us = new UserStore();
		// const TestStore = Store.build('TestStore', d);
		// const ts = new TestStore();

		it('should exist', function() {
			const d = new Dispatcher();
			expect(d.on).to.be.a('function');
		});
		it('should not allow non-Store first argument', function() {
			const d = new Dispatcher();
			expect(() => { d.on(); }, 'undefined should throw').to.throw('First argument must be a Store');
			expect(() => { d.on(5); }, 'number should throw').to.throw('First argument must be a Store');
			expect(() => { d.on({}); }, 'object should throw').to.throw('First argument must be a Store');
			expect(() => { d.on({descriptor: 0}); }, 'object should throw').to.throw('First argument must be a Store');
			expect(() => { d.on({descriptor() {return 5;}}); }, 'object should throw').to.throw('First argument must be a Store');
		});
		it('should not allow non-string eventName', function() {
			const d = new Dispatcher();
			const UserStore = Store.build({
				evt_name: {
					dependencies: [],
					run(resolve, reject, action) {
						call = true;
						resolve();
					}
				}
			});
			const us = new UserStore();
			expect(() => { d.on(us); }, 'undefined should throw').to.throw('Second argument eventName must be a string');
			expect(() => { d.on(us, 5); }, 'number should throw').to.throw('Second argument eventName must be a string');
			expect(() => { d.on(us, {}); }, 'object should throw').to.throw('Second argument eventName must be a string');
		});
		it('should work with valid arguments', function() {
			const d = new Dispatcher();
			const UserStore = Store.build('UserStore', d, {
				evt_name: {
					dependencies: [],
					run(resolve, reject, action) {
						call = true;
						resolve();
					}
				}
			});
			const us = new UserStore();
			expect(() => { d.on(us, 'evt_name', null); }).not.to.throw();
		});
		it('should remove old references if called more than once with the same storeDescriptor and eventName', function*() {
			const d = new Dispatcher();
			let call = false;
			const UserStore = Store.build('UserStore', d, {
				evt_name: {
					dependencies: [],
					run(resolve, reject, action) {
						call = true;
						resolve();
					}
				}
			});
			const us = new UserStore();
			
			d.on(us, 'evt_name', ['FooStore']);
			d.on(us, 'evt_name', null);
			yield d.trigger('evt_name');
			expect(call).to.be.true;
		});
		// it('should respect dependencies', function*() {
		// 	const d1 = new Dispatcher();
		// 	const callOrder1 = [];
		// 	const cb1 = (resolve, reject, data) => {
		// 		callOrder1.push(1);
		// 		resolve();
		// 	};
		// 	const cb2 = (resolve, reject, data) => {
		// 		callOrder1.push(2);
		// 		resolve();
		// 	};
		// 	d1.on(us, 'evt_name', ['TestStore'], cb2);
		// 	d1.on(ts, 'evt_name', null, cb1);
		// 	yield d1.trigger('evt_name');
		// 	expect(callOrder1).to.deep.equal([1, 2]);

		// 	const d2 = new Dispatcher();
		// 	const callOrder2 = [];
		// 	const cb3 = (resolve, reject, data) => {
		// 		callOrder2.push(1);
		// 		resolve();
		// 	};
		// 	const cb4 = (resolve, reject, data) => {
		// 		callOrder2.push(2);
		// 		resolve();
		// 	};
		// 	d2.on(ts, 'evt_name', null, cb3);
		// 	d2.on(us, 'evt_name', ['TestStore'], cb4);
		// 	yield d2.trigger('evt_name');
		// 	expect(callOrder1).to.deep.equal([1, 2]);
		// });
		// it('should run events in series', function*() {
		// 	const d1 = new Dispatcher();
		// 	const callOrder1 = [];
		// 	const cb1 = (resolve, reject, data) => {
		// 		callOrder1.push(1);
		// 		resolve();
		// 	};
		// 	const cb2 = (resolve, reject, data) => {
		// 		setTimeout(() => {
		// 			callOrder1.push(2);
		// 			resolve();
		// 		}, 500);
		// 	};
		// 	const cb3 = (resolve, reject, data) => {
		// 		callOrder1.push(3);
		// 		resolve();
		// 	};
		// 	d1.on(us, 'evt_name1', ['TestStore'], cb2);
		// 	d1.on(ts, 'evt_name1', null, cb1);
		// 	d1.on(ts, 'evt_name2', null, cb3);
		// 	yield Promise.all([
		// 		d1.trigger('evt_name1'),
		// 		d1.trigger('evt_name2'),
		// 	]);
		// 	expect(callOrder1).to.deep.equal([1, 2, 3]);
		// });
		// it('should run subsequent events if a previous one is rejected', function*() {
		// 	const d1 = new Dispatcher();
		// 	const callOrder1 = [];
		// 	const cb1 = (resolve, reject, data) => {
		// 		callOrder1.push(1);
		// 		reject();
		// 	};
		// 	const cb2 = (resolve, reject, data) => {
		// 		setTimeout(() => {
		// 			callOrder1.push(2);
		// 			resolve();
		// 		}, 500);
		// 	};
		// 	const cb3 = (resolve, reject, data) => {
		// 		callOrder1.push(3);
		// 		resolve();
		// 	};
		// 	d1.on(us, 'evt_name1', ['TestStore'], cb2);
		// 	d1.on(ts, 'evt_name1', null, cb1);
		// 	d1.on(ts, 'evt_name2', null, cb3);
		// 	yield Promise.all([
		// 		d1.trigger('evt_name1'),
		// 		d1.trigger('evt_name2'),
		// 	]);
		// 	expect(callOrder1).to.deep.equal([1, 2, 3]);
		// });
		// it('should eagerly run events if queue is false', function*() {
		// 	const d1 = new Dispatcher();
		// 	const callOrder1 = [];
		// 	const cb1 = (resolve, reject, data) => {
		// 		callOrder1.push(1);
		// 		resolve();
		// 	};
		// 	const cb2 = (resolve, reject, data) => {
		// 		setTimeout(() => {
		// 			callOrder1.push(2);
		// 			resolve();
		// 		}, 500);
		// 	};
		// 	const cb3 = (resolve, reject, data) => {
		// 		callOrder1.push(3);
		// 		resolve();
		// 	};
		// 	d1.on(us, 'evt_name1', ['TestStore'], cb2);
		// 	d1.on(ts, 'evt_name1', null, cb1);
		// 	d1.on(ts, 'evt_name2', null, cb3);
		// 	yield Promise.all([
		// 		d1.trigger('evt_name1'),
		// 		d1.trigger('evt_name2', null, false),
		// 	]);
		// 	expect(callOrder1).to.deep.equal([1, 3, 2]);
		// });
	});
});