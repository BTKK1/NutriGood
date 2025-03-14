import { Router } from "express";

const router = Router();

// Handle custom ingredient creation
router.post("/custom-ingredient", async (req, res) => {
  try {
    const { name, calories, protein, carbs, fats, portion } = req.body;

    if (!name?.trim() || !portion?.trim()) {
      return res.status(400).json({ error: 'Name and portion are required' });
    }

    // Format and validate the ingredient data
    const customIngredient = {
      name: name.trim(),
      calories: Math.round(Number(calories)) || 0,
      protein: Math.round(Number(protein)) || 0,
      carbs: Math.round(Number(carbs)) || 0,
      fats: Math.round(Number(fats)) || 0,
      portion: portion.trim()
    };

    res.json(customIngredient);
  } catch (error) {
    console.error('Error creating custom ingredient:', error);
    res.status(500).json({ error: 'Failed to create custom ingredient' });
  }
});

export default router;