/** Represents the input configuration for the semantic-version action */
export class ActionConfig {
  /** Set to specify a specific branch, default is the current HEAD */
  public branch: string = "HEAD";
  /** The prefix to use to identify tags */
  public tagPrefix: string = "v";
  /** The personal access token to access the repo */
  public personalAccessToken: string = "";
  /** If true, the branch will be used to select the maximum version. */
  public versionFromBranch: string | boolean = false;
  /** If true, releases will be marked as pre-release till released */
  public usePreReleases: boolean = false;
  /** A string which, if present in a git commit, indicates that a change represents a major (breaking) change. Wrap with '/' to match using a regular expression. */
  public majorPattern: string = "(MAJOR)";
  /** A string which, if present in a git commit, indicates that a change represents a minor (feature) change. Wrap with '/' to match using a regular expression. */
  public minorPattern: string = "(MINOR)";
  /** A string which, if present in a git commit, indicates that a change represents a patch change. Wrap with '/' to match using a regular expression. */
  public patchPattern: string = "(PATCH)";
  /** A string which, if present in a git commit, indicates that a change represents a pre-release major (breaking) change. Wrap with '/' to match using a regular expression. */
  public preMajorPattern: string = "(PREMAJOR)";
  /** A string which, if present in a git commit, indicates that a change represents a pre-release minor (feature) change. Wrap with '/' to match using a regular expression. */
  public preMinorPattern: string = "(PREMINOR)";
  /** A string which, if present in a git commit, indicates that a change represents a pre-release patch change. Wrap with '/' to match using a regular expression. */
  public prePatchPattern: string = "(PREPATCH)";
  /** A string which, if present in a git commit, indicates that a change represents a release. Wrap with '/' to match using a regular expression. */
  public releasePattern: string = "(RELEASE)";
  /** Pattern to use when formatting output version */
  public versionFormat: string =
    "${major}.${minor}.${patch}${seperator}${preReleaseType}${buildSeperator}${preReleaseBuild}";
  /** Path to check for changes. If any changes are detected in the path the 'changed' output will true. Enter multiple paths separated by spaces. */
  public changePath: string = "";
  /** Use to create a named sub-version. This value will be appended to tags created for this version. */
  public namespace: string = "";
  /** If true, the body of commits will also be searched for major/minor patterns to determine the version type */
  public searchCommitBody: boolean = false;
  /** The output method used to generate list of users, 'csv' or 'json'. Default is 'csv'. */
  public userFormatType: string = "csv";
  /** If enabled, diagnostic information will be added to the action output. */
  public debug: boolean = false;
  /** Diagnostics to replay */
  public replay: string = "";
}
