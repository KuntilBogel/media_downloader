"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("./index"));
const url = 'https://www.facebook.com/share/v/Hr3BZV9JjaKPy28P/';
(0, index_1.default)(url)
    .then((result) => console.log(result))
    .catch((error) => console.error(error));
