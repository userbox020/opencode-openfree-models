export function contentToString(content) {
  if (typeof content === "string") return content
  if (!Array.isArray(content)) return ""
  return content
    .filter((block) =>
      (block?.type === "text" || block?.type === undefined) && typeof block?.text === "string",
    )
    .map((block) => block.text)
    .join("")
}

export function contentHasImage(content) {
  return Array.isArray(content) && content.some((block) =>
    block?.type === "image_url" || block?.type === "image",
  )
}

export function normalizeWireMessages(messages) {
  return messages.map((message) => ({
    ...message,
    content: message.role === "user" && contentHasImage(message.content)
      ? message.content
      : contentToString(message.content),
  }))
}
