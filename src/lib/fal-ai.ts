import { createFalClient } from "@fal-ai/client";
import type { FalClient } from "@fal-ai/client";

const falKey = process.env.FAL_KEY;

if (!falKey) {
  console.error("[fal-ai] FAL_KEY environment variable is not set!");
}

const fal: FalClient = createFalClient({
  credentials: falKey,
});

export default fal;
