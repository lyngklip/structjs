#structjs
Python struct for javascript

Part of the documentation is blatantly stolen from Python docs.
##Functions
The module defines the following functions:
    struct(format)
##Format Strings
Format strings are the mechanism used to specify the expected layout when packing and unpacking data. They are built up from Format Characters, which specify the type of data being packed/unpacked. In addition, there are special characters for controlling the Byte Order.
###Byte Order, Size, and Alignment
The first character of the format string can be used to indicate the byte order, according to the following table:

| Character | Byte order    | Size      | Alignment |
|-----------|---------------|-----------|-----------|
| <	        | little-endian	| standard	| none      |
| >	        | big-endian	  | standard  | none      |
If the first character is not one of these, '>' is assumed.
**Differences from Python**
```
No '@', '=', '!'. Use '>' for '!'. No native byte order support.
No alignment. Use 'x' instead.
```
###Format Characters
Format characters have the following meaning:

Format|C Type|ES Type|Size|Notes
---|---|---|---|---
x|pad byte
c|char          | String of length 1|1	 
b|signed char   | Number	|1|(3)
B|unsigned char | Number	|1|(3)
?|_Bool         | Boolean |1|(1)
h|short         | Number	|2|(3)
H|unsigned short| Number	|2|(3)
i|int           | Number	|4|(3)
I|unsigned int  | Number  |4|(3)
f|float	        | Number  |4|(4)
d|double        | Number  |8|(4)
s|char[]        | String
p|char[]        | String
**Differences from Python**
```
No 'l', 'L', 'q', 'Q', 'P', no integers, no floats, no doubles, only numbers.
For 'l' and 'L' use 'i' and 'I'. For 'P' use 'H', or 'I' as appropriate.
'q' and 'Q' cannot be fully represented in javascript. Use 'I' or 'i' instead.
```
A format character may be preceded by an integral repeat count. For example, the format string `'4h'` means exactly the same as `'hhhh'`.

For the 's' format character, the count is interpreted as the size of the string, not a repeat count like for the other format characters; for example, `'10s'` means a single 10-byte string, while `'10c'` means 10 characters. If a count is not given, it defaults to 1. For packing, the string is truncated or padded with null bytes as appropriate to make it fit. For unpacking, the resulting string always has exactly the specified number of bytes.

The 'p' format character encodes a “Pascal string”, meaning a short variable-length string stored in a fixed number of bytes, given by the count. The first byte stored is the length of the string, or 255, whichever is smaller. The bytes of the string follow. If the string passed in to `pack_into()` is too long (longer than the count minus 1), only the leading count-1 bytes of the string are stored. If the string is shorter than `count-1`, it is padded with null bytes so that exactly count bytes in all are used. Note that for `unpack_from()`, the `'p'` format character consumes count bytes, but that the string returned can never contain more than 255 characters.

For the '?' format character, the return value is either `true` or `false`. When packing, the truth value of the argument object is used. Either 0 or 1 in the native or standard bool representation will be packed, and any non-zero value will be True when unpacking.
###Examples:
A basic example of packing/unpacking three integers:
```javascript
let struct = require("./struct")
let b = new ArrayBuffer(100)
let a = new Uint8Array(b)
struct('hhi').pack_into(b, 0, 1, 2, 3)
a.slice(0, 6) // Uint8Array { '0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
struct('hhi').size // 6
```

```javascript
let struct = require("./struct")
let s = struct("Bid10s")
console.log(s.size)
let ab = new ArrayBuffer(100)
s.pack_into(ab, 0, [1, -117, 47.234, "blah"])
let a = s.unpack_from(ab)
console.log(a) // [ 1, -117, 47.234, 'blah\u0000\u0000\u0000\u0000\u0000\u0000' ]
```

pack_into takes an array, I'll probably change that to match Python.

The format is the same as for Python except I left out q, Q, l, L, and P.

The module only returns the struct function, which is sort of a factory function.
I did not make it uppercase because it's not a constructor.
You're not supposed to use "new".
I did not supply the shorthand pack_into, unpack_from, calcsize nor the older
pack and unpack functions, as they don't add much value to the module.

Please be aware that my interest in javascript is purely academic at this point,
I have no idea if this code is idiomatic or even runs across various platforms.
I have only tested with node and mocha, I don't know if it will work with other
package manager, I don't even know if it works properly with npm.

I run the tests using "mocha --require should".
