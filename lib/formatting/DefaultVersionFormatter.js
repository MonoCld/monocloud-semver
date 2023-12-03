"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultVersionFormatter = void 0;
class DefaultVersionFormatter {
    constructor(config) {
        this.formatString = config.versionFormat;
        this.seperator = '-';
        this.buildSeperator = '.';
    }
    Format(versionInfo) {
        var _a, _b, _c, _d;
        return this.formatString
            .replace('${major}', versionInfo.major.toString())
            .replace('${minor}', versionInfo.minor.toString())
            .replace('${patch}', versionInfo.patch.toString())
            .replace('${seperator}', versionInfo.preReleaseType ? this.seperator : '')
            .replace('${preReleaseType}', (_b = (_a = versionInfo.preReleaseType) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '')
            .replace('${buildSeperator}', versionInfo.preReleaseType ? this.buildSeperator : '')
            .replace('${preReleaseBuild}', (_d = (_c = versionInfo.preReleaseBuild) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : '')
            .replace('${increment}', versionInfo.increment.toString());
    }
}
exports.DefaultVersionFormatter = DefaultVersionFormatter;
