# Make Video

`make-video` 是一个可通过 `npx` 运行的通用 AI 视频制作 CLI，也保留为 Agent Skill。它把用户的视频需求转化为可执行的视频项目：生成 brief、口播稿、镜头规划、字幕，调用 FFmpeg 完成媒体探测、音频贴合、字幕烧录和基础渲染；如果本机存在 IndexTTS、HyperFrames/html-video 或 JianYing/剪映，则作为可选增强启用。

第一版以可配置 AI provider 负责脚本、规划和文本生成，支持 OpenAI、DeepSeek、GLM、MiniMax 和 Claude；FFmpeg 负责可落地的视频处理。IndexTTS、HyperFrames 和 JianYing 这类重型视频后端不随 npm 包安装，而是自动探测、可用则启用、不可用则明确降级。

## 快速开始

临时运行：

```bash
npx make-video --help
npx make-video doctor
npx make-video auto \
  --provider deepseek \
  --brief "做一个 90 秒 AI 工具演示短视频，竖屏，中文旁白，带字幕" \
  --out ./ai-demo
```

全局安装：

```bash
npm install -g make-video
make-video doctor --strict
```

全局安装时，包会自动检查 npm 全局命令目录是否在 `PATH` 中。如果不在，会尝试在用户已有 `PATH` 的可写目录中创建 `make-video` 命令 shim；如果无法自动创建，会在安装日志中打印需要加入 `PATH` 的目录。

需要 AI 规划或口播改写时，先设置对应 provider 的 API Key：

```bash
export OPENAI_API_KEY="sk-..."
npx make-video plan --brief "做一个 90 秒 AI 工具演示短视频" --out ./ai-demo
npx make-video script --input article.md --out narration.txt
```

基础媒体处理依赖本机安装 `ffmpeg` 和 `ffprobe`。可以用 `npx make-video doctor` 检查环境；发布或 CI 前可运行 `npx make-video doctor --strict`，必需后端缺失时会返回非零退出码。IndexTTS 缺失不会阻塞基础 CLI 使用。

## 系统依赖

`make-video` 是一个 Node.js CLI，但视频生产依赖本机工具链：

- Node.js `>=18.20`。
- `ffmpeg` 和 `ffprobe`，用于探测、转码、字幕烧录、音频贴合和混流。
- IndexTTS/IndexTTS2，可选，用于 `auto` 命令自动生成旁白；设置 `INDEXTTS_HOME` 指向包含 `indextts/cli_v2.py` 的 checkout。缺失时仍可生成脚本、字幕、项目规划、自动素材视频和无旁白 preview。
- AI provider API Key，仅在运行 `plan` 或 `script` 时需要。支持 `OPENAI_API_KEY`、`DEEPSEEK_API_KEY`、`GLM_API_KEY`、`MINIMAX_API_KEY`、`ANTHROPIC_API_KEY`。
- 素材 API Key，可选，用于自动下载 stock footage：`PEXELS_API_KEY`、`PIXABAY_API_KEY`。缺失时会写入人工 fallback 来源，不阻塞规划。
- HyperFrames/html-video，可选，用于动效标题、数据卡、callout 和转场。
- JianYing/剪映后端，可选，用于生成可编辑草稿。

环境检查：

```bash
make-video doctor
make-video doctor --strict
```

## Demo 视频

GitHub 和 npm 的 README 会过滤第三方播放器脚本，因此这里使用 GIF 动图做内嵌预览；点击动图可以打开对应 MP4 预览文件。原始完整视频体积较大，不随包发布。

### Demo 1

[![Demo 1 preview](demo/final-preview.gif)](demo/final-preview.mp4)

[打开 MP4 预览](demo/final-preview.mp4)

### Demo 2

[![Demo 2 preview](demo/final-2-preview.gif)](demo/final-2-preview.mp4)

[打开 MP4 预览](demo/final-2-preview.mp4)

## 一键生成视频

