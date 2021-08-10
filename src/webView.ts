import * as vscode from "vscode";

export default class ProjectDetailsPanel {
  public static readonly viewType = "projectDetails";

  public static show(extensionUri: vscode.Uri, project: string) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    const panel = vscode.window.createWebviewPanel(
      ProjectDetailsPanel.viewType,
      "Project Details",
      column || vscode.ViewColumn.One
    );

    panel.webview.html = this._getHtmlForWebview(
      panel.webview,
      extensionUri,
      project
    );
  }

  private static _getHtmlForWebview(
    webview: vscode.Webview,
    extensionUri: vscode.Uri,
    project: string
  ) {
    // Get resource paths
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(extensionUri, "media", "styles.css")
    );
    const codiconsUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        extensionUri,
        "node_modules",
        "@vscode/codicons",
        "dist",
        "codicon.css"
      )
    );

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
					Use a content security policy to only allow loading specific resources in the webview
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; font-src ${
          webview.cspSource
        }; style-src ${webview.cspSource};">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>${JSON.parse(project).organizationName}</title>

				<link href="${styleUri}" rel="stylesheet" />
				<link href="${codiconsUri}" rel="stylesheet" />
			</head>
			<body>
				<h1>${JSON.parse(project)?.name}</h1>
				<div id="icons">
					<code>${project}</code>
				</div>
			</body>
			</html>`;
  }
}
