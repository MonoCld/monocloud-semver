import { VersionInformation } from "../providers/VersionInformation";

export interface TagFormatter {
  Format(versionInfo: VersionInformation): string;
  GetPattern(): string;
  Parse(tag: string): [major: number, minor: number, patch: number, preReleaseType: string | null, preReleaseBuild: number | null];
  IsValid(tag: string): boolean;
}
