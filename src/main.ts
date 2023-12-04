import { runAction } from "./action";
import { ActionConfig } from "./ActionConfig";
import { ConfigurationProvider } from "./ConfigurationProvider";
import { VersionResult } from "./VersionResult";
import * as core from "@actions/core";
import { VersionType } from "./providers/VersionType";

function setOutput(versionResult: VersionResult) {
  const {
    major,
    minor,
    patch,
    preReleaseType,
    preReleaseBuild,
    increment,
    versionType,
    formattedVersion,
    versionTag,
    changed,
    isTagged,
    authors,
    currentCommit,
    previousCommit,
    previousVersion,
    debugOutput,
  } = versionResult;

  const repository = process.env.GITHUB_REPOSITORY;

  if (!changed) {
    core.info("No changes detected for this commit");
  }

  core.info(`Version is ${formattedVersion}`);
  if (repository !== undefined) {
    core.info(
      `To create a release for this version, go to https://github.com/${repository}/releases/new?tag=${versionTag}&target=${
        currentCommit.split("/").slice(-1)[0]
      }`,
    );
  }

  core.setOutput("version", formattedVersion);
  core.setOutput("major", major.toString());
  core.setOutput("minor", minor.toString());
  core.setOutput("patch", patch.toString());
  core.setOutput("pre_release_type", preReleaseType?.toString());
  core.setOutput("pre_release_build", preReleaseBuild?.toString());
  core.setOutput("patch", patch.toString());
  core.setOutput("increment", increment.toString());
  core.setOutput("version_type", VersionType[versionType].toLowerCase());
  core.setOutput("changed", changed.toString());
  core.setOutput("is_tagged", isTagged.toString());
  core.setOutput("version_tag", versionTag);
  core.setOutput("authors", authors);
  core.setOutput("previous_commit", previousCommit);
  core.setOutput("previous_version", previousVersion);
  core.setOutput("current_commit", currentCommit);
  core.setOutput("debug_output", debugOutput);
}

export async function run() {
  function toBool(value: string): boolean {
    if (!value || value.toLowerCase() === "false") {
      return false;
    } else if (value.toLowerCase() === "true") {
      return true;
    }
    return false;
  }

  function toStringOrBool(value: string): string | boolean {
    if (!value || value === "false") {
      return false;
    }
    if (value === "true") {
      return true;
    }
    return value;
  }

  const config: ActionConfig = {
    branch: core.getInput("branch"),
    tagPrefix: core.getInput("tag_prefix"),
    personalAccessToken: core.getInput("pat"),
    usePreReleases: toBool(core.getInput("use_pre_releases")),
    majorPattern: core.getInput("major_pattern"),
    minorPattern: core.getInput("minor_pattern"),
    patchPattern: core.getInput("patch_pattern"),
    versionFromBranch: toStringOrBool(core.getInput("version_from_branch")),
    preMajorPattern: core.getInput("pre_major_pattern"),
    preMinorPattern: core.getInput("pre_minor_pattern"),
    prePatchPattern: core.getInput("pre_patch_pattern"),
    releasePattern: core.getInput("release_pattern"),
    versionFormat: core.getInput("version_format"),
    changePath: core.getInput("change_path"),
    namespace: core.getInput("namespace"),
    searchCommitBody: toBool(core.getInput("search_commit_body")),
    userFormatType: core.getInput("user_format_type"),
    debug: toBool(core.getInput("debug")),
    replay: "",
  };

  const configurationProvider = new ConfigurationProvider(config);
  const result = await runAction(configurationProvider);
  setOutput(result);
}

run();
