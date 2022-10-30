(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],2:[function(require,module,exports){
(function (Buffer){(function (){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function () { return 42 } }
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

}).call(this)}).call(this,require("buffer").Buffer)
},{"base64-js":1,"buffer":2,"ieee754":3}],3:[function(require,module,exports){
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],4:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],5:[function(require,module,exports){
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  BaseBrilliance: () => BaseBrilliance,
  createError: () => createError,
  isBrilliantError: () => isBrilliantError,
  prettyStack: () => prettyStack
});
module.exports = __toCommonJS(src_exports);

// src/@guards/index.ts
function isBrilliantError(error) {
  return error instanceof Error && error.kind === "BrilliantError";
}

// src/@types/BaseBrilliance.ts
var BaseBrilliance = class extends Error {
  constructor() {
    super(...arguments);
    this.kind = "BrilliantError";
  }
};

// src/configurators/createError.ts
var import_callsites = __toESM(require("callsites"));

// src/shared/prettyStack.ts
function prettyStack(s) {
  return s.map((i) => {
    const file = (i.getFileName() || "[file unknown]").split("/").slice(-2).join("/");
    const func = i.getFunctionName() || i.getMethodName() || "unknown";
    const line = i.getLineNumber();
    return `	- ${file}, ${func}()${line ? `, at line ${line}` : ""}`;
  }).join("\n");
}

// src/configurators/constructors/standard.ts
var standard_default = (ctx, props) => (message, classification, options) => {
  ctx.message = `[ ${classification} ]: ${message} 

${prettyStack(ctx.structuredStack)}`;
  ctx.classification = classification;
  const parts = classification.split("/");
  ctx.code = parts[0];
  ctx.subType = parts[1];
  if ((options == null ? void 0 : options.httpStatusCode) || props.configOptions.defaultHttpStatus) {
    ctx.httpStatus = (options == null ? void 0 : options.httpStatusCode) || props.configOptions.defaultHttpStatus;
  }
};

// src/configurators/constructors/wrapper.ts
var wrapper_default = (ctx, _props) => (underlying, classification, options) => {
  ctx.classification = classification;
  if (options == null ? void 0 : options.httpErrorCode) {
    ctx.httpStatus = options.httpErrorCode;
  }
  ctx.message = (options == null ? void 0 : options.message) ? `${options == null ? void 0 : options.message} [ ${classification} ]: ${underlying.message}

${prettyStack(
    ctx.structuredStack
  )}` : `${underlying.message} [ ${classification} ]: wrapped error ${underlying.name}

${prettyStack(ctx.structuredStack)}`;
};

// src/configurators/constructors/network.ts
var network_default = (ctx, props) => (code, message, options) => {
  ctx.httpStatus = code;
  const classification = (options == null ? void 0 : options.classification) || `${props.configOptions.defaultType || props.app}/${props.configOptions.defaultSubType} || "unspecified"`;
  ctx.classification = classification;
  ctx.message = `${message} [ ${code}, ${classification} ]

${prettyStack(
    ctx.structuredStack
  )}`;
};

// src/configurators/constructors/index.ts
var constructors_default = (ctx, props) => ({
  standard: standard_default(ctx, props),
  wrapper: wrapper_default(ctx, props),
  network: network_default(ctx, props)
});

// src/configurators/createError.ts
var createError = (name, app) => (...types) => (...subTypes) => (...httpCodes) => (configOptions) => {
  const ErrorClass = class BrilliantError extends Error {
    constructor(...params) {
      super("");
      this.kind = "BrilliantError";
      this.constructorType = (configOptions == null ? void 0 : configOptions.constructorType) || "standard";
      this.name = name;
      this.app = app;
      this.structuredStack = (0, import_callsites.default)().slice(1) || [];
      this.filename = (this.structuredStack[0].getFileName() || "").split("/").slice(-2).join("/");
      this.line = this.structuredStack[0].getLineNumber();
      this.fn = this.structuredStack[0].getMethodName() || this.structuredStack[0].getFunctionName();
      const c = constructors_default(this, {
        name,
        app,
        types,
        subTypes,
        httpCodes,
        configOptions: configOptions || {}
      });
      const ctor = c[this.constructorType];
      ctor(...params);
    }
    toJSON() {
      return {
        app: this.app,
        name: this.name,
        message: this.message,
        classification: this.classification,
        httpStatus: this.httpStatus,
        code: this.code,
        subType: this.subType,
        fn: this.fn,
        line: this.line
      };
    }
  };
  const SpecificGuard = (unknown) => {
    return isBrilliantError(unknown) && unknown.name === name && unknown.app === app;
  };
  return [ErrorClass, SpecificGuard, isBrilliantError];
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BaseBrilliance,
  createError,
  isBrilliantError,
  prettyStack
});

},{"callsites":6}],6:[function(require,module,exports){
'use strict';

const callsites = () => {
	const _prepareStackTrace = Error.prepareStackTrace;
	Error.prepareStackTrace = (_, stack) => stack;
	const stack = new Error().stack.slice(1);
	Error.prepareStackTrace = _prepareStackTrace;
	return stack;
};

module.exports = callsites;
// TODO: Remove this for the next major release
module.exports.default = callsites;

},{}],7:[function(require,module,exports){
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  Configurator: () => Configurator,
  ExplicitFunction: () => ExplicitFunction,
  FluentConfigurator: () => FluentConfigurator,
  Model: () => Model,
  MutationIdentity: () => MutationIdentity,
  and: () => and,
  api: () => api,
  arrayToKeyLookup: () => arrayToKeyLookup,
  arrayToObject: () => arrayToObject,
  condition: () => condition,
  createFnWithProps: () => createFnWithProps,
  createMutationFunction: () => createMutationFunction,
  defineProperties: () => defineProperties,
  defineType: () => defineType,
  dictToKv: () => dictToKv,
  dictionaryTransform: () => dictionaryTransform,
  entries: () => entries,
  equals: () => equals,
  filterDictArray: () => filterDictArray,
  fnWithProps: () => fnWithProps,
  greater: () => greater,
  groupBy: () => groupBy,
  idLiteral: () => idLiteral,
  idTypeGuard: () => idTypeGuard,
  identity: () => identity,
  ifTypeOf: () => ifTypeOf,
  isArray: () => isArray,
  isBoolean: () => isBoolean,
  isFalse: () => isFalse,
  isFunction: () => isFunction,
  isNull: () => isNull,
  isNumber: () => isNumber,
  isObject: () => isObject,
  isString: () => isString,
  isSymbol: () => isSymbol,
  isTrue: () => isTrue,
  isType: () => isType,
  isUndefined: () => isUndefined,
  keys: () => keys,
  kindLiteral: () => kindLiteral,
  kv: () => kv,
  kvToDict: () => kvToDict,
  less: () => less,
  literal: () => literal,
  mapValues: () => mapValues,
  nameLiteral: () => nameLiteral,
  or: () => or,
  randomString: () => randomString,
  readonlyFnWithProps: () => readonlyFnWithProps,
  ruleSet: () => ruleSet,
  strArrayToDict: () => strArrayToDict,
  type: () => type,
  typeApi: () => typeApi,
  uuid: () => uuid,
  valueTypes: () => valueTypes,
  withValue: () => withValue
});
module.exports = __toCommonJS(src_exports);

