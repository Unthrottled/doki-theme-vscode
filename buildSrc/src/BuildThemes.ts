import {
  MasterDokiThemeDefinition,
  StringDictionary,
  LAF_TYPE,
  resolveNamedColors,
  BaseAppDokiThemeDefinition,
  DokiThemeDefinitions,
  resolveTemplate,
  resolveColor,
  applyNamedColors,
  SYNTAX_TYPE,
  evaluateTemplates,
  readJson,
  getGroupName,
  resolveStickerPath, resolvePaths,
} from "doki-build-source";
import keys from "lodash/keys";

type VSCodeDokiThemeDefinition = BaseAppDokiThemeDefinition;

const path = require("path");

const {
  repoDirectory,
  masterThemeDefinitionDirectoryPath,
  appDefinitionDirectoryPath,
} = resolvePaths(__dirname);

const fs = require("fs");

const swapMasterThemeForLocalTheme = (
  masterDokiThemeDefinitionPath: string
): string => {
  const masterThemeFilePath = masterDokiThemeDefinitionPath.substring(
    masterThemeDefinitionDirectoryPath.toString().length
  );
  return `${appDefinitionDirectoryPath}${masterThemeFilePath}`;
};

function getThemeType(dokiThemeTemplateJson: MasterDokiThemeDefinition) {
  return dokiThemeTemplateJson.dark ? "dark" : "light";
}

function buildLAFColors(
  dokiThemeTemplateJson: MasterDokiThemeDefinition,
  dokiVSCodeThemeTemplateJson: VSCodeDokiThemeDefinition,
  dokiTemplateDefinitions: DokiThemeDefinitions,
  masterTemplates: DokiThemeDefinitions,
) {
  const lafTemplates = dokiTemplateDefinitions[LAF_TYPE];
  const lafTemplate = dokiVSCodeThemeTemplateJson.laf.extends
    ? dokiVSCodeThemeTemplateJson.laf
    : dokiThemeTemplateJson.dark
    ? lafTemplates.dark
    : lafTemplates.light;

  const resolvedLafTemplate = resolveTemplate(
    lafTemplate,
    lafTemplates,
    (template) => template.ui,
    (template) => template.extends
  );

  const resolvedNamedColors = resolveNamedColors(
    dokiTemplateDefinitions,
    dokiThemeTemplateJson,
  );

  const resolvedMasterNameColors = resolveNamedColors(
    masterTemplates,
    dokiThemeTemplateJson,
  );  

  return applyNamedColors(resolvedLafTemplate, {
    ...resolvedMasterNameColors,
    ...resolvedNamedColors,
    ...dokiVSCodeThemeTemplateJson.colors,
  });
}

function getSyntaxColor(
  syntaxSettingsValue: string,
  resolvedNamedColors: StringDictionary<string>
) {
  if (syntaxSettingsValue.indexOf("&") > -1) {
    return resolveColor(syntaxSettingsValue, resolvedNamedColors);
  } else {
    return syntaxSettingsValue;
  }
}

function buildSyntaxColors(
  dokiThemeTemplateJson: MasterDokiThemeDefinition,
  dokiThemeVSCodeTemplateJson: VSCodeDokiThemeDefinition,
  dokiTemplateDefinitions: DokiThemeDefinitions,
  masterTemplates: DokiThemeDefinitions,
) {
  const syntaxTemplate: any[] =
    dokiTemplateDefinitions[SYNTAX_TYPE].base.tokenColors;

  const overrides =
    dokiThemeTemplateJson.overrides?.editorScheme?.colors ||
    dokiThemeVSCodeTemplateJson?.overrides?.editorScheme?.colors || {};
  const resolvedNamedColors = {
    ...resolveNamedColors(
      masterTemplates,
      dokiThemeTemplateJson,
    ),
    ...resolveNamedColors(
      dokiTemplateDefinitions,
      dokiThemeTemplateJson,
    ),
    ...overrides,
    ...dokiThemeVSCodeTemplateJson.colors,
  };

  return syntaxTemplate.map((tokenSpecification) => {
    const newTokenSpec = {
      ...tokenSpecification,
    };

    const newsettings = Object.keys(newTokenSpec.settings)
      .map((key) => {
        const oldValue = newTokenSpec.settings[key];
        const value = getSyntaxColor(oldValue, resolvedNamedColors);
        return { key, value };
      })
      .reduce((accum: StringDictionary<string>, next) => {
        accum[next.key] = next.value;
        return accum;
      }, {});
    newTokenSpec.settings = newsettings;

    return {
      ...tokenSpecification,
      settings: newsettings,
    };
  });
}

