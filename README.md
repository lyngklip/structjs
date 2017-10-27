# structjs - Python-style struct module in javascript
This module performs conversions between javascript values and C structs represented as javascript [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) objects. This can be used in handling binary data stored in files or from network connections, among other sources. It uses [Format Strings](#format-strings) as compact descriptions of the layout of the C structs and the intended conversion to/from javascript values.

> **Note:** Unlike Python struct, this module does not support native size and alignment (that wouldn't make much sense in a javascript). Instead, specify byte order and emit pad bytes explicitly.

Several methods of [Struct](#object) take a buffer argument. This refers to [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) objects.

> **Note:** In Python struct the buffer argument refers to an object that implements the Buffer Protocol.

## Functions
The module defines the following function:

<a name="struct"></a>
**struct**(*format*)  
Return a new object which writes and reads binary data according to the [format string](#format-strings) *format*.

> **Note:** This is not a constructor, don't use new. In Python this is a constructor. Python has functions for packing and unpacking without the intermediate step of creating an object using the struct function. However I decided against including such functions as they are redundant, and I did not want to clutter the interface unnecessarily. They are currently in the code but inside a comment.

## Objects

<a name="object"></a>
The compiled Struct objects returned by [struct](#struct) support the following methods and attributes:

<a name="pack"></a>
**pack**(*v1, v2, ...*)  
Return an [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) object containing the values *v1, v2, ...* packed according to [format](#format). The arguments must match the values required by the format exactly (`result.byteLength` will equal [size](#size)).

<a name="pack_into"></a>
**pack_into**(*buffer, offset, v1, v2, ...*)  
Pack the values *v1, v2, ...* according to [format](#format) and write the packed bytes into the [ ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) *buffer* starting at position *offset*. Note that *offset* is a required argument.

<a name="unpack"></a>
**unpack**(*buffer*)  
Unpack from the [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) *buffer* (presumably packed by `pack()`) according to [format](#format). The result is a tuple even if it contains exactly one item. The buffer’s size in bytes must match the size required by the format, as reflected by [size](#size).

<a name="unpack_from"></a>
**unpack_from**(*buffer, offset=0*)  
Unpack from [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) *buffer* starting at position *offset*, according to [format](#format). The result is a tuple even if it contains exactly one item. The buffer’s size in bytes, minus *offset*, must be at least the size required by the format, as reflected by [size](#size).

<a name="iter_unpack"></a>
**iter_unpack**(*buffer*)  
Iteratively unpack from the buffer buffer according to [format]#format. This function returns an iterator which will read equally-sized chunks from the buffer until all its contents have been consumed. The buffer’s size in bytes must be a multiple of the size required by the [format](#format), as reflected by [size](#size) (this is not enforced, remaining bytes are ignored silently).

Each iteration yields a tuple as specified by the [format string](#format-strings).

<a name="format"></a>
**format**  
The [format string](#format-strings) used to construct this object.

<a name="size"></a>
**size**  
The calculated size of the struct (and hence of the [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) object produced by the [pack()](#pack) method) corresponding to [format](#format).

<a href="format-strings"></a>
## Format Strings
Format strings are the mechanism used to specify the expected layout when packing and unpacking data. They are built up from [Format Characters](#format-characters), which specify the type of data being packed/unpacked. In addition, there are special characters for controlling the [Byte Order](#byte-order).

> **Note:** Unlike Python struct, this module does not have special format characters for indicating native size and alignment.

### Byte Order
By default, C types are represented in the standard format and byte order, and not aligned in any way (no pad bytes are inserted).

> **Note:** This is different from Python struct which uses native format.

The first character of the format string can be used to indicate the byte order, according to the following table:

| Character | Byte order    |
|-----------|---------------|
| <	        | little-endian	|
| >	        | big-endian    |
If the first character is not one of these, '>' is assumed.

> **Differences from Python struct:**  
> Python struct has more options that don't make as much sense for javascript.  
> No '@', '=', '!'. Use '>' for '!'.  
> No native support.  
> No alignment. Use 'x' for padding.

### Format Characters
Format characters have the following meaning; the conversion between C and ES values should be obvious given their types. The ‘Size’ column refers to the size of the packed value in bytes:

|Format|C Type     |ES Type |Size|
|---|--------------|--------|---|
| x |pad byte      |        | 1 |
| c |char          | String of length 1| 1 |
| b |signed char   | Number	| 1 |
| B |unsigned char | Number	| 1 |
| ? |_Bool         | Boolean| 1 |
| h |short         | Number	| 2 |
| H |unsigned short| Number	| 2 |
| i |int           | Number | 4 |
| I |unsigned int  | Number | 4 |
| f |float	       | Number | 4 |
| d |double        | Number | 8 |
| s |char[]        | String |   |
| p |char[]        | String |   |

> **Differences from Python:**  
> No 'l', 'L', 'q', 'Q', 'P', no integers, no floats, no doubles, only numbers.  
> For 'l' and 'L' use 'i' and 'I'. For 'P' use 'H' or 'I' as appropriate.  
> 'q' and 'Q' cannot be fully represented in javascript. Use 'i' or 'I' instead.  
> No 'n' or 'N'.

A format character may be preceded by an integral repeat count. For example, the format string `'4h'` means exactly the same as `'hhhh'`.

Whitespace characters between formats are not accepted.

> **Note:** Python struct ignores whitespace characters (a count and its format must not contain whitespace though).

For the 's' format character, the count is interpreted as the size of the string, not a repeat count like for the other format characters; for example, `'10s'` means a single 10-byte string, while `'10c'` means 10 characters. If a count is not given, it defaults to 1. For packing, the string is truncated or padded with null bytes as appropriate to make it fit. For unpacking, the resulting string always has exactly the specified number of bytes.

> **Note**: Python struct accepts a special case; '0s' means a single, empty string (while '0c' means 0 characters).

> **Note:** Python guarantees that when packing a value x using one of the integer formats ('b', 'B', 'h', 'H', 'i', 'I', 'l', 'L', 'q', 'Q'), if x is outside the valid range for that format then struct.error is raised.

The 'p' format character encodes a “Pascal string”, meaning a short variable-length string stored in a *fixed number of bytes*, given by the count. The first byte stored is the length of the string, or 255, whichever is smaller. The bytes of the string follow. If the string passed in to [pack()](#pack) is too long (longer than the count minus 1), only the leading `count-1` bytes of the string are stored. If the string is shorter than `count-1`, it is padded with null bytes so that exactly count bytes in all are used. Note that for [unpack()](#unpack), the `'p'` format character consumes `count` bytes, but that the string returned can never contain more than 255 characters.

For the `'?'` format character, the return value is either [true](link-to-es-true) or [false](link-to-es-false). When packing, the truth value of the argument object is used. Either 0 or 1 in the native or standard bool representation will be packed, and any non-zero value will be `true` when unpacking.

### Examples:
A basic example of packing/unpacking three integers:
```javascript
let struct = require("./struct"), s = struct('hhi'), b = new ArrayBuffer(s.size)
s.pack(1, 2, 3) // ArrayBuffer {}
new Uint8Array(s.pack(1, 2, 3)) // Uint8Array { '0': 0, '1': 1, '2': 0, '3': 2, '4': 0, '5': 0, '6': 0, '7': 3 }
s.unpack(new Uint8Array([0, 1, 0, 2, 0, 0, 0, 3]).buffer) // [ 1, 2, 3 ]
s.size // 8
s.pack_into(b, 0, 1, 2, 3)
new Uint8Array(b) // Uint8Array { '0': 0, '1': 1, '2': 0, '3': 2, '4': 0, '5': 0, '6': 0, '7': 3 }
```
Unpacked fields can be named by assigning them to variables:
```javascript
let struct = require("./struct"), s = struct("<10sHHb")
let record = s.pack("Raymond   ", 4658, 264, 8)
let [name, serialnum, school, gradelevel] = s.unpack(record)
```