// src/Mutation/MutationFunction.ts
function createMutationFunction(state) {
  return (mutationIdentity) => {
    return mutationIdentity(state);
  };
}

// src/Mutation/MutationIdentity.ts
function MutationIdentity() {
  return function(m) {
    return m;
  };
}

// src/shared/randomString.ts
function randomString() {
  return Math.trunc((1 + Math.random()) * 65536).toString(16).slice(1);
}

// src/shared/uuid.ts
function uuid() {
  return `${randomString()}${randomString()}-${randomString()}-${randomString()}-${randomString()}-${randomString()}-${randomString()}${randomString()}${randomString()}`;
}

// src/shared/valueTypes.ts
var valueTypes = {
  string: ["", false],
  boolean: [true, false],
  number: [0, false],
  function: [() => "", false],
  object: [{}, false],
  array: (arr = []) => [arr, false],
  null: [null, false],
  symbol: [Symbol("type"), false],
  undefined: [void 0, false],
  true: [true, true],
  false: [false, true],
  literal: (v) => {
    return [v, true];
  },
  literalArray: (arr) => [arr, true]
};

// src/utility/keys.ts
function keys(obj, ...without) {
  const v = without.length > 0 ? Object.keys(obj).filter((k) => !without.includes(k)) : Object.keys(obj);
  return v;
}

// src/utility/createFnWithProps.ts
function createFnWithProps(fn, props) {
  return (() => {
    let combined = fn;
    for (const prop of keys(props)) {
      combined[prop] = props[prop];
    }
    return combined;
  })();
}
function fnWithProps(fn, props) {
  let combined = fn;
  for (const prop of keys(props)) {
    combined[prop] = props[prop];
  }
  return combined;
}
function readonlyFnWithProps(fn, props) {
  let combined = fn;
  for (const prop of keys(props)) {
    combined[prop] = props[prop];
  }
  return combined;
}

// src/utility/ruleset.ts
function ruleSet(defn) {
  return defn;
}

// src/utility/api/api.ts
var api = (priv) => (pub) => {
  const surface = () => pub;
  surface.prototype.priv = () => priv;
  return surface;
};

// src/utility/dictionary/arrayToKeyLookup.ts
function arrayToKeyLookup(...keys2) {
  const obj = {};
  for (const key of keys2) {
    obj[key] = true;
  }
  return obj;
}

// src/utility/dictionary/defineProperties.ts
function defineProperties(obj) {
  return {
    ro(prop, errorMsg) {
      Object.defineProperty(obj, prop, {
        writable: false,
        set(v) {
          const message = errorMsg ? errorMsg(prop, v) : `The ${String(
            prop
          )} is readonly but an attempt was made to change it's value to "${JSON.stringify(
            v
          )}"!`;
          throw new Error(message);
        }
      });
      return obj;
    }
  };
}

// src/utility/dictionary/dictionaryTransform.ts
function dictionaryTransform(input, transform) {
  return keys(input).reduce((acc, i) => {
    const key = i;
    return { ...acc, [key]: transform(input, key) };
  }, {});
}

// src/utility/dictionary/entries.ts
function entries(obj) {
  const iterable = {
    *[Symbol.iterator]() {
      for (const k of keys(obj)) {
        yield [k, obj[k]];
      }
    }
  };
  return iterable;
}

// src/utility/dictionary/mapValues.ts
function mapValues(obj, valueMapper) {
  return Object.fromEntries(
    [...entries(obj)].map(([k, v]) => [k, valueMapper(v)])
  );
}

// src/utility/dictionary/strArrayToDict.ts
function strArrayToDict(...strings) {
  return strings.reduce((acc, str) => {
    acc = { ...acc, [str]: true };
    return acc;
  }, {});
}

// src/utility/dictionary/kv/dictToKv.ts
function dictToKv(obj, _makeTuple = false) {
  return keys(obj).map((k) => {
    return { key: k, value: obj[k] };
  });
}

// src/utility/state/Configurator.ts
function omit(obj, ...removals) {
  const untyped = removals;
  return Object.fromEntries(Object.entries(obj).filter(([key]) => !untyped.includes(key)));
}
function Configurator() {
  let configuration = () => ({});
  const api2 = () => {
    return {
      set(key, value) {
        const keyValue = { [key]: value };
        const config = configuration();
        const updated = { ...config, ...keyValue };
        configuration = () => updated;
        return updated;
      },
      remove(key) {
        const config = configuration();
        const updated = omit(config, key);
        configuration = () => updated;
        return updated;
      },
      done() {
        return configuration();
      }
    };
  };
  return api2();
}

// src/utility/state/FluentConfigurator.ts
function FluentConfigurator(initial = {}) {
  const api2 = (current) => {
    return {
      set(key, value) {
        const keyValue = { [key]: value };
        const updated = { ...keyValue, ...current };
        return api2(updated);
      },
      done() {
        return current;
      }
    };
  };
  if (initial && typeof initial !== "object") {
    throw new Error(
      "The FluentConfigurator was passed a non-object based value as the initial value. This is not allowed."
    );
  }
  return initial ? api2(initial) : api2({});
}

// src/utility/dictionary/kv/filterDictArray.ts
function filterDictArray(dictArr, cb) {
  const state = Configurator();
  const updated = dictArr.filter((i) => {
    const [k, v] = i;
    const keep = cb(k, v);
    if (!keep) {
      state.set(k, true);
    }
    return keep;
  });
  return updated;
}

// src/utility/dictionary/kv/kv.ts
function kv(key, value) {
  return { [key]: value };
}

// src/utility/dictionary/kv/kvToDict.ts
function kvToDict(kvArr) {
  const out = {};
  for (const kv2 of kvArr) {
    out[kv2.key] = kv2.value;
  }
  return out;
}

// src/utility/lists/groupBy.ts
function groupBy(_data) {
  throw new Error("not implemented");
}

// src/utility/literals/ExplicitFunction.ts
function ExplicitFunction(fn) {
  return fn;
}

// src/utility/literals/arrayToObject.ts
function arrayToObject(prop, unique) {
  const transform = (arr) => {
    const result = unique !== false ? arr.reduce((acc, v) => ({ ...acc, [v[prop]]: v }), {}) : arr.reduce((acc, v) => {
      const existing = acc[v[prop]] || [];
      return { ...acc, [v[prop]]: [...existing, v] };
    }, {});
    return result;
  };
  return transform;
}

