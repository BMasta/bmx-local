import * as commands from './commands';

import * as vscode from 'vscode';

/**
 * @param {vscode.ExtensionContext} context
 */
export function activate(context: vscode.ExtensionContext) {
	console.log('BMX activated');

    commands.registerCommands(context);
}

// This method is called when your extension is deactivated
export function deactivate() {}
