import { VersionFormatter } from './VersionFormatter';
import { VersionInformation } from "../providers/VersionInformation";
import { ActionConfig } from '../ActionConfig';

export class DefaultVersionFormatter implements VersionFormatter {

  private formatString: string;
  private seperator: string;
  private buildSeperator: string;

  constructor(config: ActionConfig) {
    this.formatString = config.versionFormat;
    this.seperator = '-';
    this.buildSeperator = '.';
  }

  public Format(versionInfo: VersionInformation): string {
    return this.formatString
      .replace('${major}', versionInfo.major.toString())
      .replace('${minor}', versionInfo.minor.toString())
      .replace('${patch}', versionInfo.patch.toString())
      .replace('${seperator}', versionInfo.preReleaseType ? this.seperator : '')
      .replace('${preReleaseType}', versionInfo.preReleaseType?.toString() ?? '')
      .replace('${buildSeperator}', versionInfo.preReleaseType ? this.buildSeperator : '')
      .replace('${preReleaseBuild}', versionInfo.preReleaseBuild?.toString() ?? '')
      .replace('${increment}', versionInfo.increment.toString());
  }
}
