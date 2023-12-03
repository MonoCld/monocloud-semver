import { ActionConfig } from "../ActionConfig";
import { CommitInfo } from "./CommitInfo";
import { CommitInfoSet } from "./CommitInfoSet";
import { ReleaseInformation } from "./ReleaseInformation";
import { VersionClassification } from "./VersionClassification";
import { VersionClassifier } from "./VersionClassifier";
import { VersionType } from "./VersionType";

export class DefaultVersionClassifier implements VersionClassifier {

    protected majorPattern: (commit: CommitInfo) => boolean;
    protected minorPattern: (commit: CommitInfo) => boolean;
    protected patchPattern: (commit: CommitInfo) => boolean;
    protected releasePattern: (commit: CommitInfo) => boolean;
    protected preMajorPattern: (commit: CommitInfo) => boolean;
    protected preMinorPattern: (commit: CommitInfo) => boolean;
    protected prePatchPattern: (commit: CommitInfo) => boolean;
    protected usePreReleases: boolean;

    constructor(config: ActionConfig) {
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

    protected parsePattern(pattern: string, searchBody: boolean): (pattern: CommitInfo) => boolean {
        if (/^\/.+\/[idgs]*$/.test(pattern)) {
            const regexEnd = pattern.lastIndexOf('/');
            const parsedFlags = pattern.slice(pattern.lastIndexOf('/') + 1);
            const regex = new RegExp(pattern.slice(1, regexEnd), parsedFlags);
            return searchBody ?
                (commit: CommitInfo) => regex.test(commit.subject) || regex.test(commit.body) :
                (commit: CommitInfo) => regex.test(commit.subject);
        } else {
            const matchString = pattern;
            return searchBody ?
                (commit: CommitInfo) => commit.subject.includes(matchString) || commit.body.includes(matchString) :
                (commit: CommitInfo) => commit.subject.includes(matchString);
        }
    }

    protected getNextVersion(current: ReleaseInformation, type: VersionType): ({ major: number, minor: number, patch: number, preReleaseType: string | null, preReleaseBuild: number | null }) {
        switch (type) {
            case VersionType.Major:
                return { major: current.major + 1, minor: 0, patch: 0, preReleaseType: null, preReleaseBuild: null };
            case VersionType.Minor:
                return { major: current.major, minor: current.minor + 1, patch: 0, preReleaseType: null, preReleaseBuild: null };
            case VersionType.Patch:
                return { major: current.major, minor: current.minor, patch: current.patch + 1, preReleaseType: null, preReleaseBuild: null };
            case VersionType.Release:
                return { major: current.major, minor: current.minor, patch: current.patch, preReleaseType: null, preReleaseBuild: null };
            case VersionType.PreMajor:
                return { major: current.major + 1, minor: 0, patch: 0, preReleaseType: current.preReleaseType ?? 'pre', preReleaseBuild: 0 };
            case VersionType.PreMinor:
                return { major: current.major, minor: current.minor + 1, patch: 0, preReleaseType: current.preReleaseType ?? 'pre', preReleaseBuild: 0 };
            case VersionType.PrePatch:
                return { major: current.major, minor: current.minor, patch: current.patch + 1, preReleaseType: current.preReleaseType ?? 'pre', preReleaseBuild: 0 };
            case VersionType.None:
                if (!this.usePreReleases) {
                    return { major: current.major, minor: current.minor, patch: current.patch, preReleaseBuild: null, preReleaseType: null };
                }
                return { major: current.major, minor: current.minor, patch: current.preReleaseType ? current.patch : current.patch + 1, preReleaseType: current.preReleaseType ?? 'pre', preReleaseBuild: current.preReleaseBuild != null ? current.preReleaseBuild + 1 : 0 };
            default:
                throw new Error(`Unknown change type: ${type}`);
        }
    }

    private resolveCommitType(commitsSet: CommitInfoSet): ({ type: VersionType, increment: number, changed: boolean }) {
        if (commitsSet.commits.length === 0) {
            return { type: VersionType.None, increment: 0, changed: commitsSet.changed };
        }

        const commits = commitsSet.commits.reverse();

        let index = 1;
        for (let commit of commits) {
            if (this.majorPattern(commit)) {
                return { type: VersionType.Major, increment: commits.length - index, changed: commitsSet.changed };
            }
            index++;
        }

        index = 1;
        for (let commit of commits) {
            if (this.minorPattern(commit)) {
                return { type: VersionType.Minor, increment: commits.length - index, changed: commitsSet.changed };
            }
            index++;
        }

        index = 1;
        for (let commit of commits) {
            if (this.patchPattern(commit)) {
                return { type: VersionType.Patch, increment: commits.length - index, changed: commitsSet.changed };
            }
            index++;
        }

        index = 1;
        for (let commit of commits) {
            if (this.releasePattern(commit)) {
                return { type: VersionType.Release, increment: commits.length - index, changed: commitsSet.changed };
            }
            index++;
        }

        index = 1;
        for (let commit of commits) {
            if (this.preMajorPattern(commit)) {
                return { type: VersionType.PreMajor, increment: commits.length - index, changed: commitsSet.changed };
            }
            index++;
        }

        index = 1;
        for (let commit of commits) {
            if (this.preMinorPattern(commit)) {
                return { type: VersionType.PreMinor, increment: commits.length - index, changed: commitsSet.changed };
            }
            index++;
        }

        index = 1;
        for (let commit of commits) {
            if (this.prePatchPattern(commit)) {
                return { type: VersionType.PrePatch, increment: commits.length - index, changed: commitsSet.changed };
            }
            index++;
        }

        return { type: this.usePreReleases ? VersionType.None : VersionType.Patch, increment: commitsSet.commits.length - 1, changed: true };
    }

    public async ClassifyAsync(lastRelease: ReleaseInformation, commitSet: CommitInfoSet): Promise<VersionClassification> {

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
            return new VersionClassification(VersionType.None, currentIncrement, false, <number>lastRelease.currentMajor, <number>lastRelease.currentMinor, <number>lastRelease.currentPatch, <string | null>lastRelease.currentPreReleaseType, <number | null>lastRelease.currentPreReleaseBuild);
        }


        return new VersionClassification(type, increment, changed, major, minor, patch, preReleaseType, preReleaseBuild);
    }
}