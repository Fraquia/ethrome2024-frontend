import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface CampaignData {
  name: string;
  description: string;
  github?: string;
  twitter?: string;
  farcaster?: string;
}

export async function POST(req: Request) {
  try {
    // Parse request body
    const { name, description, github, twitter, farcaster }: CampaignData =
      await req.json();

    // Validate required fields
    if (!name || !description) {
      return new Response(
        JSON.stringify({ error: "Name and description are required" }),
        { status: 400 }
      );
    }

    // Insert the campaign metadata into Supabase
    const { data, error } = await supabase
      .from("campaigns")
      .insert([
        {
          id: uuidv4(), // Generate a unique ID
          name,
          description,
          github: github || null, // Optional field handling
          twitter: twitter || null, // Optional field handling
          farcaster: farcaster || null, // Optional field handling
          created_at: new Date().toISOString(), // Set created_at to now
        },
      ])
      .select(); // Ensure data is selected and returned

    // Handle potential errors
    if (error) {
      console.error("Supabase insert error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to create campaign" }),
        { status: 500 }
      );
    }

    // Return success with campaign data
    console.log("Created campaign:", data);
    return new Response(JSON.stringify(data), { status: 201 });
  } catch (error) {
    console.error("Error creating campaign:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
