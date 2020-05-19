import {getIndexOfMax, getMaxAndIndex, getNMax} from "./calculator";

const assert = require('assert');

function test_getNMax() {
    const data = [1, 2, 3, 7, 45, 3, 88, 34, 142, 5];
    const res = getNMax(data, 1);
    assert.strictEqual(res[0], 8);
}

function test_getIndexOfMax() {
    const data = [1, 2, 3, 7, 95, 3, 88, 34, 142, 5];
    assert.strictEqual(getIndexOfMax(data),4);
}

function test_getMaxAndIndex(){
    const data = [1, 2, 3, 7, 45, 3, 88, 34, 142, 5];
    assert(getMaxAndIndex(data).index === 8);
    assert(getMaxAndIndex(data).value === 142);
}

function runAllTests(){
    test_getNMax();
    test_getIndexOfMax();
    test_getMaxAndIndex();
}

export const Tests = {
    test_getNMax: test_getNMax,
    test_getIndexOfMax: test_getIndexOfMax,
    test_getMaxAndIndex: test_getMaxAndIndex,
    runAllTests: runAllTests
};





