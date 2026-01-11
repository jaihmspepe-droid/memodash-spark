import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, count, deckId, categoryId, language = "français" } = await req.json();

    if (!topic || !count || !deckId) {
      return new Response(
        JSON.stringify({ error: "Topic, count, and deckId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Tu es un expert en création de flashcards éducatives. Tu crées des cartes de révision claires, précises et pédagogiques.
    
Règles:
- Chaque carte doit avoir une question claire et une réponse concise mais complète
- Les questions doivent tester la compréhension, pas juste la mémorisation
- Varie les types de questions (définitions, applications, comparaisons, exemples)
- Adapte la difficulté (1=très facile, 5=très difficile)
- Réponds toujours en ${language}`;

    const userPrompt = `Génère exactement ${count} flashcards sur le sujet: "${topic}".

Retourne les cartes en utilisant la fonction generate_flashcards.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_flashcards",
              description: "Génère des flashcards éducatives",
              parameters: {
                type: "object",
                properties: {
                  flashcards: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        question: { type: "string", description: "La question de la flashcard" },
                        answer: { type: "string", description: "La réponse à la question" },
                        difficulty: { type: "number", description: "Difficulté de 1 à 5" },
                      },
                      required: ["question", "answer", "difficulty"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["flashcards"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_flashcards" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requêtes atteinte. Réessayez dans quelques instants." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Crédits insuffisants. Veuillez recharger votre compte." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Erreur lors de la génération" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    
    // Extract flashcards from tool call response
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "generate_flashcards") {
      console.error("Unexpected response format:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "Format de réponse inattendu" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const parsedArgs = JSON.parse(toolCall.function.arguments);
    const flashcards = parsedArgs.flashcards;

    // Add deckId and categoryId to each flashcard
    const enrichedFlashcards = flashcards.map((card: any, index: number) => ({
      ...card,
      deck_id: deckId,
      category_id: categoryId || null,
      position: index,
      difficulty: Math.min(5, Math.max(1, card.difficulty || 3)),
    }));

    return new Response(
      JSON.stringify({ flashcards: enrichedFlashcards }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-flashcards error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erreur inconnue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
