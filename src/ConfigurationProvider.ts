import * as github from "@actions/github";
import { Octokit } from "octokit";
import micromatch from "micromatch";
import { CsvUserFormatter } from "./formatting/CsvUserFormatter";
import { DefaultTagFormatter } from "./formatting/DefaultTagFormatter";
import { DefaultVersionFormatter } from "./formatting/DefaultVersionFormatter";
import { JsonUserFormatter } from "./formatting/JsonUserFormatter";
import { TagFormatter } from "./formatting/TagFormatter";
import { UserFormatter } from "./formatting/UserFormatter";
import { VersionFormatter } from "./formatting/VersionFormatter";
import { CommitsProvider } from "./providers/CommitsProvider";
import { CurrentCommitResolver } from "./providers/CurrentCommitResolver";
import { DefaultCommitsProvider } from "./providers/DefaultCommitsProvider";
import { DefaultCurrentCommitResolver } from "./providers/DefaultCurrentCommitResolver";
import { DefaultVersionClassifier } from "./providers/DefaultVersionClassifier";
import { LastReleaseResolver } from "./providers/LastReleaseResolver";
import { DefaultLastReleaseResolver } from "./providers/DefaultLastReleaseResolver";
import { VersionClassifier } from "./providers/VersionClassifier";
import { ActionConfig } from "./ActionConfig";
import { DebugManager } from "./DebugManager";
import { BranchVersioningTagFormatter } from "./formatting/BranchVersioningTagFormatter";

export class ConfigurationProvider {
  constructor(config: ActionConfig) {
    this.config = config;
    DebugManager.getInstance().initializeConfig(config);
  }

  private config: ActionConfig;

  public GetCurrentCommitResolver(): CurrentCommitResolver {
    return new DefaultCurrentCommitResolver(this.config);
  }

  public GetLastReleaseResolver(): LastReleaseResolver {
    return new DefaultLastReleaseResolver();
  }

  public GetCommitsProvider(): CommitsProvider {
    return new DefaultCommitsProvider(this.config);
  }

  public GetVersionClassifier(): VersionClassifier {
    return new DefaultVersionClassifier(this.config);
  }

  public GetVersionFormatter(): VersionFormatter {
    return new DefaultVersionFormatter(this.config);
  }

  public GetTagFormatter(branchName: string): TagFormatter {
    if (this.config.versionFromBranch) {
      return new BranchVersioningTagFormatter(this.config, branchName);
    }
    return new DefaultTagFormatter(this.config);
  }

  public GetUserFormatter(): UserFormatter {
    switch (this.config.userFormatType) {
      case "json":
        return new JsonUserFormatter(this.config);
      case "csv":
        return new CsvUserFormatter(this.config);
      default:
        throw new Error(
          `Unknown user format type: ${this.config.userFormatType}, supported types: json, csv`,
        );
    }
  }

  public async GetChangedFiles(): Promise<string[] | undefined> {
    if (github.context.eventName != "push") {
      return;
    }

    const changePath = this.config.changePath
      .trim()
      .split(" ")
      .filter((x) => x !== "");

    if (changePath.length === 0) {
      return;
    }

    const octokit = new Octokit({ auth: this.config.personalAccessToken });
    const response = await octokit.rest.repos.compareCommits({
      base: github.context.payload.before as string,
      head: github.context.payload.after as string,
      ...github.context.repo,
    });

    const allChangedFiles = response.data.files?.map((x) => x.filename) ?? [];

    const matched = micromatch(
      allChangedFiles,
      this.config.changePath.split(" ").filter((x) => x !== ""),
    );

    return matched;
  }
}
