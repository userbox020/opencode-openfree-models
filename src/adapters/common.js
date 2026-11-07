const INPUT_ALIASES = new Map([
  ["text", "text"],
  ["image", "image"],
  ["audio", "audio"],
  ["video", "video"],
  ["file", "pdf"],
  ["pdf", "pdf"],
])

export function normalizeInput(modalities) {
  if (!Array.isArray(modalities)) return ["text"]
  const values = modalities
    .map((value) => INPUT_ALIASES.get(String(value).toLowerCase()))
    .filter(Boolean)
  return values.length ? [...new Set(values)] : ["text"]
}

export function supportsTools(model) {
  const parameters = model?.supported_parameters
  if (Array.isArray(parameters)) return parameters.includes("tools")
  return false
}

export function positiveInt(value, fallback) {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback
}