// src/utility/literals/defineType.ts
function defineType(literal2 = {}) {
  return (wide = {}) => {
    return literal2 ? { ...wide, ...literal2 } : wide;
  };
}

// src/utility/literals/identity.ts
var identity = (v) => v;

// src/utility/literals/literal.ts
function idLiteral(o) {
  return { ...o, id: o.id };
}
function nameLiteral(o) {
  return o;
}
function kindLiteral(o) {
  return o;
}
function idTypeGuard(_o) {
  return true;
}
function literal(obj) {
  return obj;
}

// src/utility/map-reduce/filter.ts
var equals = (field, val) => ({
  kind: "Equals",
  field,
  val
});
var greater = (field, val) => ({
  kind: "Greater",
  field,
  val
});
var less = (field, val) => ({
  kind: "Less",
  field,
  val
});
var and = (a, b) => ({
  kind: "And",
  a,
  b
});
var or = (a, b) => ({
  kind: "Or",
  a,
  b
});

// src/utility/modelling/Model.ts
function Model(name) {
  return {
    required(_prop) {
      return Model(name);
    },
    optional(_prop) {
      return Model(name);
    },
    done() {
      return {
        __model__: name,
        __kind__: "model"
      };
    }
  };
}

// src/utility/runtime/condition.ts
var condition = (c, input) => {
  return c(input);
};

// src/utility/runtime/ifTypeOf.ts
function runtimeExtendsCheck(val, base, narrow = false) {
  if (typeof val !== typeof base) {
    return false;
  }
  switch (typeof val) {
    case "boolean":
    case "string":
    case "number":
    case "symbol":
    case "bigint":
      return narrow ? val === base : true;
    case "undefined":
      return true;
    case "function":
      if (narrow) {
        throw new Error(`Use of narrowlyExtends with a function is not possible!`);
      }
      return true;
    case "object":
      if (val === null && base === null) {
        return true;
      } else {
        return keys(base).every(
          (i) => runtimeExtendsCheck(val[i], base[i], narrow)
        );
      }
  }
}
var ifTypeOf = (val) => ({
  extends: (base) => {
    const valid = runtimeExtendsCheck(val, base, false);
    const trueFalse = valid ? true : false;
    return {
      then: (then) => ({
        else: (elseVal) => {
          return valid ? typeof then === "undefined" ? val : then : elseVal;
        }
      }),
      else: (elseVal) => valid ? val : elseVal
    } && trueFalse;
  },
  narrowlyExtends: (base) => {
    const valid = runtimeExtendsCheck(val, base, true);
    const trueFalse = valid ? true : false;
    return {
      then: (then) => ({
        else: (elseVal) => {
          return valid ? typeof then === "undefined" ? val : then : elseVal;
        }
      }),
      else: (elseVal) => valid ? val : elseVal
    } && trueFalse;
  }
});

// src/utility/runtime/conditions/isArray.ts
function isArray(i) {
  return Array.isArray(i) === true;
}

// src/utility/runtime/conditions/isBoolean.ts
function isBoolean(i) {
  return typeof i === "boolean";
}

// src/utility/runtime/conditions/isFalse.ts
function isFalse(i) {
  return typeof i === "boolean" && !i;
}

// src/utility/runtime/conditions/isFunction.ts
function isFunction(input) {
  return typeof input === "function";
}

// src/utility/runtime/conditions/isNull.ts
function isNull(i) {
  return i === null;
}

// src/utility/runtime/conditions/isNumber.ts
function isNumber(i) {
  return typeof i === "number";
}

// src/utility/runtime/conditions/isObject.ts
function isObject(i) {
  return typeof i === "object" && i !== null && Array.isArray(i) === false;
}

// src/utility/runtime/conditions/isString.ts
function isString(i) {
  return typeof i === "string";
}

// src/utility/runtime/conditions/isSymbol.ts
function isSymbol(i) {
  return typeof i === "symbol";
}

// src/utility/runtime/conditions/isTrue.ts
function isTrue(i) {
  return typeof i === "boolean" && i;
}

// src/utility/runtime/conditions/isUndefined.ts
function isUndefined(i) {
  return typeof i === "undefined";
}

// src/utility/runtime/type.ts
var typeApi = () => ({
  string: {
    name: "string",
    type: "",
    typeGuard: (v) => isString(v),
    is: isString
  },
  boolean: {
    name: "boolean",
    type: true,
    typeGuard: (v) => isBoolean(v),
    is: isBoolean
  },
  number: {
    name: "number",
    type: 1,
    typeGuard: (v) => isNumber(v),
    is: isNumber
  },
  function: {
    name: "function",
    type: Function,
    typeGuard: (v) => isFunction(v),
    is: isFunction
  },
  null: {
    name: "null",
    type: null,
    typeGuard: (v) => isNull(v),
    is: isNull
  },
  symbol: {
    name: "symbol",
    type: Symbol(),
    typeGuard: (v) => isSymbol(v),
    is: isSymbol
  },
  undefined: {
    name: "undefined",
    type: void 0,
    typeGuard: (v) => isUndefined(v),
    is: isUndefined
  },
  true: {
    name: "true",
    type: true,
    typeGuard: (v) => isTrue(v),
    is: isTrue
  },
  false: {
    name: "false",
    type: false,
    typeGuard: (v) => isFalse(v),
    is: isFalse
  },
  object: {
    name: "object",
    type: {},
    typeGuard: (v) => isObject(v),
    is: isObject
  },
  array: {
    name: "array",
    type: {},
    typeGuard: (v) => isArray(v),
    is: isObject
  }
});
function isType(t) {
  return typeof t === "object" && ["name", "type", "is"].every((i) => Object.keys(t).includes(i));
}
function type(fn) {
  const result = fn(typeApi());
  if (!isType(result)) {
    throw new Error(
      `When using type(), the callback passed in returned an invalid type! Value returned was: ${result}`
    );
  }
  return result;
}

// src/utility/runtime/withValue.ts
function withValue(td) {
  return (obj) => {
    const t = type(td);
    return Object.fromEntries(
      [...entries(obj)].filter(([_key, value]) => {
        return t.typeGuard(value);
      })
    );
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Configurator,
  ExplicitFunction,
  FluentConfigurator,
  Model,
  MutationIdentity,
  and,
  api,
  arrayToKeyLookup,
  arrayToObject,
  condition,
  createFnWithProps,
  createMutationFunction,
  defineProperties,
  defineType,
  dictToKv,
  dictionaryTransform,
  entries,
  equals,
  filterDictArray,
  fnWithProps,
  greater,
  groupBy,
  idLiteral,
  idTypeGuard,
  identity,
  ifTypeOf,
  isArray,
  isBoolean,
  isFalse,
  isFunction,
  isNull,
  isNumber,
  isObject,
  isString,
  isSymbol,
  isTrue,
  isType,
  isUndefined,
  keys,
  kindLiteral,
  kv,
  kvToDict,
  less,
  literal,
  mapValues,
  nameLiteral,
  or,
  randomString,
  readonlyFnWithProps,
  ruleSet,
  strArrayToDict,
  type,
  typeApi,
  uuid,
  valueTypes,
  withValue
});

},{}],8:[function(require,module,exports){
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  default: () => src_default
});
module.exports = __toCommonJS(src_exports);
var import_native_dash = require("native-dash");
var import_mermaid = __toESM(require("mermaid"), 1);

