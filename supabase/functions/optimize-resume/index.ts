const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const AI_API_TOKEN = Deno.env.get("AI_API_TOKEN_cfa268393d89");
    if (!AI_API_TOKEN) {
      throw new Error("AI API token is not configured");
    }

    const { resumeData, jdText } = await req.json();

    if (!resumeData) {
      throw new Error("简历数据不能为空");
    }
    if (!jdText || jdText.trim() === "") {
      throw new Error("请提供目标岗位的 JD 描述");
    }

    const systemPrompt = `你是一位专业的简历优化顾问，擅长根据岗位要求优化简历内容，提升简历与职位的匹配度。

优化原则：
1. 关键词匹配：从JD中提取核心技能和要求，在简历中自然融入这些关键词
2. 量化成果：将模糊描述改为具体数字和成果
3. 动词开头：每条工作职责以有力的动词开头
4. 相关性强化：突出与JD最相关的经历和技能
5. 去除冗余：删除与目标职位不相关的内容
6. 保持真实：不要编造不存在的经历，只是优化表达方式

输出格式：
直接返回优化后的完整resume_data JSON，格式与输入完全相同。不要添加任何说明文字。`;

    const userMessage = `请根据以下岗位JD，优化我的简历内容：

=== 目标岗位JD ===
${jdText}

=== 当前简历数据 ===
${JSON.stringify(resumeData, null, 2)}

请返回优化后的完整简历JSON数据。`;

    const response = await fetch("https://api.enter.pro/code/api/v1/ai/messages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AI_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "anthropic/claude-sonnet-4.5",
        messages: [{ role: "user", content: userMessage }],
        system: systemPrompt,
        stream: false,
        max_tokens: 6000,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI API error:", errText);
      throw new Error("AI 服务暂时不可用，请稍后重试");
    }

    const aiResult = await response.json();
    const rawText = aiResult.content?.[0]?.text || "";

    let optimizedData;
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");
      optimizedData = JSON.parse(jsonMatch[0]);
    } catch {
      console.error("JSON parse error:", rawText.slice(0, 500));
      throw new Error("AI 优化结果格式错误，请重试");
    }

    // Preserve existing IDs
    const preserveIds = (original: { id?: string }[], updated: { id?: string }[], prefix: string) => {
      return (updated || []).map((item, i) => ({
        ...item,
        id: item.id || (original?.[i]?.id) || `${prefix}-${i + 1}`,
      }));
    };

    optimizedData.experience = preserveIds(resumeData.experience, optimizedData.experience, "exp");
    optimizedData.education = preserveIds(resumeData.education, optimizedData.education, "edu");
    optimizedData.skills = preserveIds(resumeData.skills, optimizedData.skills, "skill");
    optimizedData.certifications = preserveIds(resumeData.certifications, optimizedData.certifications, "cert");
    optimizedData.projects = preserveIds(resumeData.projects, optimizedData.projects, "proj");

    return new Response(
      JSON.stringify({ success: true, optimizedData }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("optimize-resume error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
