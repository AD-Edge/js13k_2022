'use strict';

var kontra = (function () {

  let noop = () => {};

  // style used for DOM nodes needed for screen readers
  let srOnlyStyle =
    'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);';

  /**
   * Append a node directly after the canvas and as the last element of other kontra nodes.
   *
   * @param {HTMLElement} node - Node to append.
   * @param {HTMLCanvasElement} canvas - Canvas to append after.
   */
  function addToDom(node, canvas) {
    let container = canvas.parentNode;

    node.setAttribute('data-kontra', '');
    if (container) {
      let target =
        container.querySelector('[data-kontra]:last-of-type') || canvas;
      container.insertBefore(node, target.nextSibling);
    } else {
      document.body.appendChild(node);
    }
  }

  /**
   * Remove an item from an array.
   *
   * @param {*[]} array - Array to remove from.
   * @param {*} item - Item to remove.
   *
   * @returns {Boolean|undefined} True if the item was removed.
   */
  function removeFromArray(array, item) {
    let index = array.indexOf(item);
    if (index != -1) {
      array.splice(index, 1);
      return true;
    }
  }

  /**
   * A simple event system. Allows you to hook into Kontra lifecycle events or create your own, such as for [Plugins](api/plugin).
   *
   * ```js
   * import { on, off, emit } from 'kontra';
   *
   * function callback(a, b, c) {
   *   console.log({a, b, c});
   * });
   *
   * on('myEvent', callback);
   * emit('myEvent', 1, 2, 3);  //=> {a: 1, b: 2, c: 3}
   * off('myEvent', callback);
   * ```
   * @sectionName Events
   */

  // expose for testing
  let callbacks$2 = {};

  /**
   * There are currently only three lifecycle events:
   * - `init` - Emitted after `kontra.init()` is called.
   * - `tick` - Emitted every frame of [GameLoop](api/gameLoop) before the loops `update()` and `render()` functions are called.
   * - `assetLoaded` - Emitted after an asset has fully loaded using the asset loader. The callback function is passed the asset and the url of the asset as parameters.
   * @sectionName Lifecycle Events
   */

  /**
   * Register a callback for an event to be called whenever the event is emitted. The callback will be passed all arguments used in the `emit` call.
   * @function on
   *
   * @param {String} event - Name of the event.
   * @param {Function} callback - Function that will be called when the event is emitted.
   */
  function on(event, callback) {
    callbacks$2[event] = callbacks$2[event] || [];
    callbacks$2[event].push(callback);
  }

  /**
   * Call all callback functions for the event. All arguments will be passed to the callback functions.
   * @function emit
   *
   * @param {String} event - Name of the event.
   * @param {...*} args - Comma separated list of arguments passed to all callbacks.
   */
  function emit(event, ...args) {
    (callbacks$2[event] || []).map(fn => fn(...args));
  }

  /**
   * Functions for initializing the Kontra library and getting the canvas and context
   * objects.
   *
   * ```js
   * import { getCanvas, getContext, init } from 'kontra';
   *
   * let { canvas, context } = init();
   *
   * // or can get canvas and context through functions
   * canvas = getCanvas();
   * context = getContext();
   * ```
   * @sectionName Core
   */

  let canvasEl, context;

  // allow contextless environments, such as using ThreeJS as the main
  // canvas, by proxying all canvas context calls
  let handler$1 = {
    // by using noop we can proxy both property and function calls
    // so neither will throw errors
    get(target, key) {
      // export for testing
      if (key == '_proxy') return true;
      return noop;
    }
  };

  /**
   * Return the canvas element.
   * @function getCanvas
   *
   * @returns {HTMLCanvasElement} The canvas element for the game.
   */
  function getCanvas() {
    return canvasEl;
  }

  /**
   * Return the context object.
   * @function getContext
   *
   * @returns {CanvasRenderingContext2D} The context object the game draws to.
   */
  function getContext() {
    return context;
  }

  /**
   * Initialize the library and set up the canvas. Typically you will call `init()` as the first thing and give it the canvas to use. This will allow all Kontra objects to reference the canvas when created.
   *
   * ```js
   * import { init } from 'kontra';
   *
   * let { canvas, context } = init('game');
   * ```
   * @function init
   *
   * @param {String|HTMLCanvasElement} [canvas] - The canvas for Kontra to use. Can either be the ID of the canvas element or the canvas element itself. Defaults to using the first canvas element on the page.
   * @param {Object} [options] - Game options.
   * @param {Boolean} [options.contextless=false] - If the game will run in an contextless environment. A contextless environment uses a [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) for the `canvas` and `context` so all property and function calls will noop.
   *
   * @returns {{canvas: HTMLCanvasElement, context: CanvasRenderingContext2D}} An object with properties `canvas` and `context`. `canvas` it the canvas element for the game and `context` is the context object the game draws to.
   */
  function init$1(canvas, { contextless = false } = {}) {
    // check if canvas is a string first, an element next, or default to
    // getting first canvas on page
    canvasEl =
      document.getElementById(canvas) ||
      canvas ||
      document.querySelector('canvas');

    if (contextless) {
      canvasEl = canvasEl || new Proxy({}, handler$1);
    }

    // @ifdef DEBUG
    if (!canvasEl) {
      throw Error('You must provide a canvas element for the game');
    }
    // @endif

    context = canvasEl.getContext('2d') || new Proxy({}, handler$1);
    context.imageSmoothingEnabled = false;

    emit('init');

    return { canvas: canvasEl, context };
  }

  /**
   * Rotate a point by an angle.
   * @function rotatePoint
   *
   * @param {{x: Number, y: Number}} point - The {x,y} point to rotate.
   * @param {Number} angle - Angle (in radians) to rotate.
   *
   * @returns {{x: Number, y: Number}} The new x and y coordinates after rotation.
   */
  function rotatePoint(point, angle) {
    let sin = Math.sin(angle);
    let cos = Math.cos(angle);

    return {
      x: point.x * cos - point.y * sin,
      y: point.x * sin + point.y * cos
    };
  }

  /**
   * Clamp a number between two values, preventing it from going below or above the minimum and maximum values.
   * @function clamp
   *
   * @param {Number} min - Min value.
   * @param {Number} max - Max value.
   * @param {Number} value - Value to clamp.
   *
   * @returns {Number} Value clamped between min and max.
   */
  function clamp(min, max, value) {
    return Math.min(Math.max(min, value), max);
  }

  /**
   * Return the world rect of an object. The rect is the world position of the top-left corner of the object and its size. Takes into account the objects anchor and scale.
   * @function getWorldRect
   *
   * @param {{x: Number, y: Number, width: Number, height: Number}|{world: {x: Number, y: Number, width: Number, height: Number}}|{mapwidth: Number, mapheight: Number}} obj - Object to get world rect of.
   *
   * @returns {{x: Number, y: Number, width: Number, height: Number}} The world `x`, `y`, `width`, and `height` of the object.
   */
  function getWorldRect(obj) {
    let { x = 0, y = 0, width, height } = obj.world || obj;

    // take into account tileEngine
    if (obj.mapwidth) {
      width = obj.mapwidth;
      height = obj.mapheight;
    }

    // @ifdef GAMEOBJECT_ANCHOR
    // account for anchor
    if (obj.anchor) {
      x -= width * obj.anchor.x;
      y -= height * obj.anchor.y;
    }
    // @endif

    // @ifdef GAMEOBJECT_SCALE
    // account for negative scales
    if (width < 0) {
      x += width;
      width *= -1;
    }
    if (height < 0) {
      y += height;
      height *= -1;
    }
    // @endif

    return {
      x,
      y,
      width,
      height
    };
  }

  /**
   * A simple 2d vector object.
   *
   * ```js
   * import { Vector } from 'kontra';
   *
   * let vector = Vector(100, 200);
   * ```
   * @class Vector
   *
   * @param {Number} [x=0] - X coordinate of the vector.
   * @param {Number} [y=0] - Y coordinate of the vector.
   */
  class Vector {
    constructor(x = 0, y = 0, vec = {}) {
      this.x = x;
      this.y = y;

      // @ifdef VECTOR_CLAMP
      // preserve vector clamping when creating new vectors
      if (vec._c) {
        this.clamp(vec._a, vec._b, vec._d, vec._e);

        // reset x and y so clamping takes effect
        this.x = x;
        this.y = y;
      }
      // @endif
    }

    /**
     * Calculate the addition of the current vector with the given vector.
     * @memberof Vector
     * @function add
     *
     * @param {Vector|{x: number, y: number}} vector - Vector to add to the current Vector.
     *
     * @returns {Vector} A new Vector instance whose value is the addition of the two vectors.
     */
    add(vec) {
      return new Vector(this.x + vec.x, this.y + vec.y, this);
    }

    // @ifdef VECTOR_SUBTRACT
    /**
     * Calculate the subtraction of the current vector with the given vector.
     * @memberof Vector
     * @function subtract
     *
     * @param {Vector|{x: number, y: number}} vector - Vector to subtract from the current Vector.
     *
     * @returns {Vector} A new Vector instance whose value is the subtraction of the two vectors.
     */
    subtract(vec) {
      return new Vector(this.x - vec.x, this.y - vec.y, this);
    }
    // @endif

    // @ifdef VECTOR_SCALE
    /**
     * Calculate the multiple of the current vector by a value.
     * @memberof Vector
     * @function scale
     *
     * @param {Number} value - Value to scale the current Vector.
     *
     * @returns {Vector} A new Vector instance whose value is multiplied by the scalar.
     */
    scale(value) {
      return new Vector(this.x * value, this.y * value);
    }
    // @endif

    // @ifdef VECTOR_NORMALIZE
    /**
     * Calculate the normalized value of the current vector. Requires the Vector [length](api/vector#length) function.
     * @memberof Vector
     * @function normalize
     *
     * @returns {Vector} A new Vector instance whose value is the normalized vector.
     */
    // @see https://github.com/jed/140bytes/wiki/Byte-saving-techniques#use-placeholder-arguments-instead-of-var
    normalize(length = this.length()) {
      return new Vector(this.x / length, this.y / length);
    }
    // @endif

    // @ifdef VECTOR_DOT||VECTOR_ANGLE
    /**
     * Calculate the dot product of the current vector with the given vector.
     * @memberof Vector
     * @function dot
     *
     * @param {Vector|{x: number, y: number}} vector - Vector to dot product against.
     *
     * @returns {Number} The dot product of the vectors.
     */
    dot(vec) {
      return this.x * vec.x + this.y * vec.y;
    }
    // @endif

    // @ifdef VECTOR_LENGTH||VECTOR_NORMALIZE||VECTOR_ANGLE
    /**
     * Calculate the length (magnitude) of the Vector.
     * @memberof Vector
     * @function length
     *
     * @returns {Number} The length of the vector.
     */
    length() {
      return Math.hypot(this.x, this.y);
    }
    // @endif

    // @ifdef VECTOR_DISTANCE
    /**
     * Calculate the distance between the current vector and the given vector.
     * @memberof Vector
     * @function distance
     *
     * @param {Vector|{x: number, y: number}} vector - Vector to calculate the distance between.
     *
     * @returns {Number} The distance between the two vectors.
     */
    distance(vec) {
      return Math.hypot(this.x - vec.x, this.y - vec.y);
    }
    // @endif

    // @ifdef VECTOR_ANGLE
    /**
     * Calculate the angle (in radians) between the current vector and the given vector. Requires the Vector [dot](api/vector#dot) and [length](api/vector#length) functions.
     * @memberof Vector
     * @function angle
     *
     * @param {Vector} vector - Vector to calculate the angle between.
     *
     * @returns {Number} The angle (in radians) between the two vectors.
     */
    angle(vec) {
      return Math.acos(this.dot(vec) / (this.length() * vec.length()));
    }
    // @endif

    // @ifdef VECTOR_CLAMP
    /**
     * Clamp the Vector between two points, preventing `x` and `y` from going below or above the minimum and maximum values. Perfect for keeping a sprite from going outside the game boundaries.
     *
     * ```js
     * import { Vector } from 'kontra';
     *
     * let vector = Vector(100, 200);
     * vector.clamp(0, 0, 200, 300);
     *
     * vector.x += 200;
     * console.log(vector.x);  //=> 200
     *
     * vector.y -= 300;
     * console.log(vector.y);  //=> 0
     *
     * vector.add({x: -500, y: 500});
     * console.log(vector);    //=> {x: 0, y: 300}
     * ```
     * @memberof Vector
     * @function clamp
     *
     * @param {Number} xMin - Minimum x value.
     * @param {Number} yMin - Minimum y value.
     * @param {Number} xMax - Maximum x value.
     * @param {Number} yMax - Maximum y value.
     */
    clamp(xMin, yMin, xMax, yMax) {
      this._c = true;
      this._a = xMin;
      this._b = yMin;
      this._d = xMax;
      this._e = yMax;
    }

    /**
     * X coordinate of the vector.
     * @memberof Vector
     * @property {Number} x
     */
    get x() {
      return this._x;
    }

    /**
     * Y coordinate of the vector.
     * @memberof Vector
     * @property {Number} y
     */
    get y() {
      return this._y;
    }

    set x(value) {
      this._x = this._c ? clamp(this._a, this._d, value) : value;
    }

    set y(value) {
      this._y = this._c ? clamp(this._b, this._e, value) : value;
    }
    // @endif
  }

  function factory$a() {
    return new Vector(...arguments);
  }

  /**
   * This is a private class that is used just to help make the GameObject class more manageable and smaller.
   *
   * It maintains everything that can be changed in the update function:
   * position
   * velocity
   * acceleration
   * ttl
   */
  class Updatable {
    constructor(properties) {
      return this.init(properties);
    }

    init(properties = {}) {
      // --------------------------------------------------
      // defaults
      // --------------------------------------------------

      /**
       * The game objects position vector. Represents the local position of the object as opposed to the [world](api/gameObject#world) position.
       * @property {Vector} position
       * @memberof GameObject
       * @page GameObject
       */
      this.position = factory$a();

      // --------------------------------------------------
      // optionals
      // --------------------------------------------------

      // @ifdef GAMEOBJECT_VELOCITY
      /**
       * The game objects velocity vector.
       * @memberof GameObject
       * @property {Vector} velocity
       * @page GameObject
       */
      this.velocity = factory$a();
      // @endif

      // @ifdef GAMEOBJECT_ACCELERATION
      /**
       * The game objects acceleration vector.
       * @memberof GameObject
       * @property {Vector} acceleration
       * @page GameObject
       */
      this.acceleration = factory$a();
      // @endif

      // @ifdef GAMEOBJECT_TTL
      /**
       * How may frames the game object should be alive.
       * @memberof GameObject
       * @property {Number} ttl
       * @page GameObject
       */
      this.ttl = Infinity;
      // @endif

      // add all properties to the object, overriding any defaults
      Object.assign(this, properties);
    }

    /**
     * Update the position of the game object and all children using their velocity and acceleration. Calls the game objects [advance()](api/gameObject#advance) function.
     * @memberof GameObject
     * @function update
     * @page GameObject
     *
     * @param {Number} [dt] - Time since last update.
     */
    update(dt) {
      this.advance(dt);
    }

    /**
     * Move the game object by its acceleration and velocity. If you pass `dt` it will multiply the vector and acceleration by that number. This means the `dx`, `dy`, `ddx` and `ddy` should be how far you want the object to move in 1 second rather than in 1 frame.
     *
     * If you override the game objects [update()](api/gameObject#update) function with your own update function, you can call this function to move the game object normally.
     *
     * ```js
     * import { GameObject } from 'kontra';
     *
     * let gameObject = GameObject({
     *   x: 100,
     *   y: 200,
     *   width: 20,
     *   height: 40,
     *   dx: 5,
     *   dy: 2,
     *   update: function() {
     *     // move the game object normally
     *     this.advance();
     *
     *     // change the velocity at the edges of the canvas
     *     if (this.x < 0 ||
     *         this.x + this.width > this.context.canvas.width) {
     *       this.dx = -this.dx;
     *     }
     *     if (this.y < 0 ||
     *         this.y + this.height > this.context.canvas.height) {
     *       this.dy = -this.dy;
     *     }
     *   }
     * });
     * ```
     * @memberof GameObject
     * @function advance
     * @page GameObject
     *
     * @param {Number} [dt] - Time since last update.
     *
     */
    advance(dt) {
      // @ifdef GAMEOBJECT_VELOCITY
      // @ifdef GAMEOBJECT_ACCELERATION
      let acceleration = this.acceleration;

      // @ifdef VECTOR_SCALE
      if (dt) {
        acceleration = acceleration.scale(dt);
      }
      // @endif

      this.velocity = this.velocity.add(acceleration);
      // @endif
      // @endif

      // @ifdef GAMEOBJECT_VELOCITY
      let velocity = this.velocity;

      // @ifdef VECTOR_SCALE
      if (dt) {
        velocity = velocity.scale(dt);
      }
      // @endif

      this.position = this.position.add(velocity);
      this._pc();
      // @endif

      // @ifdef GAMEOBJECT_TTL
      this.ttl--;
      // @endif
    }

    // --------------------------------------------------
    // velocity
    // --------------------------------------------------

    // @ifdef GAMEOBJECT_VELOCITY
    /**
     * X coordinate of the velocity vector.
     * @memberof GameObject
     * @property {Number} dx
     * @page GameObject
     */
    get dx() {
      return this.velocity.x;
    }

    /**
     * Y coordinate of the velocity vector.
     * @memberof GameObject
     * @property {Number} dy
     * @page GameObject
     */
    get dy() {
      return this.velocity.y;
    }

    set dx(value) {
      this.velocity.x = value;
    }

    set dy(value) {
      this.velocity.y = value;
    }
    // @endif

    // --------------------------------------------------
    // acceleration
    // --------------------------------------------------

    // @ifdef GAMEOBJECT_ACCELERATION
    /**
     * X coordinate of the acceleration vector.
     * @memberof GameObject
     * @property {Number} ddx
     * @page GameObject
     */
    get ddx() {
      return this.acceleration.x;
    }

    /**
     * Y coordinate of the acceleration vector.
     * @memberof GameObject
     * @property {Number} ddy
     * @page GameObject
     */
    get ddy() {
      return this.acceleration.y;
    }

    set ddx(value) {
      this.acceleration.x = value;
    }

    set ddy(value) {
      this.acceleration.y = value;
    }
    // @endif

    // --------------------------------------------------
    // ttl
    // --------------------------------------------------

    // @ifdef GAMEOBJECT_TTL
    /**
     * Check if the game object is alive.
     * @memberof GameObject
     * @function isAlive
     * @page GameObject
     *
     * @returns {Boolean} `true` if the game objects [ttl](api/gameObject#ttl) property is above `0`, `false` otherwise.
     */
    isAlive() {
      return this.ttl > 0;
    }
    // @endif

    _pc() {}
  }

  /**
   * The base class of most renderable classes. Handles things such as position, rotation, anchor, and the update and render life cycle.
   *
   * Typically you don't create a GameObject directly, but rather extend it for new classes.
   * @class GameObject
   *
   * @param {Object} [properties] - Properties of the game object.
   * @param {Number} [properties.x] - X coordinate of the position vector.
   * @param {Number} [properties.y] - Y coordinate of the position vector.
   * @param {Number} [properties.width] - Width of the game object.
   * @param {Number} [properties.height] - Height of the game object.
   *
   * @param {CanvasRenderingContext2D} [properties.context] - The context the game object should draw to. Defaults to [core.getContext()](api/core#getContext).
   *
   * @param {Number} [properties.dx] - X coordinate of the velocity vector.
   * @param {Number} [properties.dy] - Y coordinate of the velocity vector.
   * @param {Number} [properties.ddx] - X coordinate of the acceleration vector.
   * @param {Number} [properties.ddy] - Y coordinate of the acceleration vector.
   * @param {Number} [properties.ttl=Infinity] - How many frames the game object should be alive. Used by [Pool](api/pool).
   *
   * @param {{x: Number, y: Number}} [properties.anchor={x:0,y:0}] - The x and y origin of the game object. {x:0, y:0} is the top left corner of the game object, {x:1, y:1} is the bottom right corner.
   * @param {GameObject[]} [properties.children] - Children to add to the game object.
   * @param {Number} [properties.opacity=1] - The opacity of the game object.
   * @param {Number} [properties.rotation=0] - The rotation around the anchor in radians.
   * @param {Number} [properties.scaleX=1] - The x scale of the game object.
   * @param {Number} [properties.scaleY=1] - The y scale of the game object.
   *
   * @param {(dt?: Number) => void} [properties.update] - Function called every frame to update the game object.
   * @param {Function} [properties.render] - Function called every frame to render the game object.
   *
   * @param {...*} properties.props - Any additional properties you need added to the game object. For example, if you pass `gameObject({type: 'player'})` then the game object will also have a property of the same name and value. You can pass as many additional properties as you want.
   */
  class GameObject extends Updatable {
    /**
     * @docs docs/api_docs/gameObject.js
     */

    /**
     * Use this function to reinitialize a game object. It takes the same properties object as the constructor. Useful it you want to repurpose a game object.
     * @memberof GameObject
     * @function init
     *
     * @param {Object} properties - Properties of the game object.
     */
    init({
      // --------------------------------------------------
      // defaults
      // --------------------------------------------------

      /**
       * The width of the game object. Represents the local width of the object as opposed to the [world](api/gameObject#world) width.
       * @memberof GameObject
       * @property {Number} width
       */
      width = 0,

      /**
       * The height of the game object. Represents the local height of the object as opposed to the [world](api/gameObject#world) height.
       * @memberof GameObject
       * @property {Number} height
       */
      height = 0,

      /**
       * The context the game object will draw to.
       * @memberof GameObject
       * @property {CanvasRenderingContext2D} context
       */
      context = getContext(),

      render = this.draw,
      update = this.advance,

      // --------------------------------------------------
      // optionals
      // --------------------------------------------------

      // @ifdef GAMEOBJECT_GROUP
      /**
       * The game objects parent object.
       * @memberof GameObject
       * @property {GameObject|null} parent
       */

      /**
       * The game objects children objects.
       * @memberof GameObject
       * @property {GameObject[]} children
       */
      children = [],
      // @endif

      // @ifdef GAMEOBJECT_ANCHOR
      /**
       * The x and y origin of the game object. {x:0, y:0} is the top left corner of the game object, {x:1, y:1} is the bottom right corner.
       * @memberof GameObject
       * @property {{x: Number, y: Number}} anchor
       *
       * @example
       * // exclude-code:start
       * let { GameObject } = kontra;
       * // exclude-code:end
       * // exclude-script:start
       * import { GameObject } from 'kontra';
       * // exclude-script:end
       *
       * let gameObject = GameObject({
       *   x: 150,
       *   y: 100,
       *   width: 50,
       *   height: 50,
       *   color: 'red',
       *   // exclude-code:start
       *   context: context,
       *   // exclude-code:end
       *   render: function() {
       *     this.context.fillStyle = this.color;
       *     this.context.fillRect(0, 0, this.height, this.width);
       *   }
       * });
       *
       * function drawOrigin(gameObject) {
       *   gameObject.context.fillStyle = 'yellow';
       *   gameObject.context.beginPath();
       *   gameObject.context.arc(gameObject.x, gameObject.y, 3, 0, 2*Math.PI);
       *   gameObject.context.fill();
       * }
       *
       * gameObject.render();
       * drawOrigin(gameObject);
       *
       * gameObject.anchor = {x: 0.5, y: 0.5};
       * gameObject.x = 300;
       * gameObject.render();
       * drawOrigin(gameObject);
       *
       * gameObject.anchor = {x: 1, y: 1};
       * gameObject.x = 450;
       * gameObject.render();
       * drawOrigin(gameObject);
       */
      anchor = { x: 0, y: 0 },
      // @endif

      // @ifdef GAMEOBJECT_OPACITY
      /**
       * The opacity of the object. Represents the local opacity of the object as opposed to the [world](api/gameObject#world) opacity.
       * @memberof GameObject
       * @property {Number} opacity
       */
      opacity = 1,
      // @endif

      // @ifdef GAMEOBJECT_ROTATION
      /**
       * The rotation of the game object around the anchor in radians. Represents the local rotation of the object as opposed to the [world](api/gameObject#world) rotation.
       * @memberof GameObject
       * @property {Number} rotation
       */
      rotation = 0,
      // @endif

      // @ifdef GAMEOBJECT_SCALE
      /**
       * The x scale of the object. Represents the local x scale of the object as opposed to the [world](api/gameObject#world) x scale.
       * @memberof GameObject
       * @property {Number} scaleX
       */
      scaleX = 1,

      /**
       * The y scale of the object. Represents the local y scale of the object as opposed to the [world](api/gameObject#world) y scale.
       * @memberof GameObject
       * @property {Number} scaleY
       */
      scaleY = 1,
      // @endif

      ...props
    } = {}) {
      // @ifdef GAMEOBJECT_GROUP
      this._c = [];
      // @endif

      // by setting defaults to the parameters and passing them into
      // the init, we can ensure that a parent class can set overriding
      // defaults and the GameObject won't undo it (if we set
      // `this.width` then no parent could provide a default value for
      // width)
      super.init({
        width,
        height,
        context,

        // @ifdef GAMEOBJECT_ANCHOR
        anchor,
        // @endif

        // @ifdef GAMEOBJECT_OPACITY
        opacity,
        // @endif

        // @ifdef GAMEOBJECT_ROTATION
        rotation,
        // @endif

        // @ifdef GAMEOBJECT_SCALE
        scaleX,
        scaleY,
        // @endif

        ...props
      });

      // di = done init
      this._di = true;
      this._uw();

      // @ifdef GAMEOBJECT_GROUP
      this.addChild(children);
      // @endif

      // rf = render function
      this._rf = render;

      // uf = update function
      this._uf = update;
    }

    /**
     * Update all children
     */
    update(dt) {
      this._uf(dt);

      // @ifdef GAMEOBJECT_GROUP
      this.children.map(child => child.update && child.update(dt));
      // @endif
    }

    /**
     * Render the game object and all children. Calls the game objects [draw()](api/gameObject#draw) function.
     * @memberof GameObject
     * @function render
     */
    render() {
      let context = this.context;
      context.save();

      // 1) translate to position
      //
      // it's faster to only translate if one of the values is non-zero
      // rather than always translating
      // @see https://jsperf.com/translate-or-if-statement/2
      if (this.x || this.y) {
        context.translate(this.x, this.y);
      }

      // @ifdef GAMEOBJECT_ROTATION
      // 3) rotate around the anchor
      //
      // it's faster to only rotate when set rather than always rotating
      // @see https://jsperf.com/rotate-or-if-statement/2
      if (this.rotation) {
        context.rotate(this.rotation);
      }
      // @endif

      // @ifdef GAMEOBJECT_SCALE
      // 4) scale after translation to position so object can be
      // scaled in place (rather than scaling position as well).
      //
      // it's faster to only scale if one of the values is not 1
      // rather than always scaling
      // @see https://jsperf.com/scale-or-if-statement/4
      if (this.scaleX != 1 || this.scaleY != 1) {
        context.scale(this.scaleX, this.scaleY);
      }
      // @endif

      // @ifdef GAMEOBJECT_ANCHOR
      // 5) translate to the anchor so (0,0) is the top left corner
      // for the render function
      let anchorX = -this.width * this.anchor.x;
      let anchorY = -this.height * this.anchor.y;

      if (anchorX || anchorY) {
        context.translate(anchorX, anchorY);
      }
      // @endif

      // @ifdef GAMEOBJECT_OPACITY
      // it's not really any faster to gate the global alpha
      // @see https://jsperf.com/global-alpha-or-if-statement/1
      this.context.globalAlpha = this.opacity;
      // @endif

      this._rf();

      // @ifdef GAMEOBJECT_ANCHOR
      // 7) translate back to the anchor so children use the correct
      // x/y value from the anchor
      if (anchorX || anchorY) {
        context.translate(-anchorX, -anchorY);
      }
      // @endif

      // @ifdef GAMEOBJECT_GROUP
      // perform all transforms on the parent before rendering the
      // children
      let children = this.children;
      children.map(child => child.render && child.render());
      // @endif

      context.restore();
    }

    /**
     * Draw the game object at its X and Y position, taking into account rotation, scale, and anchor.
     *
     * Do note that the canvas has been rotated and translated to the objects position (taking into account anchor), so {0,0} will be the top-left corner of the game object when drawing.
     *
     * If you override the game objects `render()` function with your own render function, you can call this function to draw the game object normally.
     *
     * ```js
     * let { GameObject } = kontra;
     *
     * let gameObject = GameObject({
     *  x: 290,
     *  y: 80,
     *  width: 20,
     *  height: 40,
     *
     *  render: function() {
     *    // draw the game object normally (perform rotation and other transforms)
     *    this.draw();
     *
     *    // outline the game object
     *    this.context.strokeStyle = 'yellow';
     *    this.context.lineWidth = 2;
     *    this.context.strokeRect(0, 0, this.width, this.height);
     *  }
     * });
     *
     * gameObject.render();
     * ```
     * @memberof GameObject
     * @function draw
     */
    draw() {}

    /**
     * Sync property changes from the parent to the child
     */
    _pc() {
      this._uw();

      // @ifdef GAMEOBJECT_GROUP
      this.children.map(child => child._pc());
      // @endif
    }

    /**
     * X coordinate of the position vector.
     * @memberof GameObject
     * @property {Number} x
     */
    get x() {
      return this.position.x;
    }

    /**
     * Y coordinate of the position vector.
     * @memberof GameObject
     * @property {Number} y
     */
    get y() {
      return this.position.y;
    }

    set x(value) {
      this.position.x = value;

      // pc = property changed
      this._pc();
    }

    set y(value) {
      this.position.y = value;
      this._pc();
    }

    get width() {
      // w = width
      return this._w;
    }

    set width(value) {
      this._w = value;
      this._pc();
    }

    get height() {
      // h = height
      return this._h;
    }

    set height(value) {
      this._h = value;
      this._pc();
    }

    /**
     * Update world properties
     */
    _uw() {
      // don't update world properties until after the init has finished
      if (!this._di) return;

      // @ifdef GAMEOBJECT_GROUP||GAMEOBJECT_OPACITY||GAMEOBJECT_ROTATION||GAMEOBJECT_SCALE
      let {
        _wx = 0,
        _wy = 0,

        // @ifdef GAMEOBJECT_OPACITY
        _wo = 1,
        // @endif

        // @ifdef GAMEOBJECT_ROTATION
        _wr = 0,
        // @endif

        // @ifdef GAMEOBJECT_SCALE
        _wsx = 1,
        _wsy = 1
        // @endif
      } = this.parent || {};
      // @endif

      // wx = world x, wy = world y
      this._wx = this.x;
      this._wy = this.y;

      // ww = world width, wh = world height
      this._ww = this.width;
      this._wh = this.height;

      // @ifdef GAMEOBJECT_OPACITY
      // wo = world opacity
      this._wo = _wo * this.opacity;
      // @endif

      // @ifdef GAMEOBJECT_SCALE
      // wsx = world scale x, wsy = world scale y
      this._wsx = _wsx * this.scaleX;
      this._wsy = _wsy * this.scaleY;

      this._wx = this._wx * _wsx;
      this._wy = this._wy * _wsy;
      this._ww = this.width * this._wsx;
      this._wh = this.height * this._wsy;
      // @endif

      // @ifdef GAMEOBJECT_ROTATION
      // wr = world rotation
      this._wr = _wr + this.rotation;

      let { x, y } = rotatePoint({ x: this._wx, y: this._wy }, _wr);
      this._wx = x;
      this._wy = y;
      // @endif

      // @ifdef GAMEOBJECT_GROUP
      this._wx += _wx;
      this._wy += _wy;
      // @endif
    }

    /**
     * The world position, width, height, opacity, rotation, and scale. The world property is the true position, width, height, etc. of the object, taking into account all parents.
     *
     * The world property does not adjust for anchor or scale, so if you set a negative scale the world width or height could be negative. Use [getWorldRect](/api/helpers#getWorldRect) to get the world position and size adjusted for anchor and scale.
     * @property {{x: Number, y: Number, width: Number, height: Number, opacity: Number, rotation: Number, scaleX: Number, scaleY: Number}} world
     * @memberof GameObject
     */
    get world() {
      return {
        x: this._wx,
        y: this._wy,
        width: this._ww,
        height: this._wh,

        // @ifdef GAMEOBJECT_OPACITY
        opacity: this._wo,
        // @endif

        // @ifdef GAMEOBJECT_ROTATION
        rotation: this._wr,
        // @endif

        // @ifdef GAMEOBJECT_SCALE
        scaleX: this._wsx,
        scaleY: this._wsy
        // @endif
      };
    }

    // --------------------------------------------------
    // group
    // --------------------------------------------------

    // @ifdef GAMEOBJECT_GROUP
    set children(value) {
      this.removeChild(this._c);
      this.addChild(value);
    }

    get children() {
      return this._c;
    }

    /**
     * Add an object as a child to this object. The objects position, size, and rotation will be relative to the parents position, size, and rotation. The childs [world](api/gameObject#world) property will be updated to take into account this object and all of its parents.
     * @memberof GameObject
     * @function addChild
     *
     * @param {...(GameObject|GameObject[])[]} objects - Object to add as a child. Can be a single object, an array of objects, or a comma-separated list of objects.
     *
     * @example
     * // exclude-code:start
     * let { GameObject } = kontra;
     * // exclude-code:end
     * // exclude-script:start
     * import { GameObject } from 'kontra';
     * // exclude-script:end
     *
     * function createObject(x, y, color, size = 1) {
     *   return GameObject({
     *     x,
     *     y,
     *     width: 50 / size,
     *     height: 50 / size,
     *     anchor: {x: 0.5, y: 0.5},
     *     color,
     *     // exclude-code:start
     *     context: context,
     *     // exclude-code:end
     *     render: function() {
     *       this.context.fillStyle = this.color;
     *       this.context.fillRect(0, 0, this.height, this.width);
     *     }
     *   });
     * }
     *
     * let parent = createObject(300, 100, 'red');
     *
     * // create a child that is 25px to the right and
     * // down from the parents position
     * let child = createObject(25, 25, 'yellow', 2);
     *
     * parent.addChild(child);
     *
     * parent.render();
     */
    addChild(...objects) {
      objects.flat().map(child => {
        this.children.push(child);
        child.parent = this;
        child._pc = child._pc || noop;
        child._pc();
      });
    }

    /**
     * Remove an object as a child of this object. The removed objects [world](api/gameObject#world) property will be updated to not take into account this object and all of its parents.
     * @memberof GameObject
     * @function removeChild
     *
     * @param {...(GameObject|GameObject[])[]} objects - Object to remove as a child. Can be a single object, an array of objects, or a comma-separated list of objects.
     */
    removeChild(...objects) {
      objects.flat().map(child => {
        if (removeFromArray(this.children, child)) {
          child.parent = null;
          child._pc();
        }
      });
    }
    // @endif

    // --------------------------------------------------
    // opacity
    // --------------------------------------------------

    // @ifdef GAMEOBJECT_OPACITY
    get opacity() {
      return this._opa;
    }

    set opacity(value) {
      this._opa = value;
      this._pc();
    }
    // @endif

    // --------------------------------------------------
    // rotation
    // --------------------------------------------------

    // @ifdef GAMEOBJECT_ROTATION
    get rotation() {
      return this._rot;
    }

    set rotation(value) {
      this._rot = value;
      this._pc();
    }
    // @endif

    // --------------------------------------------------
    // scale
    // --------------------------------------------------

    // @ifdef GAMEOBJECT_SCALE
    /**
     * Set the x and y scale of the object. If only one value is passed, both are set to the same value.
     * @memberof GameObject
     * @function setScale
     *
     * @param {Number} x - X scale value.
     * @param {Number} [y=x] - Y scale value.
     */
    setScale(x, y = x) {
      this.scaleX = x;
      this.scaleY = y;
    }

    get scaleX() {
      return this._scx;
    }

    set scaleX(value) {
      this._scx = value;
      this._pc();
    }

    get scaleY() {
      return this._scy;
    }

    set scaleY(value) {
      this._scy = value;
      this._pc();
    }
    // @endif
  }

  function factory$9() {
    return new GameObject(...arguments);
  }

  /**
   * A versatile way to update and draw your sprites. It can handle simple rectangles, images, and sprite sheet animations. It can be used for your main player object as well as tiny particles in a particle engine.
   * @class Sprite
   * @extends GameObject
   *
   * @param {Object} [properties] - Properties of the sprite.
   * @param {String} [properties.color] - Fill color for the game object if no image or animation is provided.
   * @param {HTMLImageElement|HTMLCanvasElement} [properties.image] - Use an image to draw the sprite.
   * @param {{[name: String] : Animation}} [properties.animations] - An object of [Animations](api/animation) from a [Spritesheet](api/spriteSheet) to animate the sprite.
   */
  class Sprite extends GameObject {
    /**
     * @docs docs/api_docs/sprite.js
     */

    init({
      /**
       * The color of the game object if it was passed as an argument.
       * @memberof Sprite
       * @property {String} color
       */

      // @ifdef SPRITE_IMAGE
      /**
       * The image the sprite will use when drawn if passed as an argument.
       * @memberof Sprite
       * @property {HTMLImageElement|HTMLCanvasElement} image
       */
      image,

      /**
       * The width of the sprite. If the sprite is a [rectangle sprite](api/sprite#rectangle-sprite), it uses the passed in value. For an [image sprite](api/sprite#image-sprite) it is the width of the image. And for an [animation sprite](api/sprite#animation-sprite) it is the width of a single frame of the animation.
       * @memberof Sprite
       * @property {Number} width
       */
      width = image ? image.width : undefined,

      /**
       * The height of the sprite. If the sprite is a [rectangle sprite](api/sprite#rectangle-sprite), it uses the passed in value. For an [image sprite](api/sprite#image-sprite) it is the height of the image. And for an [animation sprite](api/sprite#animation-sprite) it is the height of a single frame of the animation.
       * @memberof Sprite
       * @property {Number} height
       */
      height = image ? image.height : undefined,
      // @endif

      ...props
    } = {}) {
      super.init({
        // @ifdef SPRITE_IMAGE
        image,
        width,
        height,
        // @endif
        ...props
      });
    }

    // @ifdef SPRITE_ANIMATION
    /**
     * An object of [Animations](api/animation) from a [SpriteSheet](api/spriteSheet) to animate the sprite. Each animation is named so that it can can be used by name for the sprites [playAnimation()](api/sprite#playAnimation) function.
     *
     * ```js
     * import { Sprite, SpriteSheet } from 'kontra';
     *
     * let spriteSheet = SpriteSheet({
     *   // ...
     *   animations: {
     *     idle: {
     *       frames: 1,
     *       loop: false,
     *     },
     *     walk: {
     *       frames: [1,2,3]
     *     }
     *   }
     * });
     *
     * let sprite = Sprite({
     *   x: 100,
     *   y: 200,
     *   animations: spriteSheet.animations
     * });
     *
     * sprite.playAnimation('idle');
     * ```
     * @memberof Sprite
     * @property {{[name: String] : Animation}} animations
     */
    get animations() {
      return this._a;
    }

    set animations(value) {
      let prop, firstAnimation;
      // a = animations
      this._a = {};

      // clone each animation so no sprite shares an animation
      for (prop in value) {
        this._a[prop] = value[prop].clone();

        // default the current animation to the first one in the list
        firstAnimation = firstAnimation || this._a[prop];
      }

      /**
       * The currently playing Animation object if `animations` was passed as an argument.
       * @memberof Sprite
       * @property {Animation} currentAnimation
       */
      this.currentAnimation = firstAnimation;
      this.width = this.width || firstAnimation.width;
      this.height = this.height || firstAnimation.height;
    }

    /**
     * Set the currently playing animation of an animation sprite.
     *
     * ```js
     * import { Sprite, SpriteSheet } from 'kontra';
     *
     * let spriteSheet = SpriteSheet({
     *   // ...
     *   animations: {
     *     idle: {
     *       frames: 1
     *     },
     *     walk: {
     *       frames: [1,2,3]
     *     }
     *   }
     * });
     *
     * let sprite = Sprite({
     *   x: 100,
     *   y: 200,
     *   animations: spriteSheet.animations
     * });
     *
     * sprite.playAnimation('idle');
     * ```
     * @memberof Sprite
     * @function playAnimation
     *
     * @param {String} name - Name of the animation to play.
     */
    playAnimation(name) {
      this.currentAnimation = this.animations[name];

      if (!this.currentAnimation.loop) {
        this.currentAnimation.reset();
      }
    }

    advance(dt) {
      super.advance(dt);

      if (this.currentAnimation) {
        this.currentAnimation.update(dt);
      }
    }
    // @endif

    draw() {
      // @ifdef SPRITE_IMAGE
      if (this.image) {
        this.context.drawImage(
          this.image,
          0,
          0,
          this.image.width,
          this.image.height
        );
      }
      // @endif

      // @ifdef SPRITE_ANIMATION
      if (this.currentAnimation) {
        this.currentAnimation.render({
          x: 0,
          y: 0,
          width: this.width,
          height: this.height,
          context: this.context
        });
      }
      // @endif

      if (this.color) {
        this.context.fillStyle = this.color;
        this.context.fillRect(0, 0, this.width, this.height);
      }
    }
  }

  function factory$8() {
    return new Sprite(...arguments);
  }

  let fontSizeRegex = /(\d+)(\w+)/;

  function parseFont(font) {
    let match = font.match(fontSizeRegex);

    // coerce string to number
    // @see https://github.com/jed/140bytes/wiki/Byte-saving-techniques#coercion-to-test-for-types
    let size = +match[1];
    let unit = match[2];
    let computed = size;

    return {
      size,
      unit,
      computed
    };
  }

  /**
   * An object for drawing text to the screen. Supports newline characters as well as automatic new lines when setting the `width` property.
   *
   * You can also display RTL languages by setting the attribute `dir="rtl"` on the main canvas element. Due to the limited browser support for individual text to have RTL settings, it must be set globally for the entire game.
   *
   * @example
   * // exclude-code:start
   * let { Text } = kontra;
   * // exclude-code:end
   * // exclude-script:start
   * import { Text } from 'kontra';
   * // exclude-script:end
   *
   * let text = Text({
   *   text: 'Hello World!\nI can even be multiline!',
   *   font: '32px Arial',
   *   color: 'white',
   *   x: 300,
   *   y: 100,
   *   anchor: {x: 0.5, y: 0.5},
   *   textAlign: 'center'
   * });
   * // exclude-code:start
   * text.context = context;
   * // exclude-code:end
   *
   * text.render();
   * @class Text
   * @extends GameObject
   *
   * @param {Object} properties - Properties of the text.
   * @param {String} properties.text - The text to display.
   * @param {String} [properties.font] - The [font](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/font) style. Defaults to the main context font.
   * @param {String} [properties.color] - Fill color for the text. Defaults to the main context fillStyle.
   * @param {Number} [properties.width] - Set a fixed width for the text. If set, the text will automatically be split into new lines that will fit the size when possible.
   * @param {String} [properties.textAlign='left'] - The [textAlign](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/textAlign) for the context. If the `dir` attribute is set to `rtl` on the main canvas, the text will automatically be aligned to the right, but you can override that by setting this property.
   * @param {Number} [properties.lineHeight=1] - The distance between two lines of text.
   */
  class Text extends GameObject {
    init({
      // --------------------------------------------------
      // defaults
      // --------------------------------------------------

      /**
       * The string of text. Use newline characters to create multi-line strings.
       * @memberof Text
       * @property {String} text
       */
      text = '',

      /**
       * The text alignment.
       * @memberof Text
       * @property {String} textAlign
       */
      textAlign = '',

      /**
       * The distance between two lines of text. The value is multiplied by the texts font size.
       * @memberof Text
       * @property {Number} lineHeight
       */
      lineHeight = 1,

      /**
       * The font style.
       * @memberof Text
       * @property {String} font
       */
      font = getContext().font,

      /**
       * The color of the text.
       * @memberof Text
       * @property {String} color
       */

      ...props
    } = {}) {
      // cast to string
      text = '' + text;

      super.init({
        text,
        textAlign,
        lineHeight,
        font,
        ...props
      });

      // p = prerender
      this._p();
    }

    // keep width and height getters/settings so we can set _w and _h
    // and not trigger infinite call loops
    get width() {
      // w = width
      return this._w;
    }

    set width(value) {
      // d = dirty
      this._d = true;
      this._w = value;

      // fw = fixed width
      this._fw = value;
    }

    get text() {
      return this._t;
    }

    set text(value) {
      this._d = true;
      this._t = '' + value;
    }

    get font() {
      return this._f;
    }

    set font(value) {
      this._d = true;
      this._f = value;
      this._fs = parseFont(value).computed;
    }

    get lineHeight() {
      // lh = line height
      return this._lh;
    }

    set lineHeight(value) {
      this._d = true;
      this._lh = value;
    }

    render() {
      if (this._d) {
        this._p();
      }
      super.render();
    }

    /**
     * Calculate the font width, height, and text strings before rendering.
     */
    _p() {
      // s = strings
      this._s = [];
      this._d = false;
      let context = this.context;

      context.font = this.font;

      // @ifdef TEXT_AUTONEWLINE
      if (!this._s.length && this._fw) {
        let parts = this.text.split(' ');
        let start = 0;
        let i = 2;

        // split the string into lines that all fit within the fixed
        // width
        for (; i <= parts.length; i++) {
          let str = parts.slice(start, i).join(' ');
          let width = context.measureText(str).width;

          if (width > this._fw) {
            this._s.push(parts.slice(start, i - 1).join(' '));
            start = i - 1;
          }
        }

        this._s.push(parts.slice(start, i).join(' '));
      }
      // @endif

      // @ifdef TEXT_NEWLINE
      if (!this._s.length && this.text.includes('\n')) {
        let width = 0;
        this.text.split('\n').map(str => {
          this._s.push(str);
          width = Math.max(width, context.measureText(str).width);
        });

        this._w = this._fw || width;
      }
      // @endif

      if (!this._s.length) {
        this._s.push(this.text);
        this._w = this._fw || context.measureText(this.text).width;
      }

      this.height =
        this._fs + (this._s.length - 1) * this._fs * this.lineHeight;
      this._uw();
    }

    draw() {
      let alignX = 0;
      let textAlign = this.textAlign;
      let context = this.context;

      // @ifdef TEXT_RTL
      textAlign =
        this.textAlign ||
        (context.canvas.dir == 'rtl' ? 'right' : 'left');
      // @endif

      // @ifdef TEXT_ALIGN||TEXT_RTL
      alignX =
        textAlign == 'right'
          ? this.width
          : textAlign == 'center'
          ? (this.width / 2) | 0
          : 0;
      // @endif

      this._s.map((str, index) => {
        context.textBaseline = 'top';
        context.textAlign = textAlign;
        context.fillStyle = this.color;
        context.font = this.font;
        context.fillText(
          str,
          alignX,
          this._fs * this.lineHeight * index
        );
      });
    }
  }

  function factory$7() {
    return new Text(...arguments);
  }

  /**
   * A simple pointer API. You can use it move the main sprite or respond to a pointer event. Works with both mouse and touch events.
   *
   * Pointer events can be added on a global level or on individual sprites or objects. Before an object can receive pointer events, you must tell the pointer which objects to track and the object must haven been rendered to the canvas using `object.render()`.
   *
   * After an object is tracked and rendered, you can assign it an `onDown()`, `onUp()`, `onOver()`, or `onOut()` functions which will be called whenever a pointer down, up, over, or out event happens on the object.
   *
   * ```js
   * import { initPointer, track, Sprite } from 'kontra';
   *
   * // this function must be called first before pointer
   * // functions will work
   * initPointer();
   *
   * let sprite = Sprite({
   *   onDown: function() {
   *     // handle on down events on the sprite
   *   },
   *   onUp: function() {
   *     // handle on up events on the sprite
   *   },
   *   onOver: function() {
   *     // handle on over events on the sprite
   *   },
   *   onOut: function() {
   *     // handle on out events on the sprite
   *   }
   * });
   *
   * track(sprite);
   * sprite.render();
   * ```
   *
   * By default, the pointer is treated as a circle and will check for collisions against objects assuming they are rectangular (have a width and height property).
   *
   * If you need to perform a different type of collision detection, assign the object a `collidesWithPointer()` function and it will be called instead. The function is passed the pointer object. Use this function to determine how the pointer circle should collide with the object.
   *
   * ```js
   * import { Sprite } from 'kontra';
   *
   * let sprite = Srite({
   *   x: 10,
   *   y: 10,
   *   radius: 10
   *   collidesWithPointer: function(pointer) {
   *     // perform a circle v circle collision test
   *     let dx = pointer.x - this.x;
   *     let dy = pointer.y - this.y;
   *     return Math.sqrt(dx * dx + dy * dy) < this.radius;
   *   }
   * });
   * ```
   * @sectionName Pointer
   */

  /**
   * Below is a list of buttons that you can use. If you need to extend or modify this list, you can use the [pointerMap](api/gamepad#pointerMap) property.
   *
   * - left, middle, right
   * @sectionName Available Buttons
   */

  // save each object as they are rendered to determine which object
  // is on top when multiple objects are the target of an event.
  // we'll always use the last frame's object order so we know
  // the finalized order of all objects, otherwise an object could ask
  // if it's being hovered when it's rendered first even if other
  // objects would block it later in the render order
  let pointers = new WeakMap();
  let callbacks$1 = {};
  let pressedButtons = {};

  /**
   * A map of pointer button indices to button names. Modify this object to expand the list of [available buttons](api/pointer#available-buttons).
   *
   * ```js
   * import { pointerMap, pointerPressed } from 'kontra';
   *
   * pointerMap[2] = 'buttonWest';
   *
   * if (pointerPressed('buttonWest')) {
   *   // handle west face button
   * }
   * ```
   * @property {{[key: Number]: String}} pointerMap
   */
  let pointerMap = {
    0: 'left',
    1: 'middle',
    2: 'right'
  };

  /**
   * Detection collision between a rectangle and a circle.
   * @see https://yal.cc/rectangle-circle-intersection-test/
   *
   * @param {Object} object - Object to check collision against.
   */
  function circleRectCollision(object, pointer) {
    let { x, y, width, height } = getWorldRect(object);

    // account for camera
    do {
      x -= object.sx || 0;
      y -= object.sy || 0;
    } while ((object = object.parent));

    let dx = pointer.x - Math.max(x, Math.min(pointer.x, x + width));
    let dy = pointer.y - Math.max(y, Math.min(pointer.y, y + height));
    return dx * dx + dy * dy < pointer.radius * pointer.radius;
  }

  /**
   * Get the first on top object that the pointer collides with.
   *
   * @param {Object} pointer - The pointer object
   *
   * @returns {Object} First object to collide with the pointer.
   */
  function getCurrentObject(pointer) {
    // if pointer events are required on the very first frame or
    // without a game loop, use the current frame
    let renderedObjects = pointer._lf.length
      ? pointer._lf
      : pointer._cf;

    for (let i = renderedObjects.length - 1; i >= 0; i--) {
      let object = renderedObjects[i];
      let collides = object.collidesWithPointer
        ? object.collidesWithPointer(pointer)
        : circleRectCollision(object, pointer);

      if (collides) {
        return object;
      }
    }
  }

  /**
   * Get the style property value.
   */
  function getPropValue(style, value) {
    return parseFloat(style.getPropertyValue(value)) || 0;
  }

  /**
   * Calculate the canvas size, scale, and offset.
   *
   * @param {Object} The pointer object
   *
   * @returns {Object} The scale and offset of the canvas
   */
  function getCanvasOffset(pointer) {
    // we need to account for CSS scale, transform, border, padding,
    // and margin in order to get the correct scale and offset of the
    // canvas
    let { canvas, _s } = pointer;
    let rect = canvas.getBoundingClientRect();

    // @see https://stackoverflow.com/a/53405390/2124254
    let transform =
      _s.transform != 'none'
        ? _s.transform.replace('matrix(', '').split(',')
        : [1, 1, 1, 1];
    let transformScaleX = parseFloat(transform[0]);
    let transformScaleY = parseFloat(transform[3]);

    // scale transform applies to the border and padding of the element
    let borderWidth =
      (getPropValue(_s, 'border-left-width') +
        getPropValue(_s, 'border-right-width')) *
      transformScaleX;
    let borderHeight =
      (getPropValue(_s, 'border-top-width') +
        getPropValue(_s, 'border-bottom-width')) *
      transformScaleY;

    let paddingWidth =
      (getPropValue(_s, 'padding-left') +
        getPropValue(_s, 'padding-right')) *
      transformScaleX;
    let paddingHeight =
      (getPropValue(_s, 'padding-top') +
        getPropValue(_s, 'padding-bottom')) *
      transformScaleY;

    return {
      scaleX: (rect.width - borderWidth - paddingWidth) / canvas.width,
      scaleY:
        (rect.height - borderHeight - paddingHeight) / canvas.height,
      offsetX:
        rect.left +
        (getPropValue(_s, 'border-left-width') +
          getPropValue(_s, 'padding-left')) *
          transformScaleX,
      offsetY:
        rect.top +
        (getPropValue(_s, 'border-top-width') +
          getPropValue(_s, 'padding-top')) *
          transformScaleY
    };
  }

  /**
   * Execute the onDown callback for an object.
   *
   * @param {MouseEvent|TouchEvent} evt
   */
  function pointerDownHandler(evt) {
    // touchstart should be treated like a left mouse button
    let button = evt.button != null ? pointerMap[evt.button] : 'left';
    pressedButtons[button] = true;
    pointerHandler(evt, 'onDown');
  }

  /**
   * Execute the onUp callback for an object.
   *
   * @param {MouseEvent|TouchEvent} evt
   */
  function pointerUpHandler(evt) {
    let button = evt.button != null ? pointerMap[evt.button] : 'left';
    pressedButtons[button] = false;
    pointerHandler(evt, 'onUp');
  }

  /**
   * Track the position of the mousevt.
   *
   * @param {MouseEvent|TouchEvent} evt
   */
  function mouseMoveHandler(evt) {
    pointerHandler(evt, 'onOver');
  }

  /**
   * Reset pressed buttons.
   *
   * @param {MouseEvent|TouchEvent} evt
   */
  function blurEventHandler$2(evt) {
    let pointer = pointers.get(evt.target);
    pointer._oo = null;
    pressedButtons = {};
  }

  /**
   * Call a pointer callback function
   *
   * @param {Object} pointer
   * @param {String} eventName
   * @param {MouseEvent|TouchEvent} evt
   */
  function callCallback(pointer, eventName, evt) {
    // Trigger events
    let object = getCurrentObject(pointer);
    if (object && object[eventName]) {
      object[eventName](evt);
    }

    if (callbacks$1[eventName]) {
      callbacks$1[eventName](evt, object);
    }

    // handle onOut events
    if (eventName == 'onOver') {
      if (object != pointer._oo && pointer._oo && pointer._oo.onOut) {
        pointer._oo.onOut(evt);
      }

      pointer._oo = object;
    }
  }

  /**
   * Find the first object for the event and execute it's callback function
   *
   * @param {MouseEvent|TouchEvent} evt
   * @param {string} eventName - Which event was called.
   */
  function pointerHandler(evt, eventName) {
    evt.preventDefault();

    let canvas = evt.target;
    let pointer = pointers.get(canvas);
    let { scaleX, scaleY, offsetX, offsetY } = getCanvasOffset(pointer);
    let isTouchEvent = evt.type.includes('touch');

    if (isTouchEvent) {
      // track new touches
      Array.from(evt.touches).map(
        ({ clientX, clientY, identifier }) => {
          let touch = pointer.touches[identifier];
          if (!touch) {
            touch = pointer.touches[identifier] = {
              start: {
                x: (clientX - offsetX) / scaleX,
                y: (clientY - offsetY) / scaleY
              }
            };
            pointer.touches.length++;
          }

          touch.changed = false;
        }
      );

      // handle only changed touches
      Array.from(evt.changedTouches).map(
        ({ clientX, clientY, identifier }) => {
          let touch = pointer.touches[identifier];
          touch.changed = true;
          touch.x = pointer.x = (clientX - offsetX) / scaleX;
          touch.y = pointer.y = (clientY - offsetY) / scaleY;

          callCallback(pointer, eventName, evt);
          emit('touchChanged', evt, pointer.touches);

          // remove touches
          if (eventName == 'onUp') {
            delete pointer.touches[identifier];
            pointer.touches.length--;

            if (!pointer.touches.length) {
              emit('touchEnd');
            }
          }
        }
      );
    } else {
      // translate the scaled size back as if the canvas was at a
      // 1:1 scale
      pointer.x = (evt.clientX - offsetX) / scaleX;
      pointer.y = (evt.clientY - offsetY) / scaleY;

      callCallback(pointer, eventName, evt);
    }
  }

  /**
   * Initialize pointer event listeners. This function must be called before using other pointer functions.
   *
   * If you need to use multiple canvas, you'll have to initialize the pointer for each one individually as each canvas maintains its own pointer object.
   * @function initPointer
   *
   * @param {Object} [options] - Pointer options.
   * @param {Number} [options.radius=5] - Radius of the pointer.
   * @param {HTMLCanvasElement} [options.canvas] - The canvas that event listeners will be attached to. Defaults to [core.getCanvas()](api/core#getCanvas).
   *
   * @returns {{x: Number, y: Number, radius: Number, canvas: HTMLCanvasElement, touches: Object}} The pointer object for the canvas.
   */
  function initPointer({
    radius = 5,
    canvas = getCanvas()
  } = {}) {
    let pointer = pointers.get(canvas);
    if (!pointer) {
      let style = window.getComputedStyle(canvas);

      pointer = {
        x: 0,
        y: 0,
        radius,
        touches: { length: 0 },
        canvas,

        // cf = current frame, lf = last frame, o = objects,
        // oo = over object, _s = style
        _cf: [],
        _lf: [],
        _o: [],
        _oo: null,
        _s: style
      };
      pointers.set(canvas, pointer);
    }

    // if this function is called multiple times, the same event
    // won't be added multiple times
    // @see https://stackoverflow.com/questions/28056716/check-if-an-element-has-event-listener-on-it-no-jquery/41137585#41137585
    canvas.addEventListener('mousedown', pointerDownHandler);
    canvas.addEventListener('touchstart', pointerDownHandler);
    canvas.addEventListener('mouseup', pointerUpHandler);
    canvas.addEventListener('touchend', pointerUpHandler);
    canvas.addEventListener('touchcancel', pointerUpHandler);
    canvas.addEventListener('blur', blurEventHandler$2);
    canvas.addEventListener('mousemove', mouseMoveHandler);
    canvas.addEventListener('touchmove', mouseMoveHandler);

    // however, the tick event should only be registered once
    // otherwise it completely destroys pointer events
    if (!pointer._t) {
      pointer._t = true;

      // reset object render order on every new frame
      on('tick', () => {
        pointer._lf.length = 0;

        pointer._cf.map(object => {
          pointer._lf.push(object);
        });

        pointer._cf.length = 0;
      });
    }

    return pointer;
  }

  /**
   * Begin tracking pointer events for an object.
   *
   * ```js
   * import { initPointer, track } from 'kontra';
   *
   * initPointer();
   *
   * track(obj);
   * track(obj1, obj2);
   * ```
   * @function track
   *
   * @param {...(Object|Object[])[]} objects - Object to track. Can be a single object, an array of objects, or a comma-separated list of objects.
   */
  function track(...objects) {
    objects.flat().map(object => {
      let canvas = object.context ? object.context.canvas : getCanvas();
      let pointer = pointers.get(canvas);

      // @ifdef DEBUG
      if (!pointer) {
        throw new ReferenceError(
          'Pointer events not initialized for the objects canvas'
        );
      }
      // @endif

      // override the objects render function to keep track of render
      // order
      if (!object._r) {
        object._r = object.render;

        object.render = function () {
          pointer._cf.push(this);
          this._r();
        };

        pointer._o.push(object);
      }
    });
  }

  /**
   * An accessible button. Supports screen readers and keyboard navigation using the <kbd>Tab</kbd> key. The button is automatically [tracked](api/pointer#track) by the pointer and accepts all pointer functions, but you will still need to call [initPointer](api/pointer#initPointer) to have pointer events enabled.
   * @class Button
   * @extends Sprite
   *
   * @param {Object} [properties] - Properties of the button (in addition to all Sprite properties).
   * @param {Object} [properties.text] - Properties of [Text](api/text) which are used to create the [textNode](api/button#textNode).
   * @param {Boolean} [properties.disabled] - Whether the button is disabled when created.
   * @param {Number} [properties.padX=0] - The horizontal padding.
   * @param {Number} [properties.padY=0] - The vertical padding.
   * @param {Function} [properties.onEnable] - Function called when the button is enabled.
   * @param {Function} [properties.onDisable] - Function called when the button is disabled.
   * @param {Function} [properties.onFocus] - Function called when the button is focused by the keyboard.
   * @param {Function} [properties.onBlur] - Function called when the button losses focus either by the pointer or keyboard.
   */
  class Button extends Sprite {
    /**
     * @docs docs/api_docs/button.js
     */

    init({
      /**
       * The horizontal padding. This will be added to the width to give the final width of the button.
       * @memberof Button
       * @property {Number} padX
       */
      padX = 0,

      /**
       * The vertical padding. This will be added to the height to give the final height of the button.
       * @memberof Button
       * @property {Number} padY
       */
      padY = 0,

      text,
      disabled = false,
      onDown,
      onUp,
      ...props
    } = {}) {
      super.init({
        padX,
        padY,
        ...props
      });

      /**
       * Each Button creates a Text object and adds it as a child. The `text` of the Text object is used as the accessible name of the HTMLButtonElement.
       * @memberof Button
       * @property {Text} textNode
       */
      this.textNode = factory$7({
        ...text,

        // ensure the text uses the same context as the button
        context: this.context
      });

      // if the user didn't set a width/height or use an image
      // default to the textNode dimensions
      if (!this.width) {
        this.width = this.textNode.width;
        this.height = this.textNode.height;
      }

      track(this);
      this.addChild(this.textNode);

      // od = on down
      this._od = onDown || noop;

      // ou = on up
      this._ou = onUp || noop;

      // create an accessible DOM node for screen readers
      // dn = dom node
      let button = (this._dn = document.createElement('button'));
      button.style = srOnlyStyle;
      button.textContent = this.text;

      if (disabled) {
        this.disable();
      }

      // sync events between the button element and the class
      button.addEventListener('focus', () => this.focus());
      button.addEventListener('blur', () => this.blur());
      button.addEventListener('keydown', evt => this._kd(evt));
      button.addEventListener('keyup', evt => this._ku(evt));

      addToDom(button, this.context.canvas);

      this._uw();
      this._p();
    }

    /**
     * The text property of the Text object.
     * @memberof Button
     * @property {String} text
     */
    get text() {
      return this.textNode.text;
    }

    set text(value) {
      // d = dirty
      this._d = true;
      this.textNode.text = value;
    }

    /**
     * Clean up the button by removing the HTMLButtonElement from the DOM.
     * @memberof Button
     * @function destroy
     */
    destroy() {
      this._dn.remove();
    }

    _p() {
      // update DOM node text if it has changed
      if (this.text != this._dn.textContent) {
        this._dn.textContent = this.text;
      }

      // update width and height (need to prerender the button
      // first)
      this.textNode._p();

      let width = this.textNode.width + this.padX * 2;
      let height = this.textNode.height + this.padY * 2;

      this.width = Math.max(width, this.width);
      this.height = Math.max(height, this.height);
      this._uw();
    }

    render() {
      if (this._d) {
        this._p();
      }

      super.render();
    }

    /**
     * Enable the button. Calls [onEnable](api/button#onEnable) if passed.
     * @memberof Button
     * @function enable
     */
    enable() {
      /**
       * If the button is disabled.
       * @memberof Button
       * @property {Boolean} disabled
       */
      this.disabled = this._dn.disabled = false;
      this.onEnable();
    }

    /**
     * Disable the button. A disabled button will not longer render nor respond to pointer and keyboard events. Calls [onDisable](api/button#onDisable) if passed.
     * @memberof Button
     * @function disable
     */
    disable() {
      this.disabled = this._dn.disabled = true;
      this.onDisable();
    }

    /**
     * Focus the button. Calls [onFocus](api/button#onFocus) if passed.
     * @memberof Button
     * @function focus
     */
    focus() {
      if (!this.disabled) {
        /**
         * If the button is focused.
         * @memberof Button
         * @property {Boolean} focused
         */
        this.focused = true;
        // prevent infinite loop
        if (document.activeElement != this._dn) this._dn.focus();

        this.onFocus();
      }
    }

    /**
     * Blur the button. Calls [onBlur](api/button#onBlur) if passed.
     * @memberof Button
     * @function blur
     */
    blur() {
      this.focused = false;
      // prevent infinite loop
      if (document.activeElement == this._dn) this._dn.blur();

      this.onBlur();
    }

    onOver() {
      if (!this.disabled) {
        /**
         * If the button is hovered.
         * @memberof Button
         * @property {Boolean} hovered
         */
        this.hovered = true;
      }
    }

    onOut() {
      this.hovered = false;
    }

    /**
     * Function called when then button is enabled. Override this function to have the button do something when enabled.
     * @memberof Button
     * @function onEnable
     */
    onEnable() {}

    /**
     * Function called when then button is disabled. Override this function to have the button do something when disabled.
     * @memberof Button
     * @function onDisable
     */
    onDisable() {}

    /**
     * Function called when then button is focused. Override this function to have the button do something when focused.
     * @memberof Button
     * @function onFocus
     */
    onFocus() {}

    /**
     * Function called when then button is blurred. Override this function to have the button do something when blurred.
     * @memberof Button
     * @function onBlur
     */
    onBlur() {}

    onDown() {
      if (!this.disabled) {
        /**
         * If the button is pressed.
         * @memberof Button
         * @property {Boolean} pressed
         */
        this.pressed = true;
        this._od();
      }
    }

    onUp() {
      if (!this.disabled) {
        this.pressed = false;
        this._ou();
      }
    }

    // kd = keydown
    _kd(evt) {
      // activate button on enter or space
      if (evt.code == 'Enter' || evt.code == 'Space') {
        this.onDown();
      }
    }

    // kd = keydown
    _ku(evt) {
      // activate button on enter or space
      if (evt.code == 'Enter' || evt.code == 'Space') {
        this.onUp();
      }
    }
  }

  function factory$6() {
    return new Button(...arguments);
  }

  /**
   * Clear the canvas.
   */
  function clear(context) {
    let canvas = context.canvas;
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  /**
   * The game loop updates and renders the game every frame. The game loop is stopped by default and will not start until the loops `start()` function is called.
   *
   * The game loop uses a time-based animation with a fixed `dt` to [avoid frame rate issues](http://blog.sklambert.com/using-time-based-animation-implement/). Each update call is guaranteed to equal 1/60 of a second.
   *
   * This means that you can avoid having to do time based calculations in your update functions and instead do fixed updates.
   *
   * ```js
   * import { Sprite, GameLoop } from 'kontra';
   *
   * let sprite = Sprite({
   *   x: 100,
   *   y: 200,
   *   width: 20,
   *   height: 40,
   *   color: 'red'
   * });
   *
   * let loop = GameLoop({
   *   update: function(dt) {
   *     // no need to determine how many pixels you want to
   *     // move every second and multiple by dt
   *     // sprite.x += 180 * dt;
   *
   *     // instead just update by how many pixels you want
   *     // to move every frame and the loop will ensure 60FPS
   *     sprite.x += 3;
   *   },
   *   render: function() {
   *     sprite.render();
   *   }
   * });
   *
   * loop.start();
   * ```
   * @class GameLoop
   *
   * @param {Object} properties - Properties of the game loop.
   * @param {(dt: Number) => void} [properties.update] - Function called every frame to update the game. Is passed the fixed `dt` as a parameter.
   * @param {Function} properties.render - Function called every frame to render the game.
   * @param {Number}   [properties.fps=60] - Desired frame rate.
   * @param {Boolean}  [properties.clearCanvas=true] - Clear the canvas every frame before the `render()` function is called.
   * @param {CanvasRenderingContext2D} [properties.context] - The context that should be cleared each frame if `clearContext` is not set to `false`. Defaults to [core.getContext()](api/core#getContext).
   * @param {Boolean} [properties.blur=false] - If the loop should still update and render if the page does not have focus.
   */
  function GameLoop({
    fps = 60,
    clearCanvas = true,
    update = noop,
    render,
    context = getContext(),
    blur = false
  } = {}) {
    // check for required functions
    // @ifdef DEBUG
    if (!render) {
      throw Error('You must provide a render() function');
    }
    // @endif

    // animation variables
    let accumulator = 0;
    let delta = 1e3 / fps; // delta between performance.now timings (in ms)
    let step = 1 / fps;
    let clearFn = clearCanvas ? clear : noop;
    let last, rAF, now, dt, loop;
    let focused = true;

    if (!blur) {
      window.addEventListener('focus', () => {
        focused = true;
      });
      window.addEventListener('blur', () => {
        focused = false;
      });
    }

    /**
     * Called every frame of the game loop.
     */
    function frame() {
      rAF = requestAnimationFrame(frame);

      // don't update the frame if tab isn't focused
      if (!focused) return;

      now = performance.now();
      dt = now - last;
      last = now;

      // prevent updating the game with a very large dt if the game
      // were to lose focus and then regain focus later
      if (dt > 1e3) {
        return;
      }

      emit('tick');
      accumulator += dt;

      while (accumulator >= delta) {
        loop.update(step);

        accumulator -= delta;
      }

      clearFn(context);
      loop.render();
    }

    // game loop object
    loop = {
      /**
       * Called every frame to update the game. Put all of your games update logic here.
       * @memberof GameLoop
       * @function update
       *
       * @param {Number} [dt] - The fixed dt time of 1/60 of a frame.
       */
      update,

      /**
       * Called every frame to render the game. Put all of your games render logic here.
       * @memberof GameLoop
       * @function render
       */
      render,

      /**
       * If the game loop is currently stopped.
       *
       * ```js
       * import { GameLoop } from 'kontra';
       *
       * let loop = GameLoop({
       *   // ...
       * });
       * console.log(loop.isStopped);  //=> true
       *
       * loop.start();
       * console.log(loop.isStopped);  //=> false
       *
       * loop.stop();
       * console.log(loop.isStopped);  //=> true
       * ```
       * @memberof GameLoop
       * @property {Boolean} isStopped
       */
      isStopped: true,

      /**
       * Start the game loop.
       * @memberof GameLoop
       * @function start
       */
      start() {
        last = performance.now();
        this.isStopped = false;
        requestAnimationFrame(frame);
      },

      /**
       * Stop the game loop.
       * @memberof GameLoop
       * @function stop
       */
      stop() {
        this.isStopped = true;
        cancelAnimationFrame(rAF);
      },

      // expose properties for testing
      // @ifdef DEBUG
      _frame: frame,
      set _last(value) {
        last = value;
      }
      // @endif
    };

    return loop;
  }

  /**
   * A simple keyboard API. You can use it move the main sprite or respond to a key press.
   *
   * ```js
   * import { initKeys, keyPressed } from 'kontra';
   *
   * // this function must be called first before keyboard
   * // functions will work
   * initKeys();
   *
   * function update() {
   *   if (keyPressed('arrowleft')) {
   *     // move left
   *   }
   * }
   * ```
   * @sectionName Keyboard
   */

  /**
   * Below is a list of keys that are provided by default. If you need to extend this list, you can use the [keyMap](api/keyboard#keyMap) property.
   *
   * - a-z
   * - 0-9
   * - enter, esc, space, arrowleft, arrowup, arrowright, arrowdown
   * @sectionName Available Keys
   */

  let keydownCallbacks = {};
  let keyupCallbacks = {};
  let pressedKeys = {};

  /**
   * A map of [KeyboardEvent code values](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code/code_values) to key names. Add to this object to expand the list of [available keys](api/keyboard#available-keys).
   *
   * ```js
   * import { keyMap, onKey } from 'kontra';
   *
   * keyMap['ControlRight'] = 'ctrl';
   *
   * onKey('ctrl', function(e) {
   *   // handle ctrl key
   * });
   * ```
   * @property {{[key in (String|Number)]: String}} keyMap
   */
  let keyMap = {
    // named keys
    Enter: 'enter',
    Escape: 'esc',
    Space: 'space',
    ArrowLeft: 'arrowleft',
    ArrowUp: 'arrowup',
    ArrowRight: 'arrowright',
    ArrowDown: 'arrowdown'
  };

  /**
   * Call the callback handler of an event.
   * @param {Function} callback
   * @param {KeyboardEvent} evt
   */
  function call(callback = noop, evt) {
    if (callback._pd) {
      evt.preventDefault();
    }
    callback(evt);
  }

  /**
   * Execute a function that corresponds to a keyboard key.
   *
   * @param {KeyboardEvent} evt
   */
  function keydownEventHandler(evt) {
    let key = keyMap[evt.code];
    let callback = keydownCallbacks[key];
    pressedKeys[key] = true;
    call(callback, evt);
  }

  /**
   * Set the released key to not being pressed.
   *
   * @param {KeyboardEvent} evt
   */
  function keyupEventHandler(evt) {
    let key = keyMap[evt.code];
    let callback = keyupCallbacks[key];
    pressedKeys[key] = false;
    call(callback, evt);
  }

  /**
   * Reset pressed keys.
   */
  function blurEventHandler() {
    pressedKeys = {};
  }

  /**
   * Initialize keyboard event listeners. This function must be called before using other keyboard functions.
   * @function initKeys
   */
  function initKeys() {
    let i;

    // alpha keys
    // @see https://stackoverflow.com/a/43095772/2124254
    for (i = 0; i < 26; i++) {
      // rollupjs considers this a side-effect (for now), so we'll do it
      // in the initKeys function
      keyMap['Key' + String.fromCharCode(i + 65)] = String.fromCharCode(
        i + 97
      );
    }

    // numeric keys
    for (i = 0; i < 10; i++) {
      keyMap['Digit' + i] = keyMap['Numpad' + i] = '' + i;
    }

    window.addEventListener('keydown', keydownEventHandler);
    window.addEventListener('keyup', keyupEventHandler);
    window.addEventListener('blur', blurEventHandler);
  }

  /**
   * Register a function to be called when a key is pressed. Takes a single key or an array of keys. Is passed the original [KeyboardEvent](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent) as a parameter.
   *
   * By default, the default action will be prevented for any bound key. To not do this, pass the `preventDefault` option.
   *
   * ```js
   * import { initKeys, onKey } from 'kontra';
   *
   * initKeys();
   *
   * onKey('p', function(e) {
   *   // pause the game
   * });
   * onKey(['enter', 'space'], function(e) {
   *   // fire gun
   * });
   * ```
   * @function onKey
   *
   * @param {String|String[]} keys - Key or keys to register.
   * @param {(evt: KeyboardEvent) => void} callback - The function to be called when the key is pressed.
   * @param {Object} [options] - Register options.
   * @param {'keydown'|'keyup'} [options.handler=keydown] - Whether to register to keydown or keyup events.
   * @param {Boolean} [options.preventDefault=true] - Call `event. preventDefault()` when the key is activated.
   */
  function onKey(
    keys,
    callback,
    { handler = 'keydown', preventDefault = true } = {}
  ) {
    let callbacks =
      handler == 'keydown' ? keydownCallbacks : keyupCallbacks;
    // pd = preventDefault
    callback._pd = preventDefault;
    // smaller than doing `Array.isArray(keys) ? keys : [keys]`
    [].concat(keys).map(key => (callbacks[key] = callback));
  }

  let kontra = {
  //   Animation: factory$b,
  //   AnimationClass: Animation,

  //   imageAssets,
  //   audioAssets,
  //   dataAssets,
  //   setImagePath,
  //   setAudioPath,
  //   setDataPath,
  //   loadImage,
  //   loadAudio,
  //   loadData,
  //   load,

    Button: factory$6,
    ButtonClass: Button,

    init: init$1,
    getCanvas,
    getContext,

  //   on,
  //   off,
  //   emit,

    GameLoop,
    GameObject: factory$9,
    GameObjectClass: GameObject,

  //   gamepadMap,
  //   updateGamepad,
  //   initGamepad,
  //   onGamepad,
  //   offGamepad,
  //   gamepadPressed,
  //   gamepadAxis,

  //   gestureMap,
  //   initGesture,
  //   onGesture,
  //   offGesture,

  //   Grid: factory$5,
  //   GridClass: Grid,

  //   degToRad,
  //   radToDeg,
  //   angleToTarget,
  //   rotatePoint,
  //   movePoint,
  //   randInt,
  //   seedRand,
  //   lerp,
  //   inverseLerp,
  //   clamp,
  //   setStoreItem,
  //   getStoreItem,
  //   collides,
  //   getWorldRect,
  //   depthSort,

  //   initInput,
  //   onInput,
  //   offInput,

  //   keyMap,
    initKeys,
    onKey,
  //   offKey,
  //   keyPressed,

  //   registerPlugin,
  //   unregisterPlugin,
  //   extendObject,

    initPointer,
  //   getPointer,
  //   track,
  //   untrack,
  //   pointerOver,
  //   onPointer,
  //   offPointer,
  //   pointerPressed,

  //   Pool: factory$4,
  //   PoolClass: Pool,

  //   Quadtree: factory$3,
  //   QuadtreeClass: Quadtree,

  //   Scene: factory$2,
  //   SceneClass: Scene,

    Sprite: factory$8,
    SpriteClass: Sprite,

  //   SpriteSheet: factory$1,
  //   SpriteSheetClass: SpriteSheet,

    Text: factory$7,
    TextClass: Text,

  //   TileEngine: factory,

  //   Vector: factory$a,
  //   VectorClass: Vector
  };

  return kontra;

})();