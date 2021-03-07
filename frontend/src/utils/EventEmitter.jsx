class EventEmitter {
  constructor() {
    this.events = {};
  }

  // eslint-disable-next-line no-underscore-dangle
  _getEventListByName(eventName) {
    if (typeof this.events[eventName] === 'undefined') {
      this.events[eventName] = new Set();
    }

    return this.events[eventName];
  }

  on(eventName, fn) {
    // eslint-disable-next-line no-underscore-dangle
    this._getEventListByName(eventName).add(fn);
  }

  once(eventName, fn) {
    const self = this;

    const onceFn = (...args) => {
      self.removeListener(eventName, onceFn);
      fn.apply(self, args);
    };

    this.on(eventName, onceFn);
  }

  emit(eventName, ...args) {
    // eslint-disable-next-line no-underscore-dangle
    this._getEventListByName(eventName).forEach((fn) => {
      fn.apply(this, args);
    });
  }

  removeListener(eventName, fn) {
    // eslint-disable-next-line no-underscore-dangle
    this._getEventListByName(eventName).delete(fn);
  }
}

export default EventEmitter;
