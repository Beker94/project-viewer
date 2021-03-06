import * as vscode from "vscode";
import ProjectDetailsPanel from "./webView";
const fs = require("fs");
import { DepNodeProvider } from "./projectDependencies";
import crowdin, { Credentials } from "@crowdin/crowdin-api-client";

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
      if (!files.length) {
        vscode.window.showErrorMessage("No crowdin.json file");
      }

      readFile(files[0].path).then((el) => {
        const project: Credentials = JSON.parse(el.toString());
        const { projectsGroupsApi } = new crowdin(project);

        projectsGroupsApi
          .listProjects()
          .then((projects) => {
            const projectDependenciesProvider = new DepNodeProvider(projects);

            vscode.window.registerTreeDataProvider(
              "projectDependencies",
              projectDependenciesProvider
            );
          })
          .catch(({ error }) => {
            vscode.window.showErrorMessage(error.message);
          });
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