// src/style.ts
var style = `<style>
  div.mermaid-error .error-info {
    display: flex;
    flex-direction: column;
    flex-grow: 0.5;
  }
  div.mermaid-error .error-text {
    display: flex; 
    flex-grow: 0; 
    font-size: 1.4rem; 
    font-weight: 800; 
    color: red;
  }
</style>
`;
var mermaid_icon = `
<svg version="1.1" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" style="width:64px; height: 64px" class="fill-gray-900 dark:fill-gray-100">
 <path d="m472.57 191.49c-11.266-27.137-36.863-18.945-36.863-18.945-4.6094-7.6797-19.457-23.551-19.457-23.551-16.383-16.383-35.328-8.7031-35.328-8.7031-22.016 2.0469-25.09 28.16-25.09 28.16-11.266 9.2148-7.168 29.695-7.168 29.695-23.551 14.848-49.664 11.266-49.664 11.266-19.457 2.0469-19.969-30.207-19.969-30.207-4.0977-27.137-15.871-28.672-15.871-28.672 9.7266 9.2148 8.1914 17.406 8.1914 17.406-10.754-18.945-37.887-12.801-37.887-12.801-9.2148 1.5352-14.848-14.336-14.848-14.336 1.0234 19.969 18.434 18.945 18.434 18.945 13.824 4.6094 14.848 19.969 14.848 19.969-15.359-11.266-28.672-3.0703-28.672-3.0703 34.816 0.51172 22.527 24.574 22.527 24.574-4.0977 7.168-3.0703 13.824-3.0703 13.824 1.0234 12.801 20.992 28.16 20.992 28.16-7.168-2.5586-24.574 0.51172-24.574 0.51172-16.383 1.0234-25.602-12.289-26.113-12.801 7.6797 21.504 31.23 18.434 31.23 18.434 15.871 2.0469 19.969 9.7266 19.969 9.7266-19.457-0.51172-33.793 16.895-33.793 16.895 28.672-22.016 61.953 4.0977 61.953 4.0977 23.551 12.801 45.055-9.2148 45.055-9.2148 5.6328-4.6094 14.336-3.5859 18.945-2.5586 1.5352 0.51172 2.5586 1.0234 4.0977 1.5352 4.6094 3.5859 10.754 2.5586 10.754 2.5586-1.5352 9.7266-6.1445 22.016-18.945 20.992 0-8.1914-9.7266 0-9.7266 0-30.207-5.6328-63.488 26.625-63.488 26.625s-12.801 17.406-49.664 11.777c-23.039-3.5859-47.105-18.945-61.441-29.695-4.0977-9.2148-10.238-28.16-9.2148-55.809 1.5352-40.449-33.793-70.656-33.793-70.656s-12.801-10.238-19.969-10.238c0 0 11.266 13.824 9.7266 42.496 0 0 2.0469 21.504 3.5859 25.09 0 0-41.473-30.719-78.848-10.238 0 0 48.641 23.551 67.07 51.711 11.266 17.406 33.281 26.113 48.641 29.695 37.887 60.414 111.62 62.977 111.62 62.977 90.113 7.6797 103.43-19.969 103.43-19.969 22.016-5.1211 10.238-12.801 10.238-12.801l5.6328-7.168s8.7031 16.383 7.168 22.527-3.5859 8.1914-3.5859 8.1914-11.777 4.6094-18.434 8.7031c-1.5352 0.51172-2.0469 2.5586-1.5352 4.0977 1.0234 2.0469 3.0703 4.0977 9.2148 4.0977 1.5352 0 2.5586-0.51172 4.0977-1.5352 2.5586-2.0469 8.7031-6.6562 13.824-6.6562 0 0 2.0469 0 1.0234 1.5352l-3.5859 3.5859s-0.51172 2.5586 1.5352 2.5586c0 0 2.0469-1.5352 3.5859-3.0703 0 0 1.5352-1.0234 3.5859-1.5352 1.5352-0.51172 3.0703-1.5352 3.5859-3.0703 0 0 2.5586 2.5586 4.0977 2.5586 1.5352 0 5.1211 3.0703 5.1211 3.0703s3.0703 1.5352 3.0703-0.51172c0 0-2.0469-2.5586-4.0977-4.0977-2.0469-1.5352 0-1.5352 0-1.5352s4.0977 0 8.1914 1.5352l7.168 5.1211c1.0234 0.51172 2.0469 1.0234 3.0703 1.0234 8.7031 0.51172 10.238-3.5859 10.238-5.6328 0-1.0234-0.51172-1.5352-1.0234-2.0469-3.0703-1.5352-12.289-5.6328-20.992-9.2148 0 0-7.6797-1.5352-3.5859-21.504l4.0977-18.434s3.0703-11.777 2.5586-17.406c0 0 0.51172-4.6094 1.0234-6.1445l4.6094-21.504c0.51172-0.51172 1.0234-1.0234 1.5352-1.5352l0.51172-0.51172v-0.51172-0.51172c0.51172-0.51172 0.51172-1.0234 0.51172-1.5352v-0.51172-0.51172-0.51172-0.51172-0.51172-0.51172-0.51172-0.51172-3.0703-1.0234c9.2148-9.7266 13.312-25.09 13.312-25.09 0.51172 24.062-16.895 52.223-17.406 52.734 31.742-31.742 22.527-76.801 22.527-76.801 16.383 12.801 1.5352 48.129 1.5352 49.152 27.648-33.281-7.6797-72.191-7.6797-72.191 2.5586 0.51172 19.457 23.039 20.48 24.574-11.266-17.922-24.062-32.77-24.062-32.77l2.0469-2.0469c11.777-6.668 28.672 13.812 29.184 14.836zm-104.96 155.65c1.0234-0.51172 2.0469-0.51172 2.5586-0.51172 0 0-1.0234 0.51172-2.5586 0.51172z" fill="currentColor"/>
</svg>
`;
var mermaidError = (token, e) => `
<div 
  class="mermaid-error" 
  style="display: flex; flex-direction: row; width: 100%; border-radius: 0.75rem; rgba(60, 60, 60, .1); padding: 0.5rem;"
>
  <div style="display: flex;  flex-direction: row">
    <div style="display: flex; flex-grow: 0; margin-right: 0.5rem">
      ${mermaid_icon}
    </div>
    <div class="error-info">
      <div class="error-text">
        Mermaid Parsing Error
      </div>
      <div style="display: flex; flex-grow: 0.5">
          <div class="error-message">
            ${e instanceof Error ? e.message : String(e)}
          </div>
      </div>
  </div>
</div> <!-- end error defn -->
<div style="display: flex; flex-direction: column; flex-grow: 1">
    <div class="definition-heading" style="font-weight: 600; font-size: 1.2rem;">
      Mermaid Definition
    </div>
    <div class="definition">
        <pre>${token.content}</pre>
    </div>
</div>
</div>`;

