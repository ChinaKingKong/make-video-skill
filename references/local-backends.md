# Local Backends

Prefer these local checkouts:

- `INDEXTTS_HOME=/Users/lizhigang/Library/index-tts`
- `HTML_VIDEO_HOME=/Users/lizhigang/Documents/Works/Agents/Handle/html-video`
- `INFINITETALK_HOME` only when an InfiniteTalk source checkout or CUDA host mount is actually available

Use them before rebuilding or recloning model/tool repositories inside a project workspace.

## Environment

For shell sessions that need stable paths:

```bash
export INDEXTTS_HOME=/Users/lizhigang/Library/index-tts
export HTML_VIDEO_HOME=/Users/lizhigang/Documents/Works/Agents/Handle/html-video
```

`make-video` should treat project folders under `/Users/lizhigang/Documents/Works/Agents/Video` as outputs/workspaces, not as long-lived model checkouts.

Use `HTML_VIDEO_HOME` for HyperFrames/html-video motion renders, but keep per-video outputs in the current production project folder.
