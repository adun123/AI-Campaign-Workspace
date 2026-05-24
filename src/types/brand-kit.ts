import type { ID, ISODateString } from "./common";

export interface BrandColor {
  name: string;
  hex: string;
}

export interface BrandTypography {
  headingFont: string;
  bodyFont: string;
}

export interface BrandVoice {
  tone: string[]; // e.g. ["confident", "playful"]
  doList: string[];
  dontList: string[];
}

export interface BrandKit {
  id: ID;
  workspaceId: ID;
  name: string;
  logoUrl?: string;
  colors: BrandColor[];
  typography: BrandTypography;
  voice: BrandVoice;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}