// src/index.ts
var MermaidPlugin = (config = {}) => (md) => {
  config = {
    theme: "default",
    minHeight: 50,
    startOnLoad: true,
    ...config
  };
  const defaultFenceRenderer = md.renderer.rules.fence;
  if (!defaultFenceRenderer) {
    throw new Error("no default fence renderer configured for Mermaid!");
  }
  import_mermaid.default.initialize(config);
  const fence = (tokens, idx, opts, env, self) => {
    var token = tokens[idx];
    if (token.tag === "code" && token.info.startsWith("mermaid")) {
      const re = new RegExp(/mermaid\s*?({.*)/);
      const result = token.info.match(re);
      const mermaidOpts = result ? result[1].trim() : "{}";
      console.log("mermaid options found: ", mermaidOpts);
      const minHeight = config.minHeight;
      const id = config.id || (0, import_native_dash.uuid)();
      delete config.id;
      delete config.minHeight;
      try {
        const script = `
<script src="mermaid.js" />
<script>
  (async() => {
    mermaid.initialize(${JSON.stringify(config)});
    const selector = "#${id}";
    const element = document.querySelector(selector);
    const insertSvg = (svgCode, bindFunctions) => {
      element.innerHTML = svgCode;
    };
    const graphDefinition = "${token.content}";
    const graph = mermaid.mermaidAPI.render(selector, graphDefinition, insertSvg);
  })();
<\/script>`;
        const defn = (0, import_native_dash.toBase64)(token.content);
        const html = `${style}<div id="${id}" class="mermaid" data-definition="${defn}" style="min-height: ${minHeight}px">
${token.content}</div>${script}`;
        return html;
      } catch (e) {
        console.group(`Mermaid rendering error: ${e instanceof Error ? e.message : String(e)}`);
        console.warn("failed to render mermaid configuration:");
        console.info(token.content);
        console.groupEnd();
        return mermaidError(token, e);
      }
    } else {
      return "";
    }
  };
  md.renderer.rules.fence = fence;
};
var src_default = MermaidPlugin;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});

},{"mermaid":9,"native-dash":10}],9:[function(require,module,exports){
(function (process){(function (){
/*! For license information please see mermaid.min.js.LICENSE.txt */

}).call(this)}).call(this,require('_process'))
},{"_process":4}],10:[function(require,module,exports){
(function (global,Buffer){(function (){
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  COLOR: () => COLOR,
  DataType: () => DataType,
  KnownError: () => KnownError,
  RESET_BG: () => RESET_BG,
  RESET_FG: () => RESET_FG,
  UnknownError: () => UnknownError,
  atRandom: () => atRandom,
  between: () => between,
  camelize: () => camelize,
  capitalize: () => capitalize,
  color: () => color,
  createLookup: () => createLookup,
  dasherize: () => dasherize,
  describe: () => describe,
  deserialize: () => deserialize,
  equal: () => equal,
  find: () => find,
  findAll: () => findAll,
  first: () => first,
  firstKey: () => firstKey,
  flatten: () => flatten,
  fromBase64: () => fromBase64,
  get: () => get,
  groupBy: () => groupBy,
  guid: () => guid,
  hash: () => hash,
  initials: () => initials,
  isEven: () => isEven,
  isKnownError: () => isKnownError,
  isLeapYear: () => isLeapYear,
  isNonNullObject: () => isNonNullObject,
  isOdd: () => isOdd,
  isUnknownError: () => isUnknownError,
  isUuid: () => isUuid,
  italicize: () => italicize,
  keys: () => keys,
  last: () => last,
  lastKey: () => lastKey,
  omit: () => omit,
  paint: () => paint,
  pascalize: () => pascalize,
  pathJoin: () => pathJoin,
  pluralize: () => pluralize,
  randomString: () => randomString,
  replace: () => replace,
  retain: () => retain,
  serialize: () => serialize,
  set: () => set,
  snakerize: () => snakerize,
  strikethrough: () => strikethrough,
  toBase64: () => toBase64,
  underline: () => underline,
  unique: () => unique,
  uuid: () => uuid
});
module.exports = __toCommonJS(src_exports);

// src/atRandom.ts
function atRandom(things, excluding = []) {
  things = things.filter(
    (i) => typeof excluding === "function" ? excluding(i) : !excluding.includes(i)
  );
  const random = Math.floor(Math.random() * things.length);
  return things[random];
}

// src/base64.ts
function toBase64(input) {
  const buffer = Buffer.from(input, "utf-8");
  return buffer.toString("base64");
}
function fromBase64(input, isJson = false) {
  const buffer = Buffer.from(input, "base64");
  return isJson ? JSON.parse(buffer.toString("utf-8")) : buffer.toString("utf-8");
}

// src/between.ts
function between(start, end) {
  const diff = Math.abs(end - start) + 1;
  const random = Math.floor(Math.random() * diff);
  return start + random;
}

// src/capitalize.ts
function capitalize(input) {
  return input.slice(0, 1).toUpperCase() + input.slice(1);
}

// src/pascalize.ts
function pascalize(input, preserveWhitespace = void 0) {
  const [_, preWhite, focus, postWhite] = /^(\s*)(.*?)(\s*)$/.exec(
    input
  );
  const convertInteriorToCap = (i) => i.replace(/[ |_|-]+([0-9]*?[a-z|A-Z]{1})/gs, (_2, p1) => p1.toUpperCase());
  const startingToCap = (i) => i.replace(/^[_|-]*?([0-9]*?[a-z]{1})/gs, (_2, p1) => p1.toUpperCase());
  const replaceLeadingTrash = (i) => i.replace(/^[-_]/s, "");
  const replaceTrailingTrash = (i) => i.replace(/[-_]$/s, "");
  const pascal = `${preserveWhitespace ? preWhite : ""}${capitalize(
    replaceTrailingTrash(replaceLeadingTrash(convertInteriorToCap(startingToCap(focus))))
  )}${preserveWhitespace ? postWhite : ""}`;
  return pascal;
}

// src/camelize.ts
function camelize(input, preserveWhitespace) {
  const pascal = preserveWhitespace ? pascalize(input, preserveWhitespace) : pascalize(input);
  const [_, preWhite, focus, postWhite] = /^(\s*)(.*?)(\s*)$/.exec(
    pascal
  );
  const camel = (preserveWhitespace ? preWhite : "") + focus.replace(/^.*?([0-9]*?[a-z|A-Z]{1})/s, (_2, p1) => p1.toLowerCase()) + (preserveWhitespace ? postWhite : "");
  return camel;
  ;
}

// src/createLookup.ts
var defaultMiss = (missed) => {
  throw new Error(`Failure in lookup searching for "${missed}"`);
};
function createLookup(known, miss = defaultMiss) {
  return (v) => {
    const value = v === true ? "true" : v === false ? "false" : v;
    return value in known ? known[value] : miss(value);
  };
}

// src/dasherize.ts
function dasherize(input, preserveWhitespace) {
  const [_, preWhite, focus, postWhite] = /^(\s*)(.*?)(\s*)$/.exec(input);
  const replaceWhitespace = (i) => i.replace(/\s/gs, "-");
  const replaceUppercase = (i) => i.replace(/[A-Z]/g, (c) => `-${c[0].toLowerCase()}`);
  const replaceLeadingDash = (i) => i.replace(/^-/s, "");
  const replaceTrailingDash = (i) => i.replace(/-$/s, "");
  const replaceUnderscore = (i) => i.replace(/_/g, "-");
  const removeDupDashes = (i) => i.replace(/-+/g, "-");
  return `${preWhite}${replaceUnderscore(
    replaceTrailingDash(
      replaceLeadingDash(removeDupDashes(replaceWhitespace(replaceUppercase(focus))))
    )
  )}${postWhite}`;
}

// src/types/other-types.ts
var DataType = /* @__PURE__ */ ((DataType2) => {
  DataType2["null"] = "null";
  DataType2["string"] = "string";
  DataType2["number"] = "number";
  DataType2["bigint"] = "bigint";
  DataType2["symbol"] = "symbol";
  DataType2["boolean"] = "boolean";
  DataType2["function"] = "function";
  DataType2["undefined"] = "undefined";
  DataType2["dictionary"] = "dictionary";
  DataType2["object"] = "object";
  DataType2["array"] = "array";
  DataType2["stringArray"] = "string[]";
  DataType2["numberArray"] = "number[]";
  DataType2["booleanArray"] = "boolean[]";
  DataType2["symbolArray"] = "symbol[]";
  DataType2["functionArray"] = "function[]";
  DataType2["undefinedArray"] = "undefined[]";
  DataType2["nullArray"] = "null[]";
  DataType2["objectArray"] = "object[]";
  DataType2["dictionaryArray"] = "dictionary[]";
  return DataType2;
})(DataType || {});
function isNonNullObject(thingy) {
  return typeof thingy === "object" && thingy !== null;
}

// src/describe.ts
function describe(data) {
  if (!isNonNullObject(data)) {
    return data === null ? "null" /* null */ : DataType[typeof data];
  }
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return "array" /* array */;
    }
    const SAMPLE_SIZE = 5;
    const partial = data.slice(0, SAMPLE_SIZE);
    const elements = partial.map((p) => describe(p));
    return elements;
  }
  if (Object.keys(data).length === 0) {
    return "object" /* object */;
  }
  const dictionary = data;
  const dataStruct = Object.keys(dictionary).reduce((agg, key) => {
    return {
      ...agg,
      ...isNonNullObject(dictionary[key]) ? { [key]: describe(dictionary[key]) } : { [key]: typeof dictionary[key] }
    };
  }, {});
  return dataStruct;
}

// src/deserialize.ts
function deserialize(arr) {
  return arr.split("\n").map((i) => JSON.parse(i));
}

// src/equal.ts
var import_inferred_types = require("inferred-types");
function type(v) {
  return Array.isArray(v) ? "array" /* array */ : v === null ? "null" /* null */ : typeof v;
}
function equal(a, b, depth = 1) {
  const ta = type(a);
  const tb = type(b);
  if (ta !== tb) {
    return false;
  }
  switch (ta) {
    case "null" /* null */:
    case void 0:
      return true;
    case "boolean":
    case "string":
    case "symbol":
    case "number":
    case "bigint":
      return a === b;
    case "array" /* array */:
      if (a.length !== b.length) {
        return false;
      }
      return a.every((v, idx) => equal(v, b[idx]));
    case "object":
      const ka = (0, import_inferred_types.dictToKv)(a);
      const kb = (0, import_inferred_types.dictToKv)(b);
      if (ka.length !== kb.length) {
        return false;
      }
      return ka.every(
        (i) => type(i.value) === "object" ? depth > 0 ? equal(i.value, b[i.key], depth - 1) : false : i.value === b[i.key]
      );
    default:
      return a === b;
  }
}

// src/errors.ts
var import_brilliant_errors = require("brilliant-errors");
var [KnownError, isKnownError] = (0, import_brilliant_errors.createError)("KnownError", "NativeDash")("cardinality", "network", "invalid-type", "missing-resource", "not-allowed")()()();
var [UnknownError, isUnknownError] = (0, import_brilliant_errors.createError)("KnownError", "NativeDash")()()()();

// src/find.ts
var find = (pattern, ...names) => (content) => {
  let re;
  try {
    re = new RegExp(pattern);
  } catch {
    throw new KnownError(
      `Invalid RegExp pattern passed into find(): ${pattern}`,
      "invalid-type/RegExp"
    );
  }
  if (names && names.includes("all")) {
    throw new KnownError(
      `The name "all" can not be used in find() because an "all" value will always be passed back!`,
      "not-allowed/named-property"
    );
  }
  const found = content.match(re);
  const arr = [];
  const obj = {};
  if (found) {
    for (let idx = 0; idx < found.length; idx++) {
      arr.push(found[idx]);
      if (names.length > 0) {
        const key = idx === 0 ? "all" : idx - 1 < names.length ? names[idx - 1] : `unknown_${idx}`;
        obj[key] = found[idx];
      }
    }
  }
  return found ? names.length > 0 ? {
    ...obj,
    found: true,
    next: () => {
      const nextContent = content.replace(obj.all, "");
      return find(pattern, ...names)(nextContent);
    }
  } : arr : names.length > 0 ? { found: false } : false;
};

// src/findAll.ts
function reduceToFindAllResult(result) {
  const blob = { ...result };
  delete blob.found;
  delete blob.next;
  return blob;
}
function isNamedFind(result) {
  return typeof result === "object" && !Array.isArray(result);
}
function isUnnamedFind(result) {
  return !isNamedFind(result);
}
var findAll = (pattern, ...names) => (content) => {
  let re;
  try {
    re = new RegExp(pattern);
  } catch {
    throw new KnownError(`Invalid RegExp pattern passed into findAll(): ${pattern}`, "invalid-type/RegExp");
  }
  let result = find(pattern, ...names)(content);
  let output = [];
  if (isNamedFind(result)) {
    const results = [];
    while (result.found) {
      results.push(reduceToFindAllResult(result));
      result = result.next();
    }
    output = results;
  }
  if (isUnnamedFind(result)) {
    const results = [];
    while (result) {
      results.push(result);
      const newContent = content.replace(result[0], "");
      result = find(pattern, ...names)(newContent);
    }
    output = results;
  }
  return output;
};

// src/first.ts
function first(arr) {
  return arr.slice(0, 1)[0];
}

// src/firstKey.ts
function firstKey(dict) {
  const key = Object.keys(dict).slice(0, 1).pop();
  return key ? key : false;
}

// src/flatten.ts
function flatten(arr) {
  return arr.flat ? arr.flat() : arr.reduce((acc, val) => acc.concat(val), []);
}

// src/get.ts
function get(obj, dotPath, defaultValue) {
  const parts = dotPath.split(".");
  let value = obj;
  parts.forEach((p) => {
    value = typeof value === "object" && Object.keys(value).includes(p) ? value[p] : void 0;
  });
  return value ? value : defaultValue;
}

// src/omit.ts
function omit(obj, ...removals) {
  const untyped = removals;
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !untyped.includes(key))
  );
}

