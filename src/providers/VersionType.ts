
/** Indicates the type of change a particular version change represents */
export enum VersionType {
  /** Indicates a major version change */
  Major = 'Major',
  /** Indicates a minor version change */
  Minor = 'Minor',
  /** Indicates a patch version change */
  Patch = 'Patch',
  /** Indicates a pre-major version change */
  PreMajor = 'PreMajor',
  /** Indicates a pre-minor version change */
  PreMinor = 'PreMinor',
  /** Indicates a pre-patch version change */
  PrePatch = 'PrePatch',
  /** Indicates a release version change */
  Release = 'Release',
  /** Indicates no change--generally this means that the current commit is already tagged with a version */
  None = 'None'
}
