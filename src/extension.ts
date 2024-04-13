import * as commands from './commands';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('BMX activated');

    commands.registerCommands(context);
}

export function deactivate() {}