// src/groupBy.ts
function isFunction(thingy) {
  return typeof thingy === "function";
}
function groupBy(propOrFn, data) {
  return data.reduce((acc, i) => {
    if (isFunction(propOrFn)) {
      const [key, val] = propOrFn(i);
      const current = acc[key] || [];
      return {
        ...acc,
        [key]: current.concat(val)
      };
    } else {
      const key = i[propOrFn];
      const current = acc[key] || [];
      if (Array.isArray(current)) {
        return { ...acc, [key]: current.concat(omit(i, propOrFn)) };
      }
    }
  }, {});
}

// src/randomString.ts
function randomString() {
  return ((1 + Math.random()) * 65536 | 0).toString(16).substring(1);
}

// src/uuid.ts
function uuid(dasherized = true) {
  return dasherized ? randomString() + randomString() + "-" + randomString() + "-" + randomString() + "-" + randomString() + "-" + randomString() + randomString() + randomString() : randomString() + randomString() + randomString() + randomString() + randomString() + randomString() + randomString() + randomString();
}

// src/guid.ts
function guid() {
  return uuid();
}

// src/hash.ts
function hash(digest) {
  let hash2 = 0, i, chr;
  for (i = 0; i < digest.length; i++) {
    chr = digest.charCodeAt(i);
    hash2 = (hash2 << 5) - hash2 + chr;
    hash2 |= 0;
  }
  return hash2;
}

