# Make Video Skill

`make-video` 是一个面向 Agent 的通用视频制作 Skill，用于把用户的视频需求转化为可执行的制作流程和最终交付文件。它覆盖从 brief 澄清、口播稿改写、素材搜集、配音、字幕、动效、剪映草稿，到最终 `final.mp4` 导出的完整链路。

这个项目不是传统意义上的单一视频编辑程序，而是一套视频生产规范、路由规则、后端集成说明和辅助脚本。Agent 读取这些规则后，可以根据任务类型选择本地 FFmpeg 渲染、HyperFrames/html-video 动效层、JianYing/剪映草稿、IndexTTS 配音或混合流程。

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

`SKILL.md` 是 Skill 的主入口，定义触发边界、核心流程、参考文档索引、质量规则和最终响应契约。

`manifest.json` 描述项目元信息，包括名称、版本、维护者、生产状态、目标平台和组件构成。

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
- IndexTTS/IndexTTS2：中文口播、TTS、参考音色合成和配音修复。
- HyperFrames/html-video：HTML/CSS/GSAP 风格动效、标题卡、数据卡、关键词字幕和转场。
- JianYing/剪映：需要可编辑草稿、剪映原生字幕、效果、转场或人工继续精修时使用。
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