`make-video auto` 是推荐入口。它的目标是不要求用户提前准备视频素材，也不要求提前准备旁白音频：只要给一段完整视频需求，CLI 会先解析主题、时长、封面、素材目录、字幕和配音要求，再生成脚本和镜头规划，按主题去素材站搜索下载视频素材，融合本地图片/视频资源，生成 `render/base.mp4`、无标点字幕、IndexTTS 旁白、FFmpeg 预览成片和 JianYing 草稿脚本。

自动素材下载优先使用 Pexels / Pixabay 官方 API；`references/sourcing.md` 中列出的 Mixkit、Coverr、Videvo、爱给网等素材站会作为 fallback 资源写入 `footage_manifest.md`，方便人工补充或后续自动化扩展。

自动配音依赖本地 TTS 后端。配置 `INDEXTTS_HOME` 后，`auto` 会在没有现成音频时调用 IndexTTS/IndexTTS2 合成 `audio/voiceover.wav`，再把字幕和旁白一起渲染成 `exports/final.mp4`。未配置 TTS 时，CLI 会先产出口播稿、字幕、基础视频和无旁白 preview，不会要求你提前准备音频文件。

### 推荐用法：完整提示词直出视频

把完整需求写进一个 brief 文件，适合 5-10 分钟以上的视频：

```bash
cat > zhipu-brief.txt <<'EOF'
帮我使用 make-video 以及 jianying-editor skill 制作一个关于如下主题内容的视频，根据主题到网络上采集对应的视频资源然后剪辑，配音使用 index-tts 参考语音文件使用 ~/Downloads/Voices/新闻-铿锵.mp3，并给视频添加字幕和对应的动效。

主题：智谱市值万亿，凭什么？
时长：8分钟左右
视频资源来源：参照 make-video 中的素材来源网站获取真实场景的视频、~/Downloads/Source 中的图片资源也要融合进视频内容中。
配音：使用本地 index-tts 配合参考语音文件 ~/Downloads/Voices/新闻-铿锵.mp3，配音要一次生成不要拼接
字幕：添加动效字幕，字幕内容不要标点符号
首帧封面：HP01.png
视觉包装要求：标题动画、lower thirds、关键词/数据 callout、动态字幕、转场、避免静态文字块
内容：精炼总结提取视频文字内容

视频文字内容：
6000亿的时候，几乎所有人都觉得智谱太贵了，然而它涨到了万亿。
索罗斯曾经说：“金融市场的价格总是错的，但错误可以自我强化到一个相当长的阶段，甚至最终把自己变成对的。”
6月22日上午，端午假期后第一个交易日，智谱港股开盘即涨超13%，股价突破2380港元，总市值正式站上1万亿港元。上市不到半年，涨幅超过1900%。
EOF

export DEEPSEEK_API_KEY="你的 DeepSeek Key"
export PEXELS_API_KEY="你的 Pexels Key"
export INDEXTTS_HOME="/path/to/index-tts"

npx make-video auto \
  --provider deepseek \
  --model deepseek-chat \
  --brief ./zhipu-brief.txt \
  --ratio 16:9 \
  --source-dir ~/Downloads/Source \
  --voice ~/Downloads/Voices/新闻-铿锵.mp3 \
  --out ./zhipu-video
```

`auto` 会从 brief 中自动识别 `主题：...` 作为素材搜索词，从 `时长：8分钟左右` 推断约 480 秒，并在 `~/Downloads/Source` 中查找 `首帧封面：HP01.png`。字幕默认去掉标点，同时生成 `subtitles.srt` 和带淡入淡出样式的 `subtitles.ass`。

生成 JianYing 草稿脚本后可运行：

```bash
python ./zhipu-video/jianying/build_draft.py
```

### 参数化一键流程