function buildVSCodeTheme(
  dokiThemeDefinition: MasterDokiThemeDefinition,
  dokiThemeVSCodeDefinition: VSCodeDokiThemeDefinition,
  dokiTemplateDefinitions: DokiThemeDefinitions,
  masterTemplates: DokiThemeDefinitions,
) {
  return {
    type: getThemeType(dokiThemeDefinition),
    colors: buildLAFColors(
      dokiThemeDefinition,
      dokiThemeVSCodeDefinition,
      dokiTemplateDefinitions,
      masterTemplates,
    ),
    tokenColors: buildSyntaxColors(
      dokiThemeDefinition,
      dokiThemeVSCodeDefinition,
      dokiTemplateDefinitions,
      masterTemplates,
    ),
  };
}

function createDokiTheme(
  dokiFileDefinitionPath: string,
  dokiThemeDefinition: MasterDokiThemeDefinition,
  dokiTemplateDefinitions: DokiThemeDefinitions,
  dokiThemeVSCodeDefinition: VSCodeDokiThemeDefinition,
  masterTemplates: DokiThemeDefinitions,
) {
  try {
    return {
      path: swapMasterThemeForLocalTheme(dokiFileDefinitionPath),
      definition: dokiThemeDefinition,
      backgrounds: dokiThemeVSCodeDefinition.backgrounds,
      theme: buildVSCodeTheme(
        dokiThemeDefinition,
        dokiThemeVSCodeDefinition,
        dokiTemplateDefinitions,
        masterTemplates,
      ),
    };
  } catch (e) {
    throw new Error(
      `Unable to build ${dokiThemeDefinition.name}'s theme for reasons ${e}`
    );
  }
}


const getStickers = (
  dokiDefinition: MasterDokiThemeDefinition,
  dokiTheme: any
) => {
  const secondary =
    dokiDefinition.stickers.secondary || dokiDefinition.stickers.normal;
  const backgrounds = dokiTheme.backgrounds;
  return {
    default: {
      path: resolveStickerPath(dokiTheme.path, dokiDefinition.stickers.default, __dirname),
      name: dokiDefinition.stickers.default,
      anchoring: backgrounds?.default?.anchor || "center",
    },
    ...(secondary
      ? {
          secondary: {
            path: resolveStickerPath(dokiTheme.path, secondary, __dirname),
            name: secondary,
            anchoring: backgrounds?.secondary?.anchor || "center",
          },
        }
      : {}),
  };
};

const omit = require("lodash/omit");

