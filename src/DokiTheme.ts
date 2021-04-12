import { DokiThemeDefinition } from "./extension";

export interface StringDictionary<T> {
  [key: string]: T;
}

export class DokiTheme {
  name: string;
  displayName: string;
  id: string;
  colors: StringDictionary<string>;

  constructor(dokiThemeDefinition: DokiThemeDefinition) {
    this.name = dokiThemeDefinition.information.name;
    this.displayName = dokiThemeDefinition.information.displayName;
    this.id = dokiThemeDefinition.information.id;
    this.colors = dokiThemeDefinition.colors;
  }
}

export enum StickerType {
  DEFAULT= "DEFAULT", SECONDARY = "SECONDARY"
}

export interface DokiSticker {
  type: StickerType;
  sticker: Sticker;
}

export interface WeebificationAssets {
  waifuAsset: DokiSticker;
  theme: DokiTheme;
}

export interface Sticker {
  path: string;
  name: string;
  anchoring: string;
}
