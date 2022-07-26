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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadReleaseAsset = exports.parseInputFiles = void 0;
const path_1 = __importDefault(require("path"));
const mime_1 = __importDefault(require("mime"));
const fs_1 = __importDefault(require("fs"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const parseInputFiles = (files) => {
    return files.split(/\r?\n/).reduce((acc, line) => acc
        .concat(line.split(','))
        .filter(pat => pat)
        .map(pat => pat.trim()), []);
};
exports.parseInputFiles = parseInputFiles;
const getAsset = (pathUrl) => {
    return {
        name: path_1.default.basename(pathUrl),
        mime: mime_1.default.getType(pathUrl) || 'application/octet-stream',
        size: fs_1.default.statSync(pathUrl).size,
        data: fs_1.default.readFileSync(pathUrl)
    };
};
const uploadReleaseAsset = (path, url, token) => __awaiter(void 0, void 0, void 0, function* () {
    const asset = getAsset(path);
    const endpoint = new URL(url);
    endpoint.searchParams.append('name', asset.name);
    const resp = yield (0, node_fetch_1.default)(endpoint, {
        headers: {
            'content-length': `${asset.size}`,
            'content-type': asset.mime,
            authorization: `token ${token}`
        },
        method: 'POST',
        body: asset.data
    });
    const json = yield resp.json();
    if (resp.status !== 201) {
        throw new Error(`Failed to upload release asset ${asset.name}. received status code ${resp.status}\n${json.message}\n${JSON.stringify(json.errors)}`);
    }
    return json;
});
exports.uploadReleaseAsset = uploadReleaseAsset;
