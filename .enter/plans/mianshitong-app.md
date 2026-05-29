# 面试通 (Interview Pass) — 完整实现方案

## Context
从零搭建一款AI驱动的简历优化应用"面试通"。用户上传JD和简历，AI解析简历为可编辑结构，再根据JD智能优化，最终导出带水印的PDF/Word。需要用户登录系统保存历史记录，后端依赖Enter Cloud (Supabase)。

---

## 技术栈 & 依赖

| 类型 | 工具 |
|------|------|
| 框架 | React + Vite + TypeScript + Tailwind CSS |
| 后端 | Supabase（Auth + Database + Storage + Edge Functions）|
| AI | Enter LLM Integration（简历解析、JD分析、内容优化）|
| 路由 | react-router-dom |
| 拖拽 | @dnd-kit/core + @dnd-kit/sortable |
| 文件上传UI | react-dropzone |
| PDF导出 | jspdf + html2canvas（带水印）|
| Word导出 | docx |
| UI组件 | shadcn/ui |

---

## 页面结构（Site IA）

```
/                   → 落地页（功能介绍 + CTA）
/auth               → 登录/注册（邮箱+密码）
/dashboard          → 用户简历历史列表
/editor/new         → 第一步：上传JD + 上传简历
/editor/:id         → 第二步：简历编辑器（解析后结构化编辑）
/editor/:id/preview → 第三步：预览 + 导出
```

---

## Supabase 数据结构

### resumes 表
```sql
id          uuid primary key
user_id     uuid references auth.users
title       text
jd_text     text
resume_data jsonb   -- 结构化简历JSON
status      text    -- 'uploading' | 'parsing' | 'ready'
created_at  timestamptz
updated_at  timestamptz
```

### Storage Buckets
- `resume-files`：用户上传的原始简历文件（PDF/Word/图片）
- `jd-files`：用户上传的JD文件/图片

---

## Edge Functions

### 1. `parse-resume`
- **输入**: file_url（Storage URL）或 text（直接文本）+ file_type
- **处理**: 调用LLM，将简历内容解析为标准化JSON结构
- **输出**:
```json
{
  "personal": { "name", "email", "phone", "location", "linkedin", "website" },
  "summary": "...",
  "experience": [{ "company", "title", "startDate", "endDate", "bullets": [] }],
  "education": [{ "school", "degree", "field", "startDate", "endDate" }],
  "skills": [{ "category", "items": [] }],
  "certifications": [],
  "projects": [{ "name", "description", "tech": [] }]
}
```

### 2. `optimize-resume`
- **输入**: resume_data（结构化JSON）+ jd_text（JD描述）
- **处理**: LLM分析JD关键词，针对性优化每个字段的措辞和内容
- **输出**: 优化后的 resume_data + diff 高亮标注

---

## 简历数据结构（前端）

```typescript
interface ResumeData {
  personal: { name: string; email: string; phone: string; location: string; linkedin?: string; website?: string };
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillGroup[];
  certifications: CertItem[];
  projects: ProjectItem[];
}
```

---

## 核心组件列表

```
src/
├── pages/
│   ├── LandingPage.tsx         -- 落地页
│   ├── AuthPage.tsx            -- 登录/注册
│   ├── DashboardPage.tsx       -- 历史简历列表
│   ├── UploadPage.tsx          -- JD + 简历上传（/editor/new）
│   ├── EditorPage.tsx          -- 简历编辑器（/editor/:id）
│   └── PreviewPage.tsx         -- 预览+导出（/editor/:id/preview）
├── components/
│   ├── resume-editor/
│   │   ├── PersonalSection.tsx      -- 个人信息编辑
│   │   ├── SummarySection.tsx       -- 个人简介编辑
│   │   ├── ExperienceSection.tsx    -- 工作经历（可拖拽排序）
│   │   ├── EducationSection.tsx     -- 教育背景（可拖拽排序）
│   │   ├── SkillsSection.tsx        -- 技能标签
│   │   ├── ProjectsSection.tsx      -- 项目经历（可拖拽）
│   │   └── SectionWrapper.tsx       -- 统一的可拖拽Section容器
│   ├── resume-preview/
│   │   └── ResumePreview.tsx        -- 渲染成简历样式（用于导出）
│   ├── upload/
│   │   ├── FileDropzone.tsx         -- 拖拽/点击上传区域
│   │   └── JDInput.tsx              -- JD输入（文本/文件/图片）
│   └── layout/
│       ├── Navbar.tsx
│       └── ProtectedRoute.tsx
├── hooks/
│   ├── useResume.ts            -- 简历CRUD
│   ├── useParseResume.ts       -- 调用parse-resume Edge Function
│   └── useOptimizeResume.ts   -- 调用optimize-resume Edge Function
├── lib/
│   ├── supabase.ts             -- Supabase client
│   ├── export-pdf.ts           -- jsPDF + html2canvas 导出（含水印）
│   └── export-docx.ts          -- docx 库导出Word（含水印文字）
└── stores/
    └── resumeStore.ts          -- Zustand状态管理（可选，或用React Context）
```

---

## 关键交互流程

### 上传解析流程
1. `/editor/new`：用户粘贴/上传JD，上传简历文件
2. 文件上传到 Supabase Storage
3. 触发 `parse-resume` Edge Function → 显示加载动画（"AI正在解析简历..."）
4. 解析完成 → 更新 `resumes` 表的 `resume_data` → 跳转到 `/editor/:id`

### 编辑流程
- 左侧：可折叠的分区编辑面板（表单输入）
- 右侧：实时渲染简历预览
- 各Section支持`@dnd-kit`拖拽排序
- "根据JD优化"按钮 → 调用 `optimize-resume` → 流式显示优化建议

### 导出流程
- PDF：`html2canvas` 截图 `ResumePreview` 组件 → `jsPDF` 生成 → 在画布上叠加半透明"面试通"对角水印
- Word：`docx` 库构建文档结构 → 在页面背景插入水印文字

---

## 设计风格
- **配色**: 主色 深蓝 `#1E3A5F`，辅色 青蓝 `#0EA5E9`，背景 `#F8FAFC`
- **风格**: 简洁专业，LinkedIn/Notion 风，大量留白，卡片式布局
- **字体**: Inter / 系统字体
- **动画**: 平滑过渡，skeleton loading，AI处理时的渐进加载

---

## 实现顺序

1. **项目初始化** — Vite + React + TS + Tailwind + shadcn/ui + 路由
2. **启用 Enter Cloud** — 连接 Supabase，创建数据表和Storage
3. **设计系统** — index.css tokens，tailwind.config.ts，全局组件样式
4. **落地页 + Auth** — LandingPage，AuthPage，ProtectedRoute
5. **上传页** — UploadPage，FileDropzone，JDInput
6. **Edge Functions** — parse-resume + optimize-resume（Enter LLM）
7. **编辑器页** — 所有 Section 组件 + 拖拽 + 实时预览
8. **导出功能** — export-pdf.ts + export-docx.ts（含水印）
9. **Dashboard** — 历史简历列表 + 管理

---

## 验证方式
- 上传一份PDF简历 → 确认AI返回结构化JSON
- 输入JD文本 → 点击"根据JD优化" → 确认简历内容被针对性修改
- 点击"导出PDF" → 确认下载文件含"面试通"对角水印
- 刷新页面 → 确认简历数据从Supabase正确加载
- 未登录访问 `/editor/new` → 确认重定向到 `/auth`
