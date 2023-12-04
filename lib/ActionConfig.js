"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionConfig = void 0;
/** Represents the input configuration for the semantic-version action */
class ActionConfig {
    constructor() {
        /** Set to specify a specific branch, default is the current HEAD */
        this.branch = "HEAD";
        /** The prefix to use to identify tags */
        this.tagPrefix = "v";
        /** The personal access token to access the repo */
        this.personalAccessToken = "";
        /** If true, the branch will be used to select the maximum version. */
        this.versionFromBranch = false;
        /** If true, releases will be marked as pre-release till released */
        this.usePreReleases = false;
        /** A string which, if present in a git commit, indicates that a change represents a major (breaking) change. Wrap with '/' to match using a regular expression. */
        this.majorPattern = "(MAJOR)";
        /** A string which, if present in a git commit, indicates that a change represents a minor (feature) change. Wrap with '/' to match using a regular expression. */
        this.minorPattern = "(MINOR)";
        /** A string which, if present in a git commit, indicates that a change represents a patch change. Wrap with '/' to match using a regular expression. */
        this.patchPattern = "(PATCH)";
        /** A string which, if present in a git commit, indicates that a change represents a pre-release major (breaking) change. Wrap with '/' to match using a regular expression. */
        this.preMajorPattern = "(PREMAJOR)";
        /** A string which, if present in a git commit, indicates that a change represents a pre-release minor (feature) change. Wrap with '/' to match using a regular expression. */
        this.preMinorPattern = "(PREMINOR)";
        /** A string which, if present in a git commit, indicates that a change represents a pre-release patch change. Wrap with '/' to match using a regular expression. */
        this.prePatchPattern = "(PREPATCH)";
        /** A string which, if present in a git commit, indicates that a change represents a release. Wrap with '/' to match using a regular expression. */
        this.releasePattern = "(RELEASE)";
        /** Pattern to use when formatting output version */
        this.versionFormat = "${major}.${minor}.${patch}${seperator}${preReleaseType}${buildSeperator}${preReleaseBuild}";
        /** Path to check for changes. If any changes are detected in the path the 'changed' output will true. Enter multiple paths separated by spaces. */
        this.changePath = "";
        /** Use to create a named sub-version. This value will be appended to tags created for this version. */
        this.namespace = "";
        /** If true, the body of commits will also be searched for major/minor patterns to determine the version type */
        this.searchCommitBody = false;
        /** The output method used to generate list of users, 'csv' or 'json'. Default is 'csv'. */
        this.userFormatType = "csv";
        /** If enabled, diagnostic information will be added to the action output. */
        this.debug = false;
        /** Diagnostics to replay */
        this.replay = "";
    }
}
exports.ActionConfig = ActionConfig;
