// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const provider = new DemoRenameProvider();
  vscode.languages.registerRenameProvider({pattern: '**/*.php'}, provider);
}

// This method is called when your extension is deactivated
export function deactivate() {}

class DemoRenameProvider implements vscode.RenameProvider {
  provideRenameEdits(document: vscode.TextDocument, position: vscode.Position, newName: string,
      token: vscode.CancellationToken): vscode.ProviderResult<vscode.WorkspaceEdit> {
    const word = document.getWordRangeAtPosition(position, /\['.*?'\]/);
    if (word) {
      vscode.window.showInformationMessage('Renaming to ' + newName);
      const edit = new vscode.WorkspaceEdit();
      edit.replace(document.uri, word, newName);
      return edit;
    }
    return null;
  }
  prepareRename?(document: vscode.TextDocument, position: vscode.Position,
      token: vscode.CancellationToken): vscode.ProviderResult<vscode.Range | { range: vscode.Range; placeholder: string }> {
    const word = document.getWordRangeAtPosition(position, /\['.*?'\]/);
    if (word) {
      return {range:word, placeholder: document.getText(word)};
    }
    throw new Error('You cannot rename this element.');
  }

}