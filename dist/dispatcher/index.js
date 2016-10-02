'use strict';

var Event = require('../event/index');
var auto = require('../promise.auto');
var isFunction = require('../is-function');

module.exports = function Dispatcher() {
	var storeEventHandlers = {};
	var eventHandler = new Event();

	this.on = function (storeDescriptor, eventName, dependencies, run) {
		if (typeof storeDescriptor !== 'string') {
			throw new Error('First argument storeDescriptor must be a string');
		}
		if (typeof eventName !== 'string') {
			throw new Error('Second argument eventName must be a string');
		}
		if (!isFunction(run)) {
			throw new Error('Fourth argument run must be a function');
		}
		dependencies = dependencies || [];
		if (!storeEventHandlers.hasOwnProperty(eventName)) {
			storeEventHandlers[eventName] = {};
		}
		if (!storeEventHandlers[eventName].hasOwnProperty(storeDescriptor)) {
			storeEventHandlers[eventName][storeDescriptor] = [];
		}
		storeEventHandlers[eventName][storeDescriptor] = {
			dependencies: dependencies,
			run: run
		};

		eventHandler.off(eventName);
		eventHandler.on(eventName, this.handleAllEvents(eventName));
	};

	this.handleAllEvents = function (eventName) {
		var _this = this;

		return function (resolve, reject, data) {
			if (!storeEventHandlers.hasOwnProperty(eventName)) {
				return;
			}
			var autoObj = {};
			var handlersByStore = storeEventHandlers[eventName];
			for (var storeDescriptor in handlersByStore) {
				var store = handlersByStore[storeDescriptor];
				autoObj[storeDescriptor] = {
					dependencies: store.dependencies || [],
					run: _this.handleStoreEvents(store.run, data)
				};
			}

			return auto(autoObj).then(resolve).catch(reject);
		};
	};

	this.handleStoreEvents = function (run, data) {
		return function (resolve, reject) {
			return new Promise(function (resolve, reject) {
				run(resolve, reject, data);
			}).then(resolve).catch(reject);
		};
	};

	this.trigger = eventHandler.trigger;
};