```bash
export DEEPSEEK_API_KEY="你的 DeepSeek Key"
export PEXELS_API_KEY="你的 Pexels Key"
# 可选：export PIXABAY_API_KEY="你的 Pixabay Key"
# 可选：export INDEXTTS_HOME="/path/to/index-tts"
# 可选：export INDEXTTS_VOICE="/path/to/reference-voice.mp3"

npx make-video auto \
  --provider deepseek \
  --model deepseek-chat \
  --brief "做一个 90 秒 AI 工具演示短视频，竖屏，中文旁白，带字幕" \
  --duration 90 \
  --ratio 9:16 \
  --source-dir ~/Downloads/Source \
  --cover ~/Downloads/Source/HP01.png \
  --voice ~/Downloads/Voices/新闻-铿锵.mp3 \
  --out ./ai-demo
```

典型输出：

```text
ai-demo/
├── brief.md
├── script.md
├── shot_plan.md
├── subtitle_notes.md
├── production_notes.md
├── footage_manifest.md
├── audio/voiceover.wav
├── subtitles.srt
├── assets/footage/
├── render/base.mp4
├── exports/final.mp4
└── jianying/
    ├── storyboard.json
    └── build_draft.py
```

如果没有配置素材 API key，`auto` 不会中断整体规划，会在 `footage_manifest.md` 中记录可用素材站、搜索链接和版权检查提示。设置 `PEXELS_API_KEY` 或 `PIXABAY_API_KEY` 后重新运行即可自动下载素材。

如果提示词中写了 `主题：...`、`时长：...分钟`、`首帧封面：...`，`auto` 会优先使用这些结构化信息。默认会尝试融合 `~/Downloads/Source` 下的图片和视频；也可以用 `--source-dir` 指定其它目录。

### 只生成脚本和镜头规划

如果只想先做策划，可以设置任意支持的 provider 后运行。默认使用 OpenAI：

```bash
export OPENAI_API_KEY="sk-..."
npx make-video plan \
  --brief "做一个 90 秒 AI 工具演示短视频，竖屏，中文旁白，带字幕" \
  --out ./ai-demo
```

也可以切换到其他模型：

```bash
# DeepSeek
export DEEPSEEK_API_KEY="sk-..."
npx make-video plan --provider deepseek --model deepseek-chat \
  --brief "做一个 90 秒 AI 工具演示短视频，竖屏，中文旁白，带字幕" \
  --out ./ai-demo

# GLM / 智谱
export GLM_API_KEY="..."
npx make-video plan --provider glm --model glm-4-flash \
  --brief "做一个 90 秒 AI 工具演示短视频，竖屏，中文旁白，带字幕" \
  --out ./ai-demo

# MiniMax
export MINIMAX_API_KEY="..."
npx make-video plan --provider minimax --model MiniMax-Text-01 \
  --brief "做一个 90 秒 AI 工具演示短视频，竖屏，中文旁白，带字幕" \
  --out ./ai-demo

# Claude
export ANTHROPIC_API_KEY="sk-ant-..."
npx make-video plan --provider claude --model claude-3-5-haiku-latest \
  --brief "做一个 90 秒 AI 工具演示短视频，竖屏，中文旁白，带字幕" \
  --out ./ai-demo
```

### 只下载素材并生成基础视觉轨

如果已经有项目目录，也可以只根据主题下载素材并生成 `render/base.mp4`：

```bash
export PEXELS_API_KEY="你的 Pexels Key"
npx make-video source \
  --project ./ai-demo \
  --query "AI tools product demo" \
  --count 5 \
  --ratio 9:16 \
  --duration 90
```

## 适用场景

适合使用本 Skill 的任务包括：

- 制作短视频、产品演示、宣传片、解说视频或社交媒体剪辑。
- 将文章、报告、书面稿改写成适合视频播出的自然口播稿。
- 为已有视频添加字幕、旁白、动效标题、转场、数据卡或关键词高亮。
- 替换视频音频，并把 TTS 或旁白长度贴合原视频。
- 生成带字幕、配音、素材、音效和最终 MP4 的完整视频。
- 创建可继续编辑的 JianYing/剪映草稿。
- 在需要精致动效时接入 HyperFrames/html-video 渲染标题卡、字幕动效、callout 和转场。

