import { Request, Response, Express } from 'express';
import fetch from 'node-fetch';

interface GrokAnalysisResponse {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  name?: string;
  timeToBurn?: {
    seconds?: number;
    minutes?: number;
    hours?: number;
  };
}

export function registerFoodAnalysisRoutes(app: Express) {
  app.post("/api/food/analyze", async (req: Request, res: Response) => {
    try {
      // Extract image base64 and optional context from request
      const { imageBase64, context = '' } = req.body;
      
      if (!imageBase64) {
        return res.status(400).json({ error: 'Image data is required' });
      }

      // Get the Grok API key from environment variables
      const apiKey = process.env.GROK_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'Grok API key is not configured' });
      }

      // Build the prompt for the Grok AI
      let prompt = "Analyze the nutritional information of the food in this image.";
      
      if (context) {
        prompt += ` Additional context: ${context}.`;
      }
      
      prompt += ` Return a detailed JSON with the following fields: 
        - calories (number): Total calories in the food
        - protein (number): Protein content in grams
        - carbs (number): Carbohydrate content in grams
        - fats (number): Fat content in grams
        - name (string): Name or description of the food
        - timeToBurn (object): An object containing estimates of time to burn these calories with moderate exercise
          - hours (number, optional): Hours component
          - minutes (number, optional): Minutes component
          - seconds (number, optional): Seconds component
        
        Base the timeToBurn on a person of average weight doing moderate exercise.
        Return ONLY the JSON with no additional text. Ensure all numerical values are numbers not strings.`;

      // Call the Grok AI API
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama3-70b-8192',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${imageBase64}`
                  }
                }
              ]
            }
          ],
          max_tokens: 1000,
          temperature: 0
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Grok API error:', data);
        return res.status(response.status).json({ 
          error: 'Error analyzing food image', 
          details: data 
        });
      }

      try {
        // Extract and parse the JSON response
        const nutritionData: GrokAnalysisResponse = JSON.parse(data.choices[0].message.content);
        
        // Validate that the required fields are present
        if (typeof nutritionData.calories !== 'number' || 
            typeof nutritionData.protein !== 'number' || 
            typeof nutritionData.carbs !== 'number' || 
            typeof nutritionData.fats !== 'number') {
          return res.status(422).json({ 
            error: 'Invalid nutrition data format from AI', 
            data: nutritionData 
          });
        }
        
        // Return the analyzed nutrition data
        return res.json(nutritionData);
      } catch (e) {
        console.error('Error parsing AI response:', e);
        return res.status(500).json({ 
          error: 'Failed to parse nutrition data', 
          rawContent: data.choices[0].message.content 
        });
      }
    } catch (error) {
      console.error('Error in food analysis endpoint:', error);
      res.status(500).json({ error: 'Failed to analyze food image' });
    }
  });
}