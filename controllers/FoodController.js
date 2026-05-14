const USDA_BASE_URL = 'https://api.nal.usda.gov/fdc/v1/foods/search';

function getNutrient(nutrients, nutrientId) {
    const nutrient = nutrients.find(n => n.nutrientId === nutrientId);
    return nutrient ? Math.round(nutrient.value * 10) / 10 : null;
}

export class FoodController {

    static async search(req, res) {
        const { query } = req.query;

        if (!query || query.trim() === '') {
            return res.status(400).json({ message: 'El parámetro query es obligatorio' });
        }

        const apiKey = process.env.USDA_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ message: 'USDA_API_KEY no configurada en el servidor' });
        }

        let usdaResponse;
        try {
            usdaResponse = await fetch(`${USDA_BASE_URL}?api_key=${apiKey}&query=${encodeURIComponent(query)}&pageSize=50&dataType=Foundation,SR%20Legacy,Branded`);
        } catch (err) {
            return res.status(503).json({ message: 'No se pudo conectar con la API de USDA FoodData Central', error: err.message });
        }

        if (!usdaResponse.ok) {
            return res.status(503).json({ message: `La API de USDA respondió con error ${usdaResponse.status}` });
        }

        const data = await usdaResponse.json();

        const foods = (data.foods ?? [])
            .map(food => {
                const nutrients = food.foodNutrients ?? [];
                // USDA nutrient IDs: 1008=Energy(kcal), 1003=Protein, 1005=Carbs, 1004=Fat
                const calories = getNutrient(nutrients, 1008);
                const protein  = getNutrient(nutrients, 1003);
                const carbs    = getNutrient(nutrients, 1005);
                const fat      = getNutrient(nutrients, 1004);

                if (calories === null || protein === null || carbs === null || fat === null) return null;

                return {
                    name: food.description,
                    calories,
                    protein,
                    carbs,
                    fat
                };
            })
            .filter(Boolean)
            .slice(0, 20);

        return res.status(200).json({ foods });
    }
}
