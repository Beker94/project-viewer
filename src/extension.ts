import * as vscode from "vscode";
import ProjectDetailsPanel from "./webView";
const fs = require("fs");
import { DepNodeProvider } from "./projectDependencies";

function handleResult<T>(
  resolve: (result: T) => void,
  reject: (error: Error) => void,
  error: Error | null | undefined,
  result: T
): void {
  if (error) {
    reject(error);
  } else {
    resolve(result);
  }
}

function readFile(path: string): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    fs.readFile(path, (error: any, buffer: any) =>
      handleResult(resolve, reject, error, buffer)
    );
  });
}

function startWatchingWorkspace(): void {
  if (!vscode.workspace.workspaceFolders) {
    return;
  }

  vscode.workspace.workspaceFolders.map((workspaceFolder) => {
    const pattern = new vscode.RelativePattern(
      workspaceFolder,
      "**/crowdin.json"
    );

    vscode.workspace.findFiles(pattern).then((files) => {
      const getData = files.map((file) => {
        return readFile(file.path);
      });
      Promise.all(getData).then((el) => {
        const allData = el.map((data) => JSON.parse(data.toString()));
        const projectDependenciesProvider = new DepNodeProvider(allData);

        vscode.window.registerTreeDataProvider(
          "projectDependencies",
          projectDependenciesProvider
        );
      });
    });
  });
}

export function activate(context: vscode.ExtensionContext) {
  startWatchingWorkspace();

  context.subscriptions.push(
    vscode.commands.registerCommand("projectDetails.show", (project) => {
      ProjectDetailsPanel.show(context.extensionUri, project);
    })
  );
}

export function deactivate() {}
