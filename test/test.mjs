/*eslint-env es6, mocha*/
import should from "should";
should();

import struct from "../struct.mjs";
describe('struct', () => {
    let ab = new ArrayBuffer(100)
    let u8a = new Uint8Array(ab)
    it('packs and unpacks using pack and unpack functions', () => {
        let s = struct('b'), b = s.pack(-1)
        new Uint8Array(b).should.deepEqual(new Uint8Array([0xFF]))
        s.unpack(b).should.deepEqual([-1])
    })
    it('iterates', () => {
        Array.from(struct('b').iter_unpack(struct('bb').pack(1, 2))).should.deepEqual([[1], [2]])
    })
    it('packs and unpacks signed bytes', () => {
        struct('b').pack_into(ab, 5, -1)
        u8a.slice(5,6).should.deepEqual(new Uint8Array([0xFF]))
        struct('b').unpack_from(ab, 5).should.deepEqual([-1])
    })
    it('packs and unpacks unsigned bytes', () => {
        struct('B').pack_into(ab, 5, -1)
        u8a.slice(5,6).should.deepEqual(new Uint8Array([0xFF]))
        struct('B').unpack_from(ab, 5).should.deepEqual([0xFF])
    })
    it('packs and unpacks signed words', () => {
        struct('h').pack_into(ab, 5, -1)
        u8a.slice(5,7).should.deepEqual(new Uint8Array([0xFF, 0xFF]))
        struct('h').unpack_from(ab, 5).should.deepEqual([-1])
    })
    it('packs and unpacks unsigned words', () => {
        struct('H').pack_into(ab, 0, -1)
        u8a.slice(0,2).should.deepEqual(new Uint8Array([0xFF, 0xFF]))
        struct('H').unpack_from(ab, 5).should.deepEqual([0xFFFF])
    })
    it('packs and unpacks signed longs', () => {
        struct('i').pack_into(ab, 0, -1)
        u8a.slice(0,4).should.deepEqual(new Uint8Array([0xFF, 0xFF, 0xFF, 0xFF]))
        struct('i').unpack_from(ab).should.deepEqual([-1])
    })
    it('packs and unpacks unsigned longs', () => {
        struct('I').pack_into(ab, 0, -1)
        u8a.slice(0,4).should.deepEqual(new Uint8Array([0xFF, 0xFF, 0xFF, 0xFF]))
        struct('I').unpack_from(ab).should.deepEqual([0xFFFFFFFF])
    })
    it('packs and unpacks strings', () => {
        struct('10s').pack_into(ab, 0, "foobar")
        struct('10s').unpack_from(ab).should.deepEqual(["foobar\x00\x00\x00\x00"])
    })
    it('packs and unpacks pascal strings', () => {
        struct('3x10p3x').pack_into(ab, 0, "foobar")
        u8a.slice(0,3).should.deepEqual(new Uint8Array([0, 0, 0])) // pad
        u8a[3].should.equal(6) // String length
        u8a.slice(10,13).should.deepEqual(new Uint8Array([0, 0, 0])) // unused
        u8a.slice(13,16).should.deepEqual(new Uint8Array([0, 0, 0])) // pad
        struct('3x10p3x').unpack_from(ab).should.deepEqual(["foobar"])
    })
    it('packs and unpacks floats', () => {
        struct('f').pack_into(ab, 0, 1.2345)
        struct('f').unpack_from(ab)[0].should.be.approximately(1.2345, 0.00001)
    })
    it('packs and unpacks doubles', () => {
        struct('d').pack_into(ab, 0, 1.23456789)
        struct('d').unpack_from(ab)[0].should.be.approximately(1.23456789, 0.00000000000001)
    })
    it('skips pad bytes', () => {
        struct('bbxxxbb').pack_into(ab, 0, 1, 2, 3, 4)
        u8a.slice(0,7).should.deepEqual(new Uint8Array([1, 2, 0, 0, 0, 3, 4]))
        struct('bbxxxbb').unpack_from(ab).should.deepEqual([1, 2, 3, 4])
    })
    it('takes repeat counts', () => {
        struct('2b3x2b').pack_into(ab, 0, 1, 2, 3, 4)
        u8a.slice(0,7).should.deepEqual(new Uint8Array([1, 2, 0, 0, 0, 3, 4]))
        struct('2b3x2b').unpack_from(ab).should.deepEqual([1, 2, 3, 4])
    })
    it('packs and unpacks characters', () => {
        struct('3c').pack_into(ab, 0, "f", "o", "o")
        struct('3c').unpack_from(ab).should.deepEqual(["f", "o", "o"])
    })
    it('packs and unpacks booleans', () => {
        struct('??').pack_into(ab, 0, true, false)
        u8a.slice(0,2).should.deepEqual(new Uint8Array([1, 0]))
        struct('??').unpack_from(ab).should.deepEqual([true, false])
    })
    it('can do little-endian words and longs', () => {
        struct('<h').pack_into(ab, 5, 1)
        u8a.slice(5,7).should.deepEqual(new Uint8Array([1, 0]))
        struct('<h').unpack_from(ab, 5).should.deepEqual([1])
        struct('>h').unpack_from(ab, 5).should.deepEqual([0x0100])
    })
    it('handles more complicated structures', () => {
        let s = struct('<2h4x3H7i2x8s')
        s.pack_into(ab, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, -12, "hah")
        s.unpack_from(ab).should.deepEqual(
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, -12,
             "hah\x00\x00\x00\x00\x00"])
    })
})
