# Make Video

`make-video` 是一个可通过 `npx` 运行的通用 AI 视频制作 CLI，也保留为 Agent Skill。它把用户的视频需求转化为可执行的视频项目：生成 brief、口播稿、镜头规划、字幕，调用 FFmpeg 完成媒体探测、音频贴合、字幕烧录和基础渲染，并接入必需的 IndexTTS 旁白后端；如果本机存在 HyperFrames/html-video 或 JianYing/剪映，则作为可选增强启用。

第一版以 OpenAI 负责脚本、规划和文本生成，以 FFmpeg 负责可落地的视频处理，以 IndexTTS 负责生产级旁白。HyperFrames 和 JianYing 这类重型视频后端不随 npm 包安装，而是自动探测、可用则启用、不可用则明确降级。

## 快速开始

临时运行：

```bash
npx make-video --help
npx make-video doctor
npx make-video init ./my-video --goal "做一个 60 秒产品介绍视频" --ratio 9:16
```

全局安装：

```bash
npm install -g make-video
make-video doctor --strict
```

需要 AI 规划或口播改写时，先设置 OpenAI Key：

```bash
export OPENAI_API_KEY="sk-..."
npx make-video plan --brief "做一个 90 秒 AI 工具演示短视频" --out ./ai-demo
npx make-video script --input article.md --out narration.txt
```

基础媒体处理依赖本机安装 `ffmpeg`、`ffprobe` 和 IndexTTS。可以用 `npx make-video doctor` 检查环境；发布或 CI 前可运行 `npx make-video doctor --strict`，必需后端缺失时会返回非零退出码。

## 系统依赖

`make-video` 是一个 Node.js CLI，但视频生产依赖本机工具链：

- Node.js `>=18.20`。
- `ffmpeg` 和 `ffprobe`，用于探测、转码、字幕烧录、音频贴合和混流。
- IndexTTS/IndexTTS2，必需，用于生产级 TTS 和旁白修复；设置 `INDEXTTS_HOME` 指向包含 `indextts/cli_v2.py` 的 checkout。
- OpenAI API Key，仅在运行 `plan` 或 `script` 时需要。
- HyperFrames/html-video，可选，用于动效标题、数据卡、callout 和转场。
- JianYing/剪映后端，可选，用于生成可编辑草稿。

环境检查：

```bash
make-video doctor
make-video doctor --strict
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
- `make-video plan --brief <text|file> --out <dir>`：调用 OpenAI 生成 `brief.md`、`script.md`、`shot_plan.md`、`subtitle_notes.md` 和 `production_notes.md`。
- `make-video script --input <file> --out narration.txt`：把文章、报告或书面稿改写成自然口播稿。
- `make-video subtitles --script narration.txt --duration <seconds> --out subtitles.srt`：根据口播稿和目标时长生成基础 SRT 字幕。
- `make-video mux --video base.mp4 --audio voice.wav --out final.mp4`：把旁白音频贴合视频时长并替换为唯一音轨。
- `make-video render --project <dir>`：基于项目目录执行基础 FFmpeg 渲染，支持字幕烧录和音频混流。
- `make-video probe <file>`：输出媒体文件的 `ffprobe` JSON 信息。
- `make-video doctor`：检查 FFmpeg、IndexTTS、OpenAI Key 和可选视频后端；`--strict` 会在必需后端缺失时失败。

## 环境变量

- `OPENAI_API_KEY`：`plan` 和 `script` 命令必需。
- `INDEXTTS_HOME`：必需，指向 IndexTTS/IndexTTS2 checkout，目录内需要存在 `indextts/cli_v2.py`。
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

`src/ai/openai.js` 封装 OpenAI 调用，用内置 `references/` 作为上下文生成视频规划和口播稿。

`src/media/ffmpeg.js` 封装 `ffmpeg` 和 `ffprobe`，提供媒体探测、音频贴合、音轨替换、字幕烧录和基础转码能力。

`src/media/subtitles.js` 把口播文本按中英文可读长度切分为 SRT 字幕。

`src/backends/detect.js` 探测必需后端 IndexTTS，以及 HyperFrames/html-video、JianYing/剪映等可选后端，并给出降级提示。

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
- IndexTTS/IndexTTS2：必需后端，用于中文口播、TTS、参考音色合成和配音修复。
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
