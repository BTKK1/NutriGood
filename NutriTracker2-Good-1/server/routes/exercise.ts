import express from 'express';
import OpenAI from 'openai';

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || 'sk-bd5f7ef52a164893a062e0aa13f540c5',
  baseURL: 'https://api.deepseek.com/v1',
});

interface ExerciseAnalysis {
  caloriesPerMinute: number;
  exerciseType: string;
  intensityLevel: 'low' | 'medium' | 'high';
  icon: string;
  description: string;
  totalCalories: number;
}

router.post('/analyze', async (req, res) => {
  try {
    const { description } = req.body;

    // Extract duration from description (e.g., "25 mins" -> 25)
    const durationMatch = description.match(/(\d+)\s*min/);
    const duration = durationMatch ? parseInt(durationMatch[1]) : 30; // default to 30 mins if not specified

    // Define common exercise patterns for quicker analysis
    const exercisePatterns = {
      'run': { icon: '🏃‍♂️', type: 'Running', cpm: 10 },
      'jog': { icon: '🏃‍♂️', type: 'Running', cpm: 8 },
      'walk': { icon: '🚶‍♂️', type: 'Walking', cpm: 4 },
      'lift': { icon: '🏋️‍♂️', type: 'Weight lifting', cpm: 6 },
      'yoga': { icon: '🧘‍♂️', type: 'Yoga', cpm: 4 },
      'swim': { icon: '🏊‍♂️', type: 'Swimming', cpm: 9 },
      'bike': { icon: '🚴‍♂️', type: 'Cycling', cpm: 7 },
      'stair': { icon: '🏃‍♂️', type: 'Stair climbing', cpm: 8 }
    };

    // Try to match the description with common patterns first
    let result = null;
    for (const [key, value] of Object.entries(exercisePatterns)) {
      if (description.toLowerCase().includes(key)) {
        result = {
          caloriesPerMinute: value.cpm,
          exerciseType: value.type,
          intensityLevel: description.toLowerCase().includes('hard') || description.toLowerCase().includes('intense') ? 'high' :
                         description.toLowerCase().includes('light') || description.toLowerCase().includes('easy') ? 'low' : 'medium',
          icon: value.icon
        };
        break;
      }
    }

    // If no pattern match, use DeepSeek API
    if (!result) {
      const response = await openai.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "You are a fitness expert that provides exercise analysis in JSON format."
          },
          {
            role: "user",
            content: `Analyze this exercise: "${description}". Return JSON with only these fields: caloriesPerMinute (3-15), exerciseType (string), intensityLevel ("low"/"medium"/"high"), icon (emoji)`
          }
        ]
      });

      if (!response.choices[0].message.content) {
        throw new Error('No response content from API');
      }

      const content = response.choices[0].message.content.trim();
      const jsonStr = content.replace(/```json\n|\n```/g, '').trim();
      result = JSON.parse(jsonStr);
    }

    const totalCalories = Math.round(result.caloriesPerMinute * duration);

    const analysis: ExerciseAnalysis = {
      ...result,
      description,
      totalCalories
    };

    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing exercise:', error);
    res.status(500).json({ error: 'Failed to analyze exercise' });
  }
});

export default router;