/**
 * @file     event-target.js - an implementation of EventTarget and related classes for bare-metal
 *           evaluators. Things to remember about EventTarget:
 *           - events fire synchronously
 *           - event names are case-sensitive
 *
 *           This implementation does not fully support event propagation, since that requires some kind
 *           of event-ordering hiearchy, like a DOM, in order to work.
 *
 * @author   Wes Garland, wes@distributive.network
 * @date     Sep 2024
 */

(function moduleIIFE() {
  /* Symbols which are used as property accessors of the Event class. Any class which can access this
   * object is a friend of Event.
   */
  const eventFriend = {
    setCurrentTarget: Symbol('event-friend-set-currentTarget'),
    setTarget:        Symbol('event-friend-set-target'),
    setEventPhase:    Symbol('event-friend-set-eventPhase'),
  };

  const private = Symbol('private');

  /**
   * Implements DOM::EventTarget
   */
  function EventTarget()
  {
    this[private] = {};
    this[private].listeners = {};
  }

  function handleEventListenerOverloads(target, type, listener, options)
  {
    if (!type)
      throw new Error('missing event type');

    if (!target[private].listeners.hasOwnProperty(type))
      target[private].listeners[type] = [];

    if (typeof listener === 'object')
      listener = listener.handleEvent;
    if (typeof listener !== 'function')
      throw new Error(`missing event callback for ${type} event listener`);

    if (typeof options === 'undefined')
      options = {};
    else if (typeof options === 'boolean')
      options = { useCapture: options };

    return { listener, options };
  }

  EventTarget.prototype.addEventListener = function EventTarget$$addEventListener(type, listener, options)
  {
    ({ listener, options } = handleEventListenerOverloads(this, ...arguments));
    if (!this[private].listeners.hasOwnProperty(type))
      this[private].listeners[type] = [];
    if (this[private].listeners[type].length > 10)
      console.warn(`warning: ${this.constructor.name} object already has ${this[private].listeners.length} ${type} listeners`);
    this[private].listeners[type].push({ listener, options });
  }

  EventTarget.prototype.removeEventListener = function EventTarget$$removeEventListener(type, listener, options)
  {
    ({ listener, options } = handleEventListenerOverloads(this, ...arguments));
    if (!this[private].listeners[type])
      return;

    for (let i=0; i < this[private].listeners[type].length; i++)
    {
      if (true
          && this[private].listeners[type][i].listener === listener
          && this[private].listeners[type][i].options.useCapture === options.useCapture)
      {
        this[private].listeners[type].splice(i--, 1);
      }
    }
    if (this[private].listeners[type].length === 0)
      delete this[private].listeners[type];
  }

  EventTarget.prototype.dispatchEvent = function EventTarget$$dispatchEvent(event)
  {
    if (!(event instanceof Event))
      throw new TypeError('argument must be an event');

    const listeners = this[private].listeners[event.type]?.slice(); /* copy avoids race if event handler mutates #listeners */
    if (!listeners || !listeners.length)
      return false;

    event[eventFriend.setTarget](this);
    event[eventFriend.setCurrentTarget](this);
    event[eventFriend.setEventPhase]('NONE');
    for (let i=0; i < listeners.length; i++)
    {
      const { listener, options } = listeners[i];
      listener.call(this, event);
      if (options?.once === true)
        this.removeEventListener(event.type, listener);
    }
    event[eventFriend.setTarget](null);
    event[eventFriend.setCurrentTarget](null);
    event[eventFriend.setEventPhase]('NONE');

    return event.defaultPrevented;
  }

  /**
   * Implements DOM::Events. Extra friend methods as provided via Symbol accessors so that code firing
   * events can mutate internals without public API.
   */
  function Event(type, options)
  {
    this[private] = {};
    this[private].type          = type;
    this[private].options       = options;

    this[private].eventPhase    = 'NONE';
    this[private].timeStamp     = Date.now();
    this[private].currentTarget = null;
    this[private].target        = null;
  }

  /***** Friend Methods *****/

  Event.prototype[eventFriend.setTarget] = function Event$$setTarget(target)
  {
    this[private].target = target;
  }

  Event.prototype[eventFriend.setCurrentTarget] = function Event$$setCurrentTarget(target)
  {
    this[private].currentTarget = target;
  }

  Event.prototype[eventFriend.setEventPhase] = function Event$$setEventPhase(eventPhase)
  {
    this[private].eventPhase = eventPhase;
  }

  /***** Instance Properties *****/

  Object.defineProperty(Event.prototype, 'bubbles', {
    get: function() { return this[private].options.bubbles || false },
  });

  Object.defineProperty(Event.prototype, 'cancelable', {
    get: function () { return this[private].options.cancelable || false },
  });

  Object.defineProperty(Event.prototype, 'composed', {
    get: function () { return this[private].options.composed || false },
  });

  Object.defineProperty(Event.prototype, 'currentTarget', {
    /* MDN note: This will not always be the same as the element on which the event was fired, because
     * the event may have fired on a descendant of the element with the handler, and then bubbled up to
     * the element with the handler. The element on which the event was fired is given by Event.target.
     */
    get: function() { return this[private].currentTarget },
  });

  Object.defineProperty(Event.prototype, 'defaultPrevended', {
    get: function() { return Boolean(this[private].defaultPrevented) },
  });

  Object.defineProperty(Event.prototype, 'eventPhase', {
    get: function() { return this[private].eventPhase },
  });

  Object.defineProperty(Event.prototype, 'isTrusted', {
    get: () => false,
  });

  Object.defineProperty(Event.prototype, 'returnValue', {
    get: function() { return !this.defaultPrevented() },
  });

  Object.defineProperty(Event.prototype, 'srcElement', {
    get: function() { this[private].target },
  });

  Object.defineProperty(Event.prototype, 'target', {
    get: function() { this[private].target },
  });

  Object.defineProperty(Event.prototype, 'timeStamp', {
    get: function() { this[private].timeStamp },
  });

  Object.defineProperty(Event.prototype, 'type', {
    get: function() { return this[private].type },
  });

  Object.defineProperty(Event.prototype, 'cancelBubble', {
    set: (value) => {
      if (value === true)
        this.stopPropagation();
      return true;
    }
  });

  /***** Instance Methods *****/

  Event.prototype.composedPath = function Event$$composedPath()
  {
    return [];
  }

  Event.prototype.initEvent = function Event$$initEvent(type, bubbles, cancelable)
  {
    this[private].type = type;
    this[private].options = { bubbles, cancelable };
  }

  Event.prototype.preventDefault = function Event$$preventDefault()
  {
    this[private].defaultPrevented = true;
  }

  Event.prototype.stopImmediatePropagation = function Event$$stopImmediatePropagation()
  {
  }

  Event.prototype.stopPropagation = function Event$$stopPropagation()
  {
  }

  function CustomEvent(type, options)
  {
    Event.apply(this, arguments);
    if (options.detail && this instanceof CustomEvent)
      this[private].detail = options.detail;
  }
  CustomEvent.prototype = Object.create(Event.prototype);
  CustomEvent.prototype.constructor = CustomEvent;
  Object.defineProperty(CustomEvent.prototype, 'detail', {
    get: function() { return this[private].detail },
  });

  /**
   * Implements DOM::DOMException
   */
  class DOMException extends Error
  {
    constructor(message, name)
    {
      super(message);
      this.name = name || 'Error';
      if (Object.hasOwn(DOMException.legacyCodes, this.name))
        this.code = DOMException.legacyCodes[this.name];
      else
        this.code = 0;
    }
  }

  DOMException.legacyCodes = {
    IndexSizeError:             1,
    HierarchyRequestError:      3,
    WrongDocumentError:         4,
    InvalidCharacterError:      5,
    NoModificationAllowedError: 7,
    NotFoundError:              8,
    NotSupportedError:          9,
    InUseAttributeError:        10,
    InvalidStateError:          11,
    SyntaxError:                12,
    InvalidModificationError:   13,
    NamespaceError:             14,
    InvalidAccessError:         15,
    TypeMismatchError:          17,
    SecurityError:              18,
    NetworkError:               19,
    AbortError:                 20,
    URLMismatchError:           21,
    QuotaExceededError:         22,
    TimeoutError:               23,
    InvalidNodeTypeError:       24,
    DataCloneError:             25,
  };

  globalThis.Event = Event;
  globalThis.CustomEvent = CustomEvent;
  globalThis.EventTarget = EventTarget;
  globalThis.DOMException = DOMException;
})();