不适合的任务包括纯文本写作、单张图片生成、泛泛的视频建议、只做资料研究但不产出媒体文件的请求。

## CLI 命令

- `make-video init <dir>`：创建视频项目目录，生成 `brief.md`、`assets/`、`audio/`、`render/`、`exports/`。
- `make-video plan --brief <text|file> --out <dir>`：调用 AI provider 生成 `brief.md`、`script.md`、`shot_plan.md`、`subtitle_notes.md` 和 `production_notes.md`。
- `make-video auto --brief <text|file> --out <dir>`：生成计划、按主题下载素材、融合本地图片/封面、自动尝试 TTS 配音、生成无标点字幕和 ASS 动效字幕，并导出有声最终 MP4；TTS 不可用但素材可用时会导出无旁白 preview，同时生成 JianYing 草稿脚本。
- `make-video script --input <file> --out narration.txt`：把文章、报告或书面稿改写成自然口播稿。
- `make-video source --project <dir> --query <text>`：从 Pexels/Pixabay 下载素材，生成 `footage_manifest.md` 和 `render/base.mp4`。
- `make-video subtitles --script narration.txt --duration <seconds> --out subtitles.srt`：根据口播稿和目标时长生成基础 SRT 字幕。
- `make-video mux --video base.mp4 --audio voice.wav --out final.mp4`：把旁白音频贴合视频时长并替换为唯一音轨。
- `make-video render --project <dir>`：基于项目目录执行基础 FFmpeg 渲染，支持字幕烧录和音频混流。
- `make-video probe <file>`：输出媒体文件的 `ffprobe` JSON 信息。
- `make-video doctor`：检查 FFmpeg、AI provider keys、IndexTTS 和可选视频后端；`--strict` 只会在 FFmpeg/ffprobe 等必需后端缺失时失败。

## 环境变量

- `OPENAI_API_KEY`：OpenAI provider 使用。
- `DEEPSEEK_API_KEY`：DeepSeek provider 使用。
- `GLM_API_KEY`：GLM / 智谱 provider 使用。
- `MINIMAX_API_KEY`：MiniMax provider 使用。
- `ANTHROPIC_API_KEY`：Claude provider 使用。
- `MAKE_VIDEO_AI_PROVIDER`：可选，设置默认 provider，例如 `deepseek`、`glm`、`minimax`、`claude`。
- `MAKE_VIDEO_AI_MODEL`：可选，设置默认模型。
- `MAKE_VIDEO_AI_BASE_URL`：可选，覆盖 OpenAI-compatible provider 的 base URL。
- `PEXELS_API_KEY`：可选，Pexels Videos API 自动素材下载。
- `PIXABAY_API_KEY`：可选，Pixabay Videos API 自动素材下载。
- `INDEXTTS_HOME`：可选，指向 IndexTTS/IndexTTS2 checkout，目录内需要存在 `indextts/cli_v2.py`。
- `INDEXTTS_VOICE` 或 `MAKE_VIDEO_TTS_VOICE`：可选，IndexTTS 自动配音使用的参考音色文件；也可在 `auto` 中传 `--voice <file>`。
- `INDEXTTS_DEVICE`：可选，IndexTTS 设备，默认 `mps`，失败时 `auto` 会尝试退回 `cpu`。
- `HYPERFRAMES_HOME`：可选，指向已构建的 HyperFrames/html-video checkout。
- `JIANYING_HOME` 或 `JIANYING_EDITOR_HOME`：可选，指向 JianYing/剪映自动化后端。

## 核心工作流

Skill 的主流程定义在 `SKILL.md` 和 `references/production-workflows.md` 中：

