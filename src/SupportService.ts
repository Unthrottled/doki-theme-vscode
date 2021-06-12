import * as vscode from 'vscode';
import { getWebviewIcon, buildWebviewHtml } from "./ChangelogService";
import { workbenchDirectory } from './ENV';

export function showStickerInstallationSupportWindow(context: vscode.ExtensionContext) {
    const verbs = {
        title: 'Installation',
        action: 'installing',
        singularAction: 'add',
        vscodeAction: 'to',
        commandAction: 'installation'

    };
    showStickerHelp(context, verbs);
}

export function showStickerRemovalSupportWindow(context: vscode.ExtensionContext) {
    const verbs = {
        title: 'Removal',
        action: 'removing',
        singularAction: 'remove',
        vscodeAction: 'from',
        commandAction: 'removal'

    };
    showStickerHelp(context, verbs);
}

function showStickerHelp(context: vscode.ExtensionContext, verbs: any) {
    const welcomPanel = vscode.window.createWebviewPanel('dokiStickerHelp', 'Doki Sticker Help', vscode.ViewColumn.Active, {});
    welcomPanel.iconPath = getWebviewIcon(context);
    welcomPanel.webview.html = buildWebviewHtml(`
            <h2>Sticker ${verbs.title} Help</h2>
            <div>
                <p>
                It looks like you are having issues ${verbs.action}
                stickers. No worries, friend, I am here to help.
                </p>
                <p>
                I need access to <strong>${workbenchDirectory}</strong>
                so I can ${verbs.singularAction} stickers ${verbs.vscodeAction} VS Code's css.
                </p>
                <h2>Linux/MacOS</h2>
                <p>If you are running Linux or MacOS you can help me by running this command:</p>
                <code>sudo chown -R $(whoami) ${workbenchDirectory}</code>
                <p>After you have given yourself permission to write that directory, feel free to run the sticker ${verbs.commandAction} command again.</p>
                <p>If you have VS Code installed via <code>snap</code> please <a href="https://github.com/doki-theme/doki-theme-vscode/issues/34#issuecomment-730028177">see this workaround</a></p>


                <h2>Windows Subsystem for Linux (WSL)</h2>
                <p>Looks like I was unable to correctly find and modify your Windows 10 VSCode CSS, sorry friend!</p>
                <p>To get around this issue you can:</p>
                <ol>
                    <li>Close your WSL remote connection <code>File > Close Remote Connection</code></li>
                    <li>Run Previous Sticker installation command.</li>
                </ol>
                <p>After that you should be able to use the WSL remote connection and have stickers!</p>
                <p><a href="https://github.com/doki-theme/doki-theme-vscode/issues/32">Please see this issue for more details.</a></p>
                            
                <h2>Windows</h2>
                <p>You can run VS Code as an administrator so I can write to <strong>${workbenchDirectory}</strong>.</p>
                <p>After that you do not need to run as admin. 
                You <strong>only</strong> need to run as admin if you want to either change or remove stickers.
                <div>
                <h2>Need More help?</h2>
                <p>
                    Feel free to submit an <a href="https://github.com/cyclic-reference/doki-theme-vscode">issue on github</a>
                   <br/> or <p><a href="https://gitter.im/doki-theme-vscode/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge" rel="nofollow"><img src="https://camo.githubusercontent.com/537aa03d68a16139ee3ee03e48fe1a463739b5de/68747470733a2f2f6261646765732e6769747465722e696d2f646f6b692d7468656d652d6a6574627261696e732f636f6d6d756e6974792e737667" alt="Gitter" data-canonical-src="https://badges.gitter.im/doki-theme-vscode/community.svg" style="max-width:100%;"></a></p>
                </div>
            </div>
            `, context, welcomPanel);
}
