import { apiFetch, API_ENDPOINTS } from "./api-config";

export async function runPipeline(file: File) {
  const form = new FormData();
  form.append("file", file);

  const response = await apiFetch(API_ENDPOINTS.RUN_PIPELINE, {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Failed to run pipeline: ${message}`);
  }

  return response.json();
}
