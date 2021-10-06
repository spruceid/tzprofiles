"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
function hasher(content) {
    return __awaiter(this, void 0, void 0, function* () {
        const claimString = JSON.stringify(content);
        const encodedString = new TextEncoder().encode(claimString);
        const buf = yield crypto.subtle.digest('SHA-256', encodedString);
        return [...new Uint8Array(buf)]
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');
    });
}
exports.default = hasher;
