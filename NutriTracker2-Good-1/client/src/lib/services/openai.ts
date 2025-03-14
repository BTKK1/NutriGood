interface ExerciseAnalysis {
  caloriesPerMinute: number;
  exerciseType: string;
  intensityLevel: 'low' | 'medium' | 'high';
  icon: string;
  description: string;
}

export async function analyzeExercise(description: string): Promise<ExerciseAnalysis> {
  try {
    const response = await fetch('/api/exercise/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ description }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze exercise');
    }

    return await response.json();
  } catch (error) {
    console.error('Error analyzing exercise:', error);
    throw new Error('Failed to analyze exercise');
  }
}