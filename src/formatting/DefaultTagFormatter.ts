import { TagFormatter } from './TagFormatter';
import { VersionInformation } from "../providers/VersionInformation";
import { ActionConfig } from '../ActionConfig';

/** Default tag formatter which allows a prefix to be specified */
export class DefaultTagFormatter implements TagFormatter {

  private tagPrefix: string;
  private namespace: string;
  private namespaceSeperator: string;
  private seperator: string;
  private buildSeperator: string;
  private usePreReleases: boolean;

  constructor(config: ActionConfig) {
    this.namespace = config.namespace;
    this.tagPrefix = config.tagPrefix;
    this.namespaceSeperator = '/'; // maybe make configurable in the future
    this.usePreReleases = config.usePreReleases;
    this.seperator = '-';
    this.buildSeperator = '.';
  }

  public Format(versionInfo: VersionInformation): string {
    let result = `${this.tagPrefix}${versionInfo.major}.${versionInfo.minor}.${versionInfo.patch}`;

    if (this.usePreReleases && versionInfo.preReleaseType) {
      result = result + this.seperator + versionInfo.preReleaseType + this.buildSeperator + versionInfo.preReleaseBuild;
    }

    if (!!this.namespace) {
      return `${this.namespace}${this.namespaceSeperator}${result}`;
    }

    return result;
  }

  public GetPattern(): string {

    if (!!this.namespace) {
      return `${this.namespace}${this.namespaceSeperator}${this.tagPrefix}*[0-9].*[0-9].*[0-9]`;
    }

    return `${this.tagPrefix}*[0-9].*[0-9].*[0-9]`;
  }

  public Parse(tag: string): [major: number, minor: number, patch: number, preReleaseType: string | null, preReleaseBuild: number | null] {

    if(tag === '') {
      return [0, 0, 0, null, null];
    }

    let tagParts = tag
      .replace(this.tagPrefix, '<--!PREFIX!-->')
      .replace(this.namespace, '<--!NAMESPACE!-->')
      .split('/');

    const stripedTag = tagParts[tagParts.length - 1]
      .replace('<--!PREFIX!-->', this.tagPrefix)
      .replace('<--!NAMESPACE!-->', this.namespace);

    let preReleaseValues = stripedTag
      .substring(this.tagPrefix.length)
      .split('-');

    let versionValues = preReleaseValues[0]
      .split('.');

    let preReleaseType = null;
    let preReleaseBuild = null;

    if (this.usePreReleases && preReleaseValues.length > 1) {
      const match = preReleaseValues[1].split('.');
      if (match.length > 1) {
        preReleaseType = match[0]; 
        preReleaseBuild = parseInt(match[1]);
      }
    }

    let major = parseInt(versionValues[0]);
    let minor = versionValues.length > 1 ? parseInt(versionValues[1]) : 0;
    let patch = versionValues.length > 2 ? parseInt(versionValues[2]) : 0;

    if (isNaN(major) || isNaN(minor) || isNaN(patch)) {
      throw `Invalid tag ${tag} (${versionValues})`;
    }

    return [major, minor, patch, preReleaseType, preReleaseBuild];
  };

  public IsValid(tag: string): boolean {
    const regexEscape = (literal: string) => literal.replace(/\W/g, '\\$&');
    const tagPrefix = regexEscape(this.tagPrefix);
    const namespaceSeperator = regexEscape(this.namespaceSeperator);
    const namespace = regexEscape(this.namespace);

    if (!!this.namespace) {
      if (this.usePreReleases) {
        return new RegExp(`^${namespace}${namespaceSeperator}${tagPrefix}[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*)?$`).test(tag);
      }

      return new RegExp(`^${namespace}${namespaceSeperator}${tagPrefix}[0-9]+\.[0-9]+\.[0-9]+$`).test(tag);
    }

    if (this.usePreReleases) {
      return new RegExp(`^${tagPrefix}[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*)?$`).test(tag);
    }

    return new RegExp(`^${tagPrefix}[0-9]+\.[0-9]+\.[0-9]+$`).test(tag);
  }
}
