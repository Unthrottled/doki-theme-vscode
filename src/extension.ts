import * as vscode from "vscode";
import {activateTheme, getCurrentThemeAndSticker, getSticker, uninstallImages,} from "./ThemeManager";
import {DokiSticker, DokiTheme, StickerType} from "./DokiTheme";
import DokiThemeDefinitions from "./DokiThemeDefinitions";
import {StatusBarComponent} from "./StatusBar";
import {VSCodeGlobals} from "./VSCodeGlobals";
import {attemptToNotifyUpdates} from "./NotificationService";
import {showChanglog} from "./ChangelogService";
import {attemptToUpdateSticker} from "./StickerUpdateService";

export interface Sticker {
  path: string;
  name: string;
}

export interface DokiThemeDefinition {
  stickers: {
    default: Sticker;
    secondary?: Sticker;
  };
  information: any;
}

export interface VSCodeDokiThemeDefinition {
  extensionNames: string[];
  themeDefinition: DokiThemeDefinition;
}

const getCurrentSticker = (
  extensionCommand: string,
  dokiThemeDefinition: DokiThemeDefinition
): DokiSticker =>{
  const stickerType = extensionCommand.endsWith('secondary') ?
  StickerType.SECONDARY : StickerType.DEFAULT;
  const sticker = getSticker(dokiThemeDefinition, stickerType);
    return {
      sticker,
      type: stickerType,
    };
};

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("doki-theme.remove.sticker", () =>
      uninstallImages(context)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("doki-theme.doki.changelog", () =>
      showChanglog(context)
    )
  );

  VSCodeGlobals.globalState = context.globalState;

  StatusBarComponent.initialize();
  context.subscriptions.push(StatusBarComponent);

  attemptToNotifyUpdates(context);

  const {sticker} = getCurrentThemeAndSticker();
  attemptToUpdateSticker(context, sticker.sticker)
      .catch(error => {
        console.error("Unable to update sticker for reasons", error);
      });

  DokiThemeDefinitions.map((dokiThemeDefinition: VSCodeDokiThemeDefinition) =>
    dokiThemeDefinition.extensionNames.map((extensionCommand) => ({
      extensionCommand,
      dokiThemeDefinition,
    }))
  )
    .reduce((accum, next) => accum.concat(next), [])
    .map(({ dokiThemeDefinition, extensionCommand }) =>
      vscode.commands.registerCommand(extensionCommand, () =>
        activateTheme(
          new DokiTheme(dokiThemeDefinition.themeDefinition),
          getCurrentSticker(extensionCommand, dokiThemeDefinition.themeDefinition),
          context
        )
      )
    )
    .forEach((disposableHero) => context.subscriptions.push(disposableHero));
}

export function deactivate() {}
