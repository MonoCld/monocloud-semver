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
exports.DefaultVersionClassifier = void 0;
const VersionClassification_1 = require("./VersionClassification");
const VersionType_1 = require("./VersionType");
class DefaultVersionClassifier {
    constructor(config) {
        const searchBody = config.searchCommitBody;
        this.majorPattern = this.parsePattern(config.majorPattern, searchBody);
        this.minorPattern = this.parsePattern(config.minorPattern, searchBody);
        this.patchPattern = this.parsePattern(config.patchPattern, searchBody);
        this.releasePattern = this.parsePattern(config.releasePattern, searchBody);
        this.preMajorPattern = this.parsePattern(config.preMajorPattern, searchBody);
        this.preMinorPattern = this.parsePattern(config.preMinorPattern, searchBody);
        this.prePatchPattern = this.parsePattern(config.prePatchPattern, searchBody);
        this.usePreReleases = config.usePreReleases;
    }
    parsePattern(pattern, searchBody) {
        if (/^\/.+\/[idgs]*$/.test(pattern)) {
            const regexEnd = pattern.lastIndexOf('/');
            const parsedFlags = pattern.slice(pattern.lastIndexOf('/') + 1);
            const regex = new RegExp(pattern.slice(1, regexEnd), parsedFlags);
            return searchBody ?
                (commit) => regex.test(commit.subject) || regex.test(commit.body) :
                (commit) => regex.test(commit.subject);
        }
        else {
            const matchString = pattern;
            return searchBody ?
                (commit) => commit.subject.includes(matchString) || commit.body.includes(matchString) :
                (commit) => commit.subject.includes(matchString);
        }
    }
    getNextVersion(current, type) {
        var _a, _b, _c, _d;
        switch (type) {
            case VersionType_1.VersionType.Major:
                return { major: current.major + 1, minor: 0, patch: 0, preReleaseType: null, preReleaseBuild: null };
            case VersionType_1.VersionType.Minor:
                return { major: current.major, minor: current.minor + 1, patch: 0, preReleaseType: null, preReleaseBuild: null };
            case VersionType_1.VersionType.Patch:
                return { major: current.major, minor: current.minor, patch: current.patch + 1, preReleaseType: null, preReleaseBuild: null };
            case VersionType_1.VersionType.Release:
                return { major: current.major, minor: current.minor, patch: current.patch, preReleaseType: null, preReleaseBuild: null };
            case VersionType_1.VersionType.PreMajor:
                return { major: current.major + 1, minor: 0, patch: 0, preReleaseType: (_a = current.preReleaseType) !== null && _a !== void 0 ? _a : 'pre', preReleaseBuild: 0 };
            case VersionType_1.VersionType.PreMinor:
                return { major: current.major, minor: current.minor + 1, patch: 0, preReleaseType: (_b = current.preReleaseType) !== null && _b !== void 0 ? _b : 'pre', preReleaseBuild: 0 };
            case VersionType_1.VersionType.PrePatch:
                return { major: current.major, minor: current.minor, patch: current.patch + 1, preReleaseType: (_c = current.preReleaseType) !== null && _c !== void 0 ? _c : 'pre', preReleaseBuild: 0 };
            case VersionType_1.VersionType.None:
                if (!this.usePreReleases) {
                    return { major: current.major, minor: current.minor, patch: current.patch, preReleaseBuild: null, preReleaseType: null };
                }
                return { major: current.major, minor: current.minor, patch: current.preReleaseType ? current.patch : current.patch + 1, preReleaseType: (_d = current.preReleaseType) !== null && _d !== void 0 ? _d : 'pre', preReleaseBuild: current.preReleaseBuild != null ? current.preReleaseBuild + 1 : 0 };
            default:
                throw new Error(`Unknown change type: ${type}`);
        }
    }
    resolveCommitType(commitsSet) {
        if (commitsSet.commits.length === 0) {
            return { type: VersionType_1.VersionType.None, increment: 0, changed: commitsSet.changed };
        }
        const commits = commitsSet.commits.reverse();
        let index = 1;
        for (let commit of commits) {
            if (this.majorPattern(commit)) {
                return { type: VersionType_1.VersionType.Major, increment: commits.length - index, changed: commitsSet.changed };
            }
            index++;
        }
        index = 1;
        for (let commit of commits) {
            if (this.minorPattern(commit)) {
                return { type: VersionType_1.VersionType.Minor, increment: commits.length - index, changed: commitsSet.changed };
            }
            index++;
        }
        index = 1;
        for (let commit of commits) {
            if (this.patchPattern(commit)) {
                return { type: VersionType_1.VersionType.Patch, increment: commits.length - index, changed: commitsSet.changed };
            }
            index++;
        }
        index = 1;
        for (let commit of commits) {
            if (this.releasePattern(commit)) {
                return { type: VersionType_1.VersionType.Release, increment: commits.length - index, changed: commitsSet.changed };
            }
            index++;
        }
        index = 1;
        for (let commit of commits) {
            if (this.preMajorPattern(commit)) {
                return { type: VersionType_1.VersionType.PreMajor, increment: commits.length - index, changed: commitsSet.changed };
            }
            index++;
        }
        index = 1;
        for (let commit of commits) {
            if (this.preMinorPattern(commit)) {
                return { type: VersionType_1.VersionType.PreMinor, increment: commits.length - index, changed: commitsSet.changed };
            }
            index++;
        }
        index = 1;
        for (let commit of commits) {
            if (this.prePatchPattern(commit)) {
                return { type: VersionType_1.VersionType.PrePatch, increment: commits.length - index, changed: commitsSet.changed };
            }
            index++;
        }
        return { type: this.usePreReleases ? VersionType_1.VersionType.None : VersionType_1.VersionType.Patch, increment: commitsSet.commits.length - 1, changed: true };
    }
    ClassifyAsync(lastRelease, commitSet) {
        return __awaiter(this, void 0, void 0, function* () {
            const { type, increment, changed } = this.resolveCommitType(commitSet);
            const { major, minor, patch, preReleaseBuild, preReleaseType } = this.getNextVersion(lastRelease, type);
            if (lastRelease.currentPatch !== null) {
                // If the current commit is tagged, we must use that version. Here we check if the version we have resolved from the
                // previous commits is the same as the current version. If it is, we will use the increment value, otherwise we reset
                // to zero. For example:
                // - commit 1 - v1.0.0+0
                // - commit 2 - v1.0.0+1
                // - commit 3 was tagged v2.0.0 - v2.0.0+0
                // - commit 4 - v2.0.1+0
                const versionsMatch = lastRelease.currentMajor === major && lastRelease.currentMinor === minor && lastRelease.currentPatch === patch && lastRelease.currentPreReleaseBuild == preReleaseBuild && lastRelease.currentPreReleaseType == preReleaseType;
                const currentIncrement = versionsMatch ? increment : 0;
                return new VersionClassification_1.VersionClassification(VersionType_1.VersionType.None, currentIncrement, false, lastRelease.currentMajor, lastRelease.currentMinor, lastRelease.currentPatch, lastRelease.currentPreReleaseType, lastRelease.currentPreReleaseBuild);
            }
            return new VersionClassification_1.VersionClassification(type, increment, changed, major, minor, patch, preReleaseType, preReleaseBuild);
        });
    }
}
exports.DefaultVersionClassifier = DefaultVersionClassifier;