1. 明确生产约束：平台、比例、时长、语言、语气、素材、版权、配音、字幕和导出格式。
2. 判断制作路线：本地渲染、HyperFrames/html-video 动效层、JianYing/剪映草稿或混合流程。
3. 建立独立项目目录，按需生成 `brief.md`、`script.md`、`narration.txt`、`shot_plan.md`、`sources.md`、`footage_manifest.md` 等生产文件。
4. 优先整理用户提供的素材，再按版权要求补充网页素材、官方素材、截图、生成视觉、音乐、音效和声音参考。
5. 制作视觉轨、音频轨、字幕、动效、叠加层、转场和版式。
6. 导出 `final.mp4`、字幕文件、透明 overlay、HyperFrames 渲染资产或剪映草稿。
7. 使用 `ffprobe` 和关键帧截图做最终质量检查。

## 代码架构

```text
make-video/
├── package.json
├── bin/
│   └── make-video.js
├── src/
│   ├── cli.js
│   ├── ai/
│   ├── backends/
│   ├── commands/
│   ├── media/
│   ├── utils/
│   └── workflow/
├── SKILL.md
├── manifest.json
├── agents/
│   ├── interface.yaml
│   └── openai.yaml
├── evals/
│   ├── semantic_config.json
│   └── trigger_cases.json
├── references/
│   ├── production-workflows.md
│   ├── spoken-scriptwriting.md
│   ├── sourcing.md
│   ├── social-reference-patterns.md
│   ├── hyperframes-motion.md
│   ├── captions-audio.md
│   ├── jianying-integration.md
│   ├── qc-and-fallbacks.md
│   ├── indextts2-notes.md
│   └── local-backends.md
└── scripts/
    └── mux_tts_voiceover.py
```

### 顶层配置

`package.json` 定义 npm 包名、`npx make-video` 的 bin 入口、运行依赖、发布白名单和 smoke test。

`bin/make-video.js` 是可执行入口，负责启动 `src/cli.js`。

`SKILL.md` 是 Skill 的主入口，定义触发边界、核心流程、参考文档索引、质量规则和最终响应契约。

`manifest.json` 描述项目元信息，包括名称、版本、维护者、生产状态、目标平台和组件构成。

### CLI 实现层

`src/cli.js` 注册所有命令，并把参数交给 `src/commands/` 下的具体实现。

`src/ai/` 封装多 provider AI 调用，用内置 `references/` 作为上下文生成视频规划和口播稿。

`src/media/ffmpeg.js` 封装 `ffmpeg` 和 `ffprobe`，提供媒体探测、音频贴合、音轨替换、字幕烧录和基础转码能力。

`src/media/subtitles.js` 把口播文本按中英文可读长度切分为 SRT 字幕。

`src/backends/detect.js` 探测必需后端 FFmpeg/ffprobe，以及 IndexTTS、HyperFrames/html-video、JianYing/剪映等可选后端，并给出降级提示。

`src/workflow/` 负责项目目录模板和内置知识库加载。

### Agent 适配层

`agents/interface.yaml` 定义通用 Agent Skill 接口，包括中文展示名称、简短说明、默认提示词、兼容目标和执行策略。

`agents/openai.yaml` 提供面向 OpenAI 适配目标的轻量接口描述。

### 触发与评测

`evals/semantic_config.json` 定义语义触发信号，包含正向概念、排除概念、输入类型和预期产物。

`evals/trigger_cases.json` 提供应该触发、不应该触发以及相邻但不确定的样例，用于验证 Skill 路由是否准确。

### 制作知识库

`references/` 是项目的核心知识库，每个文件负责一个制作维度：

- `production-workflows.md`：项目目录结构、从 brief 到成片的完整制作流程，以及长视频、社交短视频、分层修订等模式。
- `spoken-scriptwriting.md`：把文章、报告、提纲改写成自然口播稿的规则。
- `sourcing.md`：素材来源策略、版权记录要求和常用免费/付费素材站索引。
- `social-reference-patterns.md`：短视频参考拆解、节奏复刻和社交平台常见结构。
- `hyperframes-motion.md`：接入 HyperFrames/html-video 生成动效标题、数据卡、callout、字幕动画和转场。
- `captions-audio.md`：字幕拆分、TTS、IndexTTS、音频修复、配音贴合和混流规则。
- `jianying-integration.md`：剪映/JianYing 草稿生成、导出限制和混合流程注意事项。
- `qc-and-fallbacks.md`：视觉检查、透明 overlay 兜底、最终验证和降级规则。
- `indextts2-notes.md`：IndexTTS2 的安装、运行和排错经验。
- `local-backends.md`：本地后端路径、环境变量和依赖说明。

