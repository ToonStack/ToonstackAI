import Content from "../../models/Content.js";
import { queryAzureOpenAI } from "../../config/azureOpenAI.js";

export const chat = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    // Search MongoDB for relevant content
    const searchResults = await Content.find({
      $or: [
        { title: new RegExp(query, "i") }, // Matches title
        { body: new RegExp(query, "i") },  // Matches body
        { tags: query.toLowerCase() },     // Matches tags exactly
      ],
    }).limit(5);

    let context = "No relevant database content found.";
    if (searchResults.length > 0) {
      context = searchResults
        .map((doc) => `Title: ${doc.title}\nContent: ${doc.body}`)
        .join("\n\n");
    }

    // Call Azure OpenAI
    const aiResponse = await queryAzureOpenAI(query, context);

    res.json({ response: aiResponse });
  } catch (error) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
