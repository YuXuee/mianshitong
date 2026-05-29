const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `你是一位专业的简历解析助手。你的任务是将用户提供的简历内容解析为标准化的JSON格式。

请严格按照以下JSON格式输出，不要包含任何额外的说明文字，只输出纯JSON：

{
  "personal": {
    "name": "姓名",
    "email": "邮箱",
    "phone": "电话",
    "location": "所在地",
    "linkedin": "LinkedIn链接（可选）",
    "website": "个人网站（可选）",
    "jobTitle": "期望职位或当前职位"
  },
  "summary": "个人简介/职业概述（如果有）",
  "experience": [
    {
      "id": "唯一ID（用uuid格式，如exp-1）",
      "company": "公司名称",
      "title": "职位名称",
      "startDate": "开始时间（如2020-03）",
      "endDate": "结束时间（如2023-06，或至今则为空）",
      "current": false,
      "location": "工作地点（可选）",
      "bullets": ["工作职责1", "工作职责2", "工作成就3"]
    }
  ],
  "education": [
    {
      "id": "唯一ID（如edu-1）",
      "school": "学校名称",
      "degree": "学位（如本科、硕士）",
      "field": "专业",
      "startDate": "开始时间",
      "endDate": "结束时间",
      "gpa": "GPA（可选）",
      "description": "补充说明（可选）"
    }
  ],
  "skills": [
    {
      "id": "skill-1",
      "category": "技能类别（如编程语言、框架、工具）",
      "items": ["技能1", "技能2"]
    }
  ],
  "certifications": [
    {
      "id": "cert-1",
      "name": "证书名称",
      "issuer": "颁发机构",
      "date": "获得时间",
      "url": "证书链接（可选）"
    }
  ],
  "projects": [
    {
      "id": "proj-1",
      "name": "项目名称",
      "description": "项目描述",
      "tech": ["技术1", "技术2"],
      "url": "项目链接（可选）",
      "startDate": "开始时间（可选）",
      "endDate": "结束时间（可选）"
    }
  ]
}

解析要求：
1. 如果某个字段在简历中找不到，则设置为空字符串""或空数组[]
2. experience中的bullets至少拆分为3-5条，每条以动词开头（量化成果优先）
3. 如果简历中有skills，尽量按类别分组
4. 保持原始信息，不要增减内容
5. 日期格式统一为 YYYY-MM 或 YYYY`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const AI_API_TOKEN = Deno.env.get("AI_API_TOKEN_cfa268393d89");
    if (!AI_API_TOKEN) {
      throw new Error("AI API token is not configured");
    }

    const { contentType, content, mimeType, jdText } = await req.json();

    if (!content) {
      throw new Error("简历内容不能为空");
    }

    // Build message content based on content type
    let userMessageContent: unknown;

    if (contentType === "text") {
      const jdHint = jdText ? `\n\n目标岗位JD（供参考，解析时不必考虑，只需解析简历结构）：\n${jdText.slice(0, 500)}` : "";
      userMessageContent = `请解析以下简历内容：\n\n${content}${jdHint}`;
    } else if (contentType === "image") {
      const validMimeType = ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(mimeType)
        ? mimeType
        : "image/jpeg";
      userMessageContent = [
        {
          type: "image",
          source: {
            type: "base64",
            media_type: validMimeType,
            data: content,
          },
        },
        {
          type: "text",
          text: "请解析图片中的简历内容，提取所有信息并按照要求的JSON格式输出。",
        },
      ];
    } else if (contentType === "pdf") {
      // For PDFs, use Claude's document understanding
      userMessageContent = [
        {
          type: "document",
          source: {
            type: "base64",
            media_type: "application/pdf",
            data: content,
          },
        },
        {
          type: "text",
          text: "请解析PDF中的简历内容，提取所有信息并按照要求的JSON格式输出。",
        },
      ];
    } else {
      userMessageContent = `请解析以下简历内容：\n\n${content}`;
    }

    const response = await fetch("https://api.enter.pro/code/api/v1/ai/messages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AI_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "anthropic/claude-sonnet-4.5",
        messages: [
          {
            role: "user",
            content: userMessageContent,
          },
        ],
        system: SYSTEM_PROMPT,
        stream: false,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI API error:", errText);
      throw new Error("AI 服务暂时不可用，请稍后重试");
    }

    const aiResult = await response.json();
    const rawText = aiResult.content?.[0]?.text || "";

    // Extract JSON from response
    let resumeData;
    try {
      // Try to find JSON in the response
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");
      resumeData = JSON.parse(jsonMatch[0]);
    } catch {
      console.error("JSON parse error, raw:", rawText.slice(0, 500));
      throw new Error("AI 解析结果格式错误，请重试");
    }

    // Ensure IDs are present
    const ensureId = (arr: { id?: string }[], prefix: string) => {
      return (arr || []).map((item, i) => ({
        ...item,
        id: item.id || `${prefix}-${i + 1}`,
      }));
    };

    resumeData.experience = ensureId(resumeData.experience, "exp");
    resumeData.education = ensureId(resumeData.education, "edu");
    resumeData.skills = ensureId(resumeData.skills, "skill");
    resumeData.certifications = ensureId(resumeData.certifications, "cert");
    resumeData.projects = ensureId(resumeData.projects, "proj");

    return new Response(
      JSON.stringify({ success: true, resumeData }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("parse-resume error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
