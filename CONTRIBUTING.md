Contributing
---

# Outline

- [Build Process](#build-process-high-level-overview)
- [Getting Started](#getting-started)
- [Editing Themes](#editing-themes)
- [Creating New Themes](#creating-new-themes)

# Build Process High level overview

I won't go into the minor details of the theme building process, however I will talk about the high level details of
what is accomplished.

All themes have a base template that they inherit from. Themes have the ability to choose their inherited parent. Each
child has the ability to override any attributes defined by the parent. This mitigates any one-off issues for themes
that are captured by the global shared style.

# Getting Started

If this is your first time working on a VSCode extension, then it's a good idea to complete
the [hello world project](https://code.visualstudio.com/api/get-started/your-first-extension). This should give you a
good introduction as what to expect, when developing for this plugin.

You'll also want to make sure that you've got all the software installed for the "Hello World" project before continuing
to the other sections.

# Editing Themes

## Editing Themes Required Software

- Yarn package manager
- Node 14

## Setup

**Set up Yarn Globals**

I heavily use Node/Typescript to build all of my themes, and I have a fair amount of global tools installed.

Just run

```shell
yarn global add typescript ts-node nodemon
```

Note: if you already have these globally installed please make sure you are up to date!

```shell
yarn global upgrade typescript ts-node
```

**Get the Master Themes**

Since this theme suite expands across multiple platforms, in order to maintain consistency of the look and feel across
platforms, there is a [central theme definition repository](https://github.com/doki-theme/doki-master-theme)

This repository needs to be cloned as a directory called `masterThemes`. If you are running Linux/MacOS, you can
run `getMasterThemes.sh` located at the root of this repository. This script does exactly what is required, if you are
on Windows, have you considered Linux? Just kidding (mostly), you'll need to run this command

```shell
git clone https://github.com/doki-theme/doki-master-theme.git masterThemes
```

Your directory structure should have at least these directories, (there will probably be more, but these are the
important ones to know).

```
your-workspace/
├─ doki-theme-vscode/
│  ├─ masterThemes/
│  ├─ buildSrc/
```

Inside the `masterThemes` directory, you'll want to make sure all the dependencies are available to the build scripts.
To accomplish this, just run this command in the `masterThemes` directory.

```shell
yarn
```

### Set up build source

Navigate to the root of the `buildSource` directory and run the following command.

```shell
yarn
```

This will install all the required dependencies to run the theme build process.

You should be good to edit and add themes after that!

## Editing Themes Setup

### Running Plugin

VSCode should be set up to launch the `watch` command when you run it through the editor (like in
the [getting started example project](#getting-started)).

However, if it doesn't do that, you can always open a terminal at the root of this repository, and run

```shell
yarn watch
```

After that, you are free to make changes to the Typescript code and you can re-run the VSCode instance to pick up the
changes automagically. However, you will not see changes if you make changes to the theme build process,
see [next section for more details](#theme-editing-process)

## Theme Editing Process

I have too many themes to maintain manually, so theme creation/maintenance is automated and shared common parts to
reduce overhead.

The standardized approach used by all the plugins supporting the Doki Theme suite, is that there is a `buildSrc`
directory.

Inside the `buildSrc` directory, there will be 2 directories:

- `src` - holds the code that builds the themes.
- `assets` - defines the platform specific assets needed to build the themes. This directory normally contains two child
  directories.
    - `themes` - holds the [application definitions](#application-specific-templates)
    - `templates` - if not empty, normally contains various text files that can be evaluated to replace variables with
      values. Some cases, they also contain templates for evaluating things such as look and feel, colors, and other
      things.

### VSCode Themes specifics

There are one important piece that composes a theme:

- `theme.json` - which defines the look and feel of the editor as well as the syntax coloring of the code.

See [theming](https://code.visualstudio.com/api/extension-capabilities/theming)
, [color theming](https://code.visualstudio.com/api/extension-guides/color-theme),
and [the theme color mappings](https://code.visualstudio.com/api/references/theme-color) for more details!

When you are running your instance of VSCode, to see your changes to the theme, you are working on,

### Submitting PR

This is an [example of editing existing themes](https://github.com/doki-theme/doki-theme-vscode/pull/69/files).

# Creating New Themes

**IMPORTANT**! Do _not_ create brand new Doki-Themes using Visual Studio code. New themes should be created from the
original JetBrains plugin which uses all the colors defined. There is also Doki Theme creation assistance provided by
the IDE as well.

Please follow
the [theme creation contributions in the JetBrains Plugin repository](https://github.com/doki-theme/doki-theme-jetbrains/blob/master/CONTRIBUTING.md#creating-new-themes)
for more details on how to build new themes.

## Creating Themes Required Software

- [Editing Themes required software](#editing-themes-required-software)

## Setup

- Follow the [editing themes setup](#editing-themes-setup)
- Set up the [doki-build-source](https://github.com/doki-theme/doki-build-source)


## Theme Creation Process

This part is mostly automated, for the most part. There is only one script you'll need to run.

### Application specific templates

Once you have a new master theme definitions merged into the default branch, it's now time to generate the application
specific templates, which allow us to control individual theme specific settings.

You'll want to edit the function used by `buildApplicationTemplate`
and `appName` [defined here](https://github.com/doki-theme/doki-master-theme/blob/596bbe7b258c65e485257a14887ee9b4e0e8b659/buildSrc/AppThemeTemplateGenerator.ts#L79)
in your `masterThemes` directory.

In the case of this plugin the `buildApplicationsTemplate` should use the `vsCodeTemplate` and `appName` should
be `vsCode`.

Once this is done, we can now run the `generateAssets` script. Which will walk the master theme definitions and create
blank assets in the expected folder structure, inside various directories in the `<workspace-root>/doki-theme-assets/`
directory.

```shell
yarn generateAssets
```

After that, we need run the `generateTemplates` script. Which will walk the master theme definitions and create the new
templates in the `<repo-root>/buildSrc/assets/themes` directory (and update existing ones).

```shell
yarn generateTemplates
```

If you added a new anime, you'll need to add
a [new group mapping](https://github.com/doki-theme/doki-build-source/blob/ee91f334588714473486a9a4b6092e10f0ce4cc1/src/GroupToNameMapping.ts#L3)
to the Doki Build source. Please see the [handy development setup for more details on what to do](https://github.com/doki-theme/doki-build-source#doki-theme-build-source).
You'll need to link `doki-build-source` in this plugin's build source.

For clarity, you'll have to run this command in this directory `<your-workspace>/doki-theme-vscode/buildSrc`:

```shell
yarn link doki-build-source
```

The code defined in the `buildSrc/src` directory is part of the common Doki Theme construction suite. 
All other plugins work the same way, just some details change for each plugin, looking at you [doki-theme-web](https://github.com/doki-theme/doki-theme-web).
This group of code exposes a `buildThemes` node script. 

This script does all the annoying tedious stuff such as:

- Putting the theme definition and command activation in the `package.json`
- Evaluating the `theme.json` from the templates. See [VSCode Specifics](#vscode-themes-specifics) for more details.
- Updating the `Show ChangeLog` content in the plugin.

Here are various examples of options currently available:

- [Look and feel composition](https://github.com/doki-theme/doki-theme-vscode/blob/9bdc97a965bc6650a873fa9dbd4575de159bb9bd/buildSrc/assets/themes/quintuplets/miku/dark/miku.dark.vsCode.definition.json#L4)
- [Color override](https://github.com/doki-theme/doki-theme-vscode/blob/9bdc97a965bc6650a873fa9dbd4575de159bb9bd/buildSrc/assets/themes/killLaKill/satsuki/satsuki.vsCode.definition.json#L11)

Once you have completed all of those steps, you've got all the things available to import your new theme!

[Here is an example pull request that captures all the artifacts from the development process of imported themes](https://github.com/doki-theme/doki-theme-vscode/pull/82/files).
