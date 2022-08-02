"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const core = __importStar(require("@actions/core"));
const fast_glob_1 = __importDefault(require("fast-glob"));
const utils_1 = require("./utils");
const path_1 = __importDefault(require("path"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const uploadUrl = core.getInput('upload_url');
            const file = core.getInput('files');
            const token = core.getInput('token');
            const headers = core.getInput('headers');
            const method = core.getInput('method');
            const cwd = core.getInput('cwd');
            if (!uploadUrl) {
                throw new Error('uploadUrl is empty');
            }
            if (!file) {
                throw new Error('file is empty');
            }
            if (!token) {
                throw new Error('token is empty');
            }
            let newHeader = {};
            // 处理 headers 值
            if (headers && headers.trim()) {
                newHeader = JSON.parse(headers);
            }
            const input_files = (0, utils_1.parseInputFiles)(file);
            if (input_files.length) {
                const newCwd = cwd || process.cwd();
                const entries = yield (0, fast_glob_1.default)(input_files, { cwd: newCwd });
                console.log(`entries---->${JSON.stringify(entries, null, 2)}`);
                core.info(`entries---->${JSON.stringify(entries, null, 2)}`);
                const assets = yield Promise.all(entries.map((pathUrls) => __awaiter(this, void 0, void 0, function* () {
                    const json = yield (0, utils_1.uploadReleaseAsset)(path_1.default.join(newCwd, pathUrls), uploadUrl, token, newHeader, method);
                    delete json.uploader;
                    return json;
                }))).catch(error => {
                    throw error;
                });
                core.setOutput('assets', assets);
                console.log(`'assets--->${JSON.stringify(assets, null, 2)}`);
                core.info(`assets: ${JSON.stringify(assets, null, 2)}`);
            }
            else {
                core.setFailed('File cannot be empty');
            }
            console.log(`🎉 Release ready`);
        }
        catch (error) {
            if (error instanceof Error)
                core.setFailed(error.message);
        }
    });
}
run();
