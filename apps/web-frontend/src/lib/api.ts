export async function runPipeline(file: File) {
  const form = new FormData();
  form.append("file", file);

  const response = await fetch("http://localhost:8000/run-pipeline", {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Failed to run pipeline: ${message}`);
  }

  return response.json();
}