console.log("Preparing to generate themes.");
evaluateTemplates(
  {
    appName: "vsCode",
    currentWorkingDirectory: __dirname,
  },
  createDokiTheme
)
  .then((dokiThemes) => {
    // write things for extension
    const dokiThemeDefinitions = dokiThemes.map((dokiTheme) => {
      const dokiDefinition = dokiTheme.definition;
      return {
        extensionNames: getCommandNames(dokiDefinition),
        themeDefinition: {
          information: omit(dokiDefinition, [
            "colors",
            "overrides",
            "ui",
            "icons",
          ]),
          stickers: getStickers(dokiDefinition, dokiTheme),
        },
      };
    });
    const finalDokiDefinitions = JSON.stringify(dokiThemeDefinitions);
    fs.writeFileSync(
      path.resolve(repoDirectory, "src", "DokiThemeDefinitions.ts"),
      `export default ${finalDokiDefinitions};`
    );

    // copy to out directory
    const themeOutputDirectory = "generatedThemes";
    const themePostfix = ".theme.json";
    dokiThemes.forEach((dokiTheme) => {
      const vsCodeTheme = dokiTheme.theme;
      fs.writeFileSync(
        path.resolve(
          repoDirectory,
          themeOutputDirectory,
          `${dokiTheme.definition.name}${themePostfix}`
        ),
        JSON.stringify(vsCodeTheme, null, 2)
      );
    });

    // write to package json
    const dokiDefinitions = dokiThemes.map((d) => d.definition);
    const packageJsonPath = path.resolve(repoDirectory, "package.json");
    const packageJson = readJson<any>(packageJsonPath);
    const stickerInstallCommands = dokiDefinitions
      .map((definition) =>
        getCommandNames(definition).map((command) => ({
          command,
          definition,
        }))
      )
      .reduce((accum, next) => accum.concat(next), []);

    const activationEvents = stickerInstallCommands.map(
      (command) => `onCommand:${command.command}`
    );

    const commands = stickerInstallCommands.map((commandAndDefinition) => ({
      command: commandAndDefinition.command,
      title: `Doki-Theme: Install ${commandAndDefinition.definition.name}'s${
        commandAndDefinition.command.endsWith("secondary") ? " Secondary" : ""
      } ${
        commandAndDefinition.command.indexOf('wallpaper') >=0 ? 'Wallpaper' : 'Sticker'
      }`,
    }));

    const sakurajimaMaiID = '0527c6fc-316a-4f80-9459-d92ced0e6492';
    const themes = dokiDefinitions.map((dokiDefinition) => ({
      id: dokiDefinition.id,
      label: `Doki Theme: ${getGroupName(dokiDefinition)} ${
        dokiDefinition.displayName
      }`,
      path: `./${themeOutputDirectory}/${dokiDefinition.name}${themePostfix}`,
      uiTheme: dokiDefinition.dark ? "vs-dark" : "vs",
    })).sort((a, b) => {
      if(a.id === sakurajimaMaiID) {
        return -1;
      } else if (b.id === sakurajimaMaiID) {
        return 1;
      } else {
        return a.label.localeCompare(b.label);
      }
    });

    packageJson.activationEvents = [
      ...packageJson.activationEvents.filter(
        (activationEvent: string) =>
          !activationEvent.startsWith("onCommand:doki-theme.theme")
      ),
      ...activationEvents,
    ];

    packageJson.contributes.commands = [
      ...packageJson.contributes.commands.filter(
        (command: { command: string }) =>
          !command.command.startsWith("doki-theme.theme")
      ),
      ...commands,
    ];
    packageJson.contributes.themes = themes;
    return new Promise<void>((resolve, reject) =>
      fs.writeFile(
        packageJsonPath,
        JSON.stringify(packageJson, null, 2),
        (err: any) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      )
    );
  })
  .then(() => {
    // UPDATE CHANGELOG
    const MarkItDown = require("markdown-it");
    const markdownConverter = new MarkItDown();

    const changelogPath = path.join(repoDirectory, "CHANGELOG.md");
    const changelogText = fs.readFileSync(changelogPath, "utf-8");

    const changelogHTML = markdownConverter.render(changelogText);

    fs.writeFileSync(
      path.resolve(repoDirectory, "src", "ChangelogHtml.ts"),
      `export default \`${changelogHTML}\`;`
    );
  })
  .then(() => {
    console.log("Theme Generation Complete!");
  });

function getCommandNames(dokiDefinition: MasterDokiThemeDefinition): string[] {
  return keys(dokiDefinition.stickers)
    .filter((type) => type !== "normal")
    .map((type) => {
      if (type === "default") {
        return [
          `doki-theme.theme.${dokiDefinition.name}`,
          `doki-theme.theme.wallpaper.${dokiDefinition.name}`
        ];
      }
      return [
        `doki-theme.theme.${dokiDefinition.name}.secondary`,
        `doki-theme.theme.wallpaper.${dokiDefinition.name}.secondary`,
      ];
    }).reduce((accum, next) => accum.concat(next), []);
}