// src/initials.ts
function initials(input, strategy = "all") {
  let re;
  let takeFirst = false;
  switch (strategy) {
    case "all":
      re = /(\s+|[A-Z]{1}|-[a-zA-Z]{1}|_[a-zA-Z]{1}|\.[a-zA-Z]{1}|[0-9]+)/g;
      takeFirst = true;
      break;
    default:
      throw new Error("only the 'all' strategy is implemented currently");
  }
  const trimmed = input.trim();
  const first2 = takeFirst ? trimmed.slice(0, 1).toUpperCase() : "";
  const rest = takeFirst ? trimmed.slice(1) : trimmed;
  const parts = rest.split(re).filter((i) => i.trim() && i.match(re));
  const breakChars = ["_", "-"];
  const remaining = parts.map((i) => {
    const atBreak = i.slice(0, 1);
    return breakChars.includes(atBreak) ? i.slice(1).toUpperCase() : atBreak.toUpperCase();
  });
  return [first2, ...remaining].join("");
}

// src/isEven.ts
function isEven(value) {
  return value % 2 ? false : true;
}

// src/isLeapYear.ts
function isLeapYear(year) {
  const y = typeof year === "number" ? year : year.getFullYear();
  return new Date(y, 1, 29).getDate() === 29;
}

// src/isOdd.ts
function isOdd(value) {
  return value % 2 ? true : false;
}

// src/isUuid.ts
function isUuid(candidate, allowNonDashedForm) {
  const dasherizedGuid = /^(\{{0,1}([0-9a-fA-F]){8}-([0-9a-fA-F]){4}-([0-9a-fA-F]){4}-([0-9a-fA-F]){4}-([0-9a-fA-F]){12}\}{0,1})$/;
  const plainGuid = /^(\{{0,1}([0-9a-fA-F]){32}\}{0,1})$/;
  return allowNonDashedForm === true ? plainGuid.test(candidate) || dasherizedGuid.test(candidate) : dasherizedGuid.test(candidate);
}

// src/keys.ts
function keys(obj) {
  return Object.keys(obj);
}

// src/last.ts
function last(arr) {
  return arr.slice(-1)[0];
}

// src/lastKey.ts
function lastKey(dict) {
  const key = Object.keys(dict).slice(-1).pop();
  return key ? key : false;
}

// src/pathJoin.ts
function pathJoin(...args) {
  const leadingSlash = args[0] && (args[0].startsWith("/") || args[0].startsWith("\\"));
  const parts = args.filter((i) => i).map((i) => removeSlashAtFrontAndBack(makeForwardSlashBeBackward(i)));
  if (parts.slice(1).some((i) => i.includes(".."))) {
    throw new Error(
      `pathJoin() only accepts the ".." notation at the beginning of the first string and no where else. Input was invalid: ${JSON.stringify(
        args
      )}`
    );
  }
  return `${leadingSlash ? "/" : ""}${parts.join("/")}`;
}
function removeSlashAtFrontAndBack(input) {
  input = input.startsWith("/") ? input.slice(1) : input;
  input = input.endsWith("/") ? input.slice(0, input.length - 1) : input;
  return input;
}
function makeForwardSlashBeBackward(input) {
  return input.replace(/\\/gs, "/");
}

// src/pluralize.ts
var defaultRules = [
  [/(us)$/i, (i) => `${i.replace(/us$/, "")}i`, ["bus", "us"]],
  [/(is)$/i, (i, r) => `${i.replace(r, "")}es`],
  [/(s|sh|ch|x|z|o)$/, (i) => `${i}es`],
  [/fe{0,1}$/i, (i, r) => `${i.replace(r, "")}ves`],
  [
    /[b|c|d|f|g|h|j|k|l|m|n|p|q|r|s|t|v|w|x|z|y]y$/i,
    (i) => `${i.slice(0, i.length - 1)}ies`
  ]
];
function pluralize(input, options = {}) {
  if (input === "") {
    if (options.ignoreEmptyStrings)
      return "";
    throw new Error("Attempt to pluralize an empty string");
  }
  const defaultExceptions = [
    [/(.*)(photo)$/i, "$1$2s"],
    [/(.*)(piano)$/i, "$1$2s"],
    [/(.*)(halo)$/i, "$1$2s"],
    [/(.*)(foot)$/i, "$1feet"],
    [/(.*)(man)$/i, "$1men"],
    [/(.*)(pe)rson$/i, "$1$2ople"],
    [/(.*)(mouse)$/i, "$1mice"],
    [/(.*)(series)$/i, "$1series"],
    [/(.*)(sheep)$/i, "$1sheep"],
    [/(.*)(deer)$/i, "$1deer"],
    [/^(fun)$/i, "$1"]
  ];
  const exceptions = [
    ...defaultExceptions,
    ...options.bespokeExceptions ? options.bespokeExceptions : []
  ].filter((e) => {
    const [re, _] = e;
    return re.test(input.toLowerCase());
  });
  if (exceptions.length > 0) {
    const [re, result] = exceptions[0];
    return input.replace(re, result);
  }
  const pRules = options.rules || options.additionalRules ? defaultRules.concat(...options.additionalRules) : defaultRules;
  let index = 0;
  const rules = pRules.filter(
    (r) => r[0 /* regex */].test(input.toLowerCase()) && !(r[2 /* exceptions */] || []).includes(input)
  );
  if (rules.length > 0) {
    const [r, fn, exceptions2] = rules[0];
    return fn(input, r, exceptions2 || []);
  } else {
    return `${input}s`;
  }
}

