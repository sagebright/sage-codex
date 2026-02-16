import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const VOYAGE_API_URL = "https://api.voyageai.com/v1/embeddings";
const VOYAGE_MODEL = "voyage-3.5";

interface VoyageEmbeddingData {
  object: string;
  embedding: number[];
  index: number;
}

interface VoyageApiResponse {
  object: string;
  data: VoyageEmbeddingData[];
  model: string;
  usage: { total_tokens: number };
}

interface EmbedRequest {
  input: string | string[];
}

function createErrorResponse(
  message: string,
  status: number,
): Response {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status,
      headers: { "Content-Type": "application/json" },
    },
  );
}

function validateInput(body: EmbedRequest): string | null {
  if (!body.input) {
    return "Missing required field: input";
  }

  const isSingleString = typeof body.input === "string";
  const isStringArray = Array.isArray(body.input) &&
    body.input.every((item) => typeof item === "string");

  if (!isSingleString && !isStringArray) {
    return "Field 'input' must be a string or array of strings";
  }

  if (isSingleString && body.input.length === 0) {
    return "Field 'input' must not be empty";
  }

  if (isStringArray && body.input.length === 0) {
    return "Field 'input' array must not be empty";
  }

  return null;
}

async function fetchVoyageEmbeddings(
  input: string | string[],
  apiKey: string,
): Promise<VoyageApiResponse> {
  const normalizedInput = typeof input === "string" ? [input] : input;

  const response = await fetch(VOYAGE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      input: normalizedInput,
      model: VOYAGE_MODEL,
      input_type: "document",
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Voyage AI API error (${response.status}): ${errorBody}`,
    );
  }

  return response.json();
}

function formatResponse(
  voyageData: VoyageApiResponse,
  isSingleInput: boolean,
): Record<string, unknown> {
  const sortedData = voyageData.data.sort((a, b) => a.index - b.index);

  if (isSingleInput) {
    return { embedding: sortedData[0].embedding };
  }

  return {
    embeddings: sortedData.map((item) => item.embedding),
  };
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return createErrorResponse("Method not allowed. Use POST.", 405);
  }

  const voyageApiKey = Deno.env.get("VOYAGE_API_KEY");
  if (!voyageApiKey) {
    return createErrorResponse(
      "Server misconfigured: VOYAGE_API_KEY not set",
      500,
    );
  }

  let body: EmbedRequest;
  try {
    body = await req.json();
  } catch {
    return createErrorResponse("Invalid JSON in request body", 400);
  }

  const validationError = validateInput(body);
  if (validationError) {
    return createErrorResponse(validationError, 400);
  }

  const isSingleInput = typeof body.input === "string";

  try {
    const voyageResponse = await fetchVoyageEmbeddings(
      body.input,
      voyageApiKey,
    );

    const result = formatResponse(voyageResponse, isSingleInput);

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : "Unknown error calling Voyage AI API";

    return createErrorResponse(message, 502);
  }
});
