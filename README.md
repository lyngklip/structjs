#structjs
Python struct for javascript

Part of the documentation is blatantly stolen from Python docs.
##Functions
The module defines the following function:

`struct`(*format*)  
Return a new object which writes and reads binary data according to the format string *format*.  
This is not a constructor. Don't use new.

The object has the following methods and attributes:

`pack_into`(*buffer, offset, v1, v2, ...*)  
Pack the values `v1, v2, ...` according to the format, write the packed bytes into the  [ ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) *buffer* starting at *offset*. Note that the offset is a required argument.

`unpack_From`(*buffer, offset=0*)  
Unpack the [ ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) *buffer* according to the format. The result is an array even if it contains exactly one item. The *buffer* must contain at least the amount of data required by the format (`buffer.slice(offset).length` must be at least `struct(fmt).size`).

`format`  
The format string used to construct the object.

`size`  
The calculated size of the struct (and hence of the [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)) corresponding to `format`.

##Format Strings
Format strings are the mechanism used to specify the expected layout when packing and unpacking data. They are built up from Format Characters, which specify the type of data being packed/unpacked. In addition, there are special characters for controlling the Byte Order.
###Byte Order
The first character of the format string can be used to indicate the byte order, according to the following table:

| Character | Byte order    |
|-----------|---------------|
| <	        | little-endian	|
| >	        | big-endian    |
If the first character is not one of these, '>' is assumed.

```
Differences from Python:
No '@', '=', '!'. Use '>' for '!'. No native byte order support.
No alignment. Use 'x' instead.
```
###Format Characters
Format characters have the following meaning:

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

```
Differences from Python:
No 'l', 'L', 'q', 'Q', 'P', no integers, no floats, no doubles, only numbers.
For 'l' and 'L' use 'i' and 'I'. For 'P' use 'H', or 'I' as appropriate.
'q' and 'Q' cannot be fully represented in javascript. Use 'i' or 'I' instead.
```
A format character may be preceded by an integral repeat count. For example, the format string `'4h'` means exactly the same as `'hhhh'`.

For the 's' format character, the count is interpreted as the size of the string, not a repeat count like for the other format characters; for example, `'10s'` means a single 10-byte string, while `'10c'` means 10 characters. If a count is not given, it defaults to 1. For packing, the string is truncated or padded with null bytes as appropriate to make it fit. For unpacking, the resulting string always has exactly the specified number of bytes.

The 'p' format character encodes a “Pascal string”, meaning a short variable-length string stored in a fixed number of bytes, given by the count. The first byte stored is the length of the string, or 255, whichever is smaller. The bytes of the string follow. If the string passed in to `pack_into()` is too long (longer than the count minus 1), only the leading count-1 bytes of the string are stored. If the string is shorter than `count-1`, it is padded with null bytes so that exactly count bytes in all are used. Note that for `unpack_from()`, the `'p'` format character consumes count bytes, but that the string returned can never contain more than 255 characters.

For the `'?'` format character, the return value is either `true` or `false`. When packing, the truth value of the argument object is used. Either 0 or 1 in the native or standard bool representation will be packed, and any non-zero value will be `true` when unpacking.

###Examples:
A basic example of packing/unpacking three integers:
```javascript
let struct = require("./struct")
let s = struct('hhi')
s.size // 8
let b = new ArrayBuffer(s.size)
s.pack_into(b, 0, 1, 2, 3)
new Uint8Array(b) // Uint8Array { '0': 0, '1': 1, '2': 0, '3': 2, '4': 0, '5': 0, '6': 0, '7': 3 }
```
Unpacked fields can be named by assigning them to variables:
```javascript
let struct = require("./struct"), s = struct("<10sHHb"), b = new ArrayBuffer(s.size)
s.pack_into(b, 0, "Raymond   ", 4658, 264, 8)
Array.prototype.map.call(new Uint8Array(b), x => "0x" + x.toString(16)).join(", ")
// '0x52, 0x61, 0x79, 0x6d, 0x6f, 0x6e, 0x64, 0x20, 0x20, 0x20, 0x32, 0x12, 0x8, 0x1, 0x8'
((name, serial, school, grade) => ({ name, serial, school, grade }))(...s.unpack_from(b))
// { name: 'Raymond   ', serial: 4658, school: 264, grade: 8 }
```
