import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  // There are two rename providers
  // the first one targets array indexes like ['something']
  const provider = new DemoRenameProvider();
  vscode.languages.registerRenameProvider({pattern: '**/*.php'}, provider);
  // the second one targets function names
  const otherProvider = new OtherRenameProvider();
  vscode.languages.registerRenameProvider({pattern: '**/*.php'}, otherProvider);
  // if the "otherProvider" does not implement prepareRename() it breaks the first provider.
  // To test create the following file and try to rename the ['something'] part
  /*

  <?php

  function hello() {
      $a['something'] = 'hello';
  }

  */
}

export function deactivate() {}

class DemoRenameProvider implements vscode.RenameProvider {
  provideRenameEdits(document: vscode.TextDocument, position: vscode.Position, newName: string,
      token: vscode.CancellationToken): vscode.ProviderResult<vscode.WorkspaceEdit> {
    vscode.window.showInformationMessage('Executing provideRenameEdits with '+newName);
    const word = document.getWordRangeAtPosition(position, /\['.*?'\]/);
    if (word) {
      const edit = new vscode.WorkspaceEdit();
      edit.replace(document.uri, word, newName);
      return edit;
    }
    return null;
  }
  prepareRename?(document: vscode.TextDocument, position: vscode.Position,
      token: vscode.CancellationToken): vscode.ProviderResult<vscode.Range | { range: vscode.Range; placeholder: string }> {
    vscode.window.showInformationMessage('Prepare rename is executed.');
    const word = document.getWordRangeAtPosition(position, /\['.*?'\]/);
    if (word) {
      return {range:word, placeholder: document.getText(word)};
    }
    throw new Error('You cannot rename this element.');
  }
}

class OtherRenameProvider implements vscode.RenameProvider {
  protected validRange(document: vscode.TextDocument, position: vscode.Position): vscode.Range|null {
    const wordRange = document.getWordRangeAtPosition(position);
    const word = wordRange ? document.getText(wordRange) : '';
    const funcMatch = document.getWordRangeAtPosition(position, /function +\w+\s*\(/);
    return (wordRange && word.length && word !== 'function' && funcMatch) ? wordRange : null;
  }
  provideRenameEdits(document: vscode.TextDocument, position: vscode.Position, newName: string,
      token: vscode.CancellationToken): vscode.ProviderResult<vscode.WorkspaceEdit> {
    vscode.window.showInformationMessage('OtherProvider: Executing provideRenameEdits with '+newName);
    const range = this.validRange(document, position);
    if (range) {
      vscode.window.showInformationMessage('OtherProvider: Renaming to ' + newName);
      const edit = new vscode.WorkspaceEdit();
      edit.replace(document.uri, range, newName);
      return edit;
    }
    return null;
  }
  // prepareRename?(document: vscode.TextDocument, position: vscode.Position,
  //     token: vscode.CancellationToken): vscode.ProviderResult<vscode.Range | { range: vscode.Range; placeholder: string }> {
  //   vscode.window.showInformationMessage('OtherProvider: Prepare rename is executed.');
  //   const range = this.validRange(document, position);
  //   if (range) {
  //     return range;
  //   }
  //   throw new Error('You cannot rename this element.');
  // }
}