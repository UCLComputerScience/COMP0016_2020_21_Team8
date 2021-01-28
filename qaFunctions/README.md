**Prerequisite**
- The Azure Functions Core Tools version 3.x.

- Python versions that are supported by Azure Functions

- Visual Studio Code on one of the supported platforms.

- The Python extension for Visual Studio Code.

- The Azure Functions extension for Visual Studio Code.

**Deploy it to localhost**
Press F5 to start the function app project. Output from Core Tools is displayed in the Terminal panel.

If you haven't already installed Azure Functions Core Tools, select Install at the prompt. When the Core Tools are installed, your app starts in the Terminal panel. You can see the URL endpoint of your HTTP-triggered function running locally.


With Core Tools running, navigate to the following URL to execute a GET request, which includes ?name=Functions query string.

http://localhost:7071/api/qaFunction?query="..."

A response is returned.