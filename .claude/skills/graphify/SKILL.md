---
name: graphify
description: Build or update the graphify knowledge graph for this project, then summarize the codebase structure from the graph report
---

Run the following command to build/update the knowledge graph:

```
graphify build .
```

If `graphify` is not on PATH, use the full path:
```
C:/Users/rayya/AppData/Local/Packages/PythonSoftwareFoundation.Python.3.13_qbz5n2kfra8p0/LocalCache/local-packages/Python313/Scripts/graphify.exe build .
```

After the build completes:
1. Read `graphify-out/GRAPH_REPORT.md` and summarize the god nodes, communities, and key architectural patterns found
2. If `graphify-out/wiki/index.md` exists, read and summarize the wiki index
3. Report how many files were indexed and any notable findings
