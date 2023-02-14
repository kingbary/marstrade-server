"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeIssue = exports.addIssue = void 0;
const addIssue = ({ array, element }) => {
    const uniqueSet = new Set(array);
    uniqueSet.add(element);
    return Array.from(uniqueSet);
};
exports.addIssue = addIssue;
const removeIssue = ({ array, element }) => {
    const uniqueSet = new Set(array);
    uniqueSet.delete(element);
    return Array.from(uniqueSet);
};
exports.removeIssue = removeIssue;