### 辅助脚本

`scripts/mux_tts_voiceover.py` 用于把一段 TTS 或旁白音频贴合到已有视频长度，并将其作为唯一音轨封装进输出视频。

它会：

- 使用 `ffprobe` 读取视频和音频时长。
- 在时长不匹配时生成 FFmpeg `atempo` 链。
- 输出贴合后 WAV 文件。
- 使用复制视频流和 AAC 音频编码生成最终视频。
- 打印最终文件的 `ffprobe` JSON 元数据。

示例：

```bash
python3 scripts/mux_tts_voiceover.py \
  --video /abs/path/base_video.mp4 \
  --audio /abs/path/voiceover.wav \
  --output /abs/path/final_video.mp4
```

## 典型产物

一次视频制作任务可能产生以下文件：

- `brief.md`：需求、平台、比例、时长、风格和交付格式。
- `narration.txt` 或 `script.md`：口播稿或视频脚本。
- `shot_plan.md`：逐场景镜头规划。
- `sources.md`：事实来源和参考资料。
- `footage_manifest.md`：素材来源、版权说明和镜头映射。
- `audio/`：旁白、音乐、音效和最终混音。
- `subtitles.srt` 或 `subtitles.ass`：字幕文件。
- `render/overlay.mov`：透明字幕、标题、callout 或动效叠加层。
- `render/hyperframes_<slug>.mp4`：HyperFrames/html-video 渲染片段。
- `jianying_draft/`：剪映可编辑草稿。
- `final.mp4`：最终交付视频。

## 后端集成

本 Skill 会根据任务选择不同后端：

- FFmpeg：基础剪辑、转码、字幕烧录、音频替换、混流和最终导出。
- IndexTTS/IndexTTS2：可选增强，用于中文口播、TTS、参考音色合成和配音修复；`auto` 会在没有音频时自动尝试合成旁白。缺失时仍会生成脚本、字幕、素材基础视频和无旁白 preview。
- HyperFrames/html-video：可选增强，用于 HTML/CSS/GSAP 风格动效、标题卡、数据卡、关键词字幕和转场；缺失时降级到 FFmpeg 字幕滤镜或程序化 overlay。
- JianYing/剪映：可选增强，需要可编辑草稿、剪映原生字幕、效果、转场或人工继续精修时使用；缺失时仍可导出本地 MP4。
- InfiniteTalk：当可见人物口型需要与新音频同步时使用。

## 质量控制

Skill 要求最终交付前进行媒体验证：

- 用 `ffprobe` 检查时长、分辨率、编码、音频流和文件元数据。
- 抽取开头、中段、结尾关键帧检查画面。
- 检查字幕是否可读、是否越界、是否挡住人脸、UI 或产品细节。
- 检查音频是否存在、清晰、未叠加重复旁白。
- 如果后端不可用或效果降级，需要明确标注为 preview-only、partial 或 local-render-only。

## 扩展方式

新增能力时优先放在对应层级：

- 新的视频制作规则放入 `references/`。
- 新的触发样例放入 `evals/trigger_cases.json`。
- 新的语义路由权重放入 `evals/semantic_config.json`。
- 新的 Agent 适配配置放入 `agents/`。
- 可复用的本地工具脚本放入 `scripts/`。

项目特定的视频工程文件不应该写进本 Skill 目录，应放在每次视频任务自己的项目文件夹中，避免污染通用 Skill。

## 发布检查

维护者发布 npm 包前建议运行：

```bash
npm run smoke
npm pack --dry-run
npm publish
```

`package.json` 使用 `files` 白名单发布 CLI 源码、内置 references、Agent Skill 入口和文档，不发布 `node_modules`、本地视频工程、媒体素材或临时渲染产物。
