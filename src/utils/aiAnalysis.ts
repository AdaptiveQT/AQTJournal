// AI Trade Analysis Utility - SambaNova Integration
// This module provides AI-powered trade pattern recognition and insights

interface Trade {
    id: string;
    pair: string;
    direction: 'Long' | 'Short';
    pnl: number;
    setup: string;
    emotion: string;
    date: string;
    time: string;
    notes?: string;
}

interface AIInsight {
    type: 'strength' | 'weakness' | 'pattern' | 'recommendation';
    title: string;
    description: string;
    confidence: number; // 0-100
    relatedTrades?: string[];
}

interface AnalysisResult {
    insights: AIInsight[];
    summary: string;
    bestSetup: string | null;
    worstSetup: string | null;
    bestSession: string | null;
    emotionalPatterns: string[];
    recommendations: string[];
    generatedAt: number;
}

// SambaNova API configuration
const SAMBANOVA_API_URL = 'https://api.sambanova.ai/v1/chat/completions';

export async function analyzeTradesWithAI(
    trades: Trade[],
    apiKey: string,
    stats: {
        winRate: number;
        profitFactor: number;
        expectancy: number;
        totalPnL: number;
    }
): Promise<AnalysisResult> {
    if (!apiKey) {
        throw new Error('SambaNova API key is required');
    }

    if (trades.length < 5) {
        throw new Error('At least 5 trades are required for meaningful analysis');
    }

    // Prepare trade data summary for AI
    const tradeSummary = prepareTradeSummary(trades, stats);

    const systemPrompt = `You are an expert trading coach and performance analyst. Analyze trading patterns and provide actionable insights. Be specific, data-driven, and constructive. Focus on:
1. Setup performance (which setups are profitable/losing)
2. Session timing patterns (best/worst times to trade)
3. Emotional patterns affecting performance
4. Risk management observations
5. Specific, actionable recommendations

Format your response as JSON with this structure:
{
  "summary": "Brief 2-sentence performance summary",
  "insights": [
    {"type": "strength|weakness|pattern|recommendation", "title": "Short title", "description": "Detailed explanation", "confidence": 85}
  ],
  "bestSetup": "Setup name or null",
  "worstSetup": "Setup name or null", 
  "bestSession": "Morning/Afternoon/Evening or null",
  "emotionalPatterns": ["pattern1", "pattern2"],
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"]
}`;

    const userPrompt = `Analyze this trader's performance data:

${tradeSummary}

Provide specific insights about their trading patterns, strengths, weaknesses, and actionable recommendations to improve their performance.`;

    try {
        const response = await fetch(SAMBANOVA_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'Meta-Llama-3.1-8B-Instruct',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.7,
                max_tokens: 2000,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`SambaNova API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
            throw new Error('No response from AI');
        }

        // Parse JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            // If no JSON, create a basic response
            return {
                insights: [{
                    type: 'recommendation',
                    title: 'Analysis Complete',
                    description: content,
                    confidence: 70,
                }],
                summary: content.slice(0, 200),
                bestSetup: null,
                worstSetup: null,
                bestSession: null,
                emotionalPatterns: [],
                recommendations: [],
                generatedAt: Date.now(),
            };
        }

        const parsed = JSON.parse(jsonMatch[0]);

        return {
            insights: parsed.insights || [],
            summary: parsed.summary || 'Analysis complete',
            bestSetup: parsed.bestSetup || null,
            worstSetup: parsed.worstSetup || null,
            bestSession: parsed.bestSession || null,
            emotionalPatterns: parsed.emotionalPatterns || [],
            recommendations: parsed.recommendations || [],
            generatedAt: Date.now(),
        };

    } catch (error: any) {
        console.error('AI Analysis error:', error);
        throw new Error(`Analysis failed: ${error.message}`);
    }
}

function prepareTradeSummary(trades: Trade[], stats: { winRate: number; profitFactor: number; expectancy: number; totalPnL: number }): string {
    // Group by setup
    const bySetup: Record<string, { wins: number; losses: number; pnl: number }> = {};
    trades.forEach(t => {
        const setup = t.setup || 'Unknown';
        if (!bySetup[setup]) bySetup[setup] = { wins: 0, losses: 0, pnl: 0 };
        if (t.pnl > 0) bySetup[setup].wins++;
        else bySetup[setup].losses++;
        bySetup[setup].pnl += t.pnl;
    });

    // Group by emotion
    const byEmotion: Record<string, { wins: number; losses: number; pnl: number }> = {};
    trades.forEach(t => {
        const emotion = t.emotion || 'Unknown';
        if (!byEmotion[emotion]) byEmotion[emotion] = { wins: 0, losses: 0, pnl: 0 };
        if (t.pnl > 0) byEmotion[emotion].wins++;
        else byEmotion[emotion].losses++;
        byEmotion[emotion].pnl += t.pnl;
    });

    // Group by time of day
    const bySession: Record<string, { wins: number; losses: number; pnl: number }> = {};
    trades.forEach(t => {
        if (!t.time) return;
        const hour = parseInt(t.time.split(':')[0], 10);
        const session = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';
        if (!bySession[session]) bySession[session] = { wins: 0, losses: 0, pnl: 0 };
        if (t.pnl > 0) bySession[session].wins++;
        else bySession[session].losses++;
        bySession[session].pnl += t.pnl;
    });

    // Recent trades for pattern detection
    const recentTrades = trades.slice(0, 20).map(t => ({
        pair: t.pair,
        direction: t.direction,
        pnl: t.pnl.toFixed(2),
        setup: t.setup,
        emotion: t.emotion,
    }));

    return `
OVERALL PERFORMANCE:
- Total Trades: ${trades.length}
- Win Rate: ${stats.winRate.toFixed(1)}%
- Profit Factor: ${stats.profitFactor.toFixed(2)}
- Expectancy: $${stats.expectancy.toFixed(2)}
- Total P&L: $${stats.totalPnL.toFixed(2)}

PERFORMANCE BY SETUP:
${Object.entries(bySetup).map(([setup, data]) =>
        `- ${setup}: ${data.wins}W/${data.losses}L (${((data.wins / (data.wins + data.losses)) * 100).toFixed(1)}% WR), P&L: $${data.pnl.toFixed(2)}`
    ).join('\n')}

PERFORMANCE BY EMOTION STATE:
${Object.entries(byEmotion).map(([emotion, data]) =>
        `- ${emotion}: ${data.wins}W/${data.losses}L, P&L: $${data.pnl.toFixed(2)}`
    ).join('\n')}

PERFORMANCE BY SESSION:
${Object.entries(bySession).map(([session, data]) =>
        `- ${session}: ${data.wins}W/${data.losses}L, P&L: $${data.pnl.toFixed(2)}`
    ).join('\n')}

RECENT 20 TRADES:
${JSON.stringify(recentTrades, null, 2)}
`;
}

export type { AIInsight, AnalysisResult, Trade };