// src/retain.ts
function retain(obj, ...retainedProps) {
  const untyped = retainedProps;
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => untyped.includes(key))
  );
}

// src/serialize.ts
function serialize(arr) {
  return arr.map((i) => JSON.stringify(i)).join("\n");
}

// src/set.ts
function set(obj, dotPath, value, createIfNonExistant = true) {
  if (!dotPath) {
    throw new Error(`Attempt to set value into a dotPath but the dotPath was empty!`);
  }
  const parts = dotPath.split(/\??\./);
  const allButLast = parts.slice(0, parts.length - 1);
  const key = parts.pop();
  let ref = obj;
  allButLast.forEach((p) => {
    if (!ref[p]) {
      if (createIfNonExistant) {
        ref[p] = {};
      } else {
        throw new Error(
          `The dotPath -- ${dotPath} -- does not exist in the passed in object. You must either expressly state that you want the object structure created or this a real error that must be addressed otherwise. The part of the path which this failed on was "${p}".`
        );
      }
    } else if (typeof ref[p] !== "object") {
      throw new Error(
        `Failed to set the path of "${dotPath}" of the passed in base object because the base object had a scalar value along that path and setting this would have changed the object's data structure in way which is not allowed! The scalar value was found in the "${p}" component of the path.`
      );
    }
    ref = ref[p];
  });
  ref[key] = value;
}

// src/snakerize.ts
function snakerize(input, preserveWhitespace = false) {
  const [_, preWhite, focus, postWhite] = /^(\s*)(.*?)(\s*)$/.exec(
    input
  );
  const convertInteriorSpace = (input2) => input2.replace(/\s+/gs, "_");
  const convertDashes = (input2) => input2.replace(/-/gs, "_");
  const injectUnderscoreBeforeCaps = (input2) => input2.replace(/([A-Z])/gs, "_$1");
  const removeLeadingUnderscore = (input2) => input2.startsWith("_") ? input2.slice(1) : input2;
  return ((preserveWhitespace ? preWhite : "") + removeLeadingUnderscore(
    injectUnderscoreBeforeCaps(convertDashes(convertInteriorSpace(focus)))
  ).toLowerCase() + (preserveWhitespace ? postWhite : "")).replace(/__/g, "_");
}

// src/unique.ts
function unique(list, property) {
  return Array.from(new Set(list.map((i) => i[property])));
}

// src/formatting/private/constants.ts
var RESET_FG = `\x1B[39m`;
var RESET_BG = `\x1B[49m`;
var COLOR = {
  black: [30, 40],
  red: [31, 41],
  magenta: [35, 45],
  yellow: [33, 43],
  green: [32, 42],
  brightRed: [91, 40],
  brightGreen: [92, 42],
  brightYellow: [93, 43]
};

// src/formatting/private/paint.ts
function paint(text = "", fg, bg) {
  const foreground = "\x1B[" + fg(COLOR)[0] + "m";
  const bgc = bg ? bg(COLOR)[1] : null;
  const background = bgc ? "\x1B[" + bgc + "m" : "";
  const reset = background ? `${RESET_FG}${RESET_BG}` : `${RESET_FG}`;
  return `${RESET_FG}${foreground}${background}${text}${reset}`;
}

// src/formatting/format.ts
function italicize(text = "") {
  return `\x1B[3m${text}\x1B[0m`;
}
function underline(text = "") {
  return `\x1B[4m${text}\x1B[0m`;
}
function strikethrough(text = "") {
  return `\x1B[9m${text}\x1B[0m`;
}

// src/formatting/private/replace.ts
function replace(find2, corpus, formatting, global = true) {
  const re = new RegExp(find2, global ? "gs" : "s");
  let replacement = find2;
  if (formatting.color)
    replacement = paint(replacement, formatting.color, formatting.bg);
  if (formatting.italics)
    replacement = italicize(replacement);
  if (formatting.underline)
    replacement = underline(replacement);
  if (formatting.strikeThrough)
    replacement = strikethrough(replacement);
  return corpus.replace(re, replacement);
}

// src/formatting/color.ts
var color = {
  red: (text = "", bg) => {
    return paint(text, (c) => c.red, bg);
  },
  magenta: (text = "", bg) => {
    return paint(text, (c) => c.magenta, bg);
  },
  black: (text = "", bg) => {
    return paint(text, (c) => c.black, bg);
  },
  yellow: (text = "", bg) => {
    return paint(text, (c) => c.yellow, bg);
  },
  green: (text = "", bg) => {
    return paint(text, (c) => c.green, bg);
  },
  brightRed: (text = "", bg) => {
    return paint(text, (c) => c.brightRed, bg);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  COLOR,
  DataType,
  KnownError,
  RESET_BG,
  RESET_FG,
  UnknownError,
  atRandom,
  between,
  camelize,
  capitalize,
  color,
  createLookup,
  dasherize,
  describe,
  deserialize,
  equal,
  find,
  findAll,
  first,
  firstKey,
  flatten,
  fromBase64,
  get,
  groupBy,
  guid,
  hash,
  initials,
  isEven,
  isKnownError,
  isLeapYear,
  isNonNullObject,
  isOdd,
  isUnknownError,
  isUuid,
  italicize,
  keys,
  last,
  lastKey,
  omit,
  paint,
  pascalize,
  pathJoin,
  pluralize,
  randomString,
  replace,
  retain,
  serialize,
  set,
  snakerize,
  strikethrough,
  toBase64,
  underline,
  unique,
  uuid
});

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer)
},{"brilliant-errors":5,"buffer":2,"inferred-types":7}],11:[function(require,module,exports){
let markdownItMermaid = require('mdi-mermaid')
window.markdownItMermaid  = markdownItMermaid
},{"mdi-mermaid":8}]},{},[11]);