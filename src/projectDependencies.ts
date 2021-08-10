import * as vscode from "vscode";
import * as path from "path";
import { ProjectsGroupsModel, ResponseList } from "@crowdin/crowdin-api-client";

export class DepNodeProvider implements vscode.TreeDataProvider<Dependency> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    Dependency | undefined | void
  > = new vscode.EventEmitter<Dependency | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<
    Dependency | undefined | void
  > = this._onDidChangeTreeData.event;

  constructor(
    private projects: ResponseList<
      ProjectsGroupsModel.Project | ProjectsGroupsModel.ProjectSettings
    >
  ) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: Dependency): vscode.TreeItem {
    return element;
  }

  getChildren() {
    if (!this.projects) {
      vscode.window.showInformationMessage("No dependency in empty workspace");
      return Promise.resolve([]);
    }

    return Promise.resolve(
      this.projects.data.map((el: any, index: number) => {
        return new Dependency(
          el.data.name,
          `${index + 1}`,
          vscode.TreeItemCollapsibleState.None,
          {
            command: "projectDetails.show",
            title: "",
            arguments: [JSON.stringify(el.data)],
          }
        );
      })
    );
  }
}

export class Dependency extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    private readonly version: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState);

    this.tooltip = `${this.label}-${this.version}`;
  }

  iconPath = {
    light: path.join(
      __filename,
      "..",
      "..",
      "resources",
      "light",
      "dependency.svg"
    ),
    dark: path.join(
      __filename,
      "..",
      "..",
      "resources",
      "dark",
      "dependency.svg"
    ),
  };

  contextValue = "dependency";
}
