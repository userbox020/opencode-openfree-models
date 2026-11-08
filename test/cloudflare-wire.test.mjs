import assert from "node:assert/strict"
import test from "node:test"

import { contentHasImage, contentToString, normalizeWireMessages } from "../src/cloudflare-wire.js"

test("concatenates typed and untyped text blocks", () => {
  assert.equal(contentToString([{ type: "text", text: "Hello" }, { text: " world" }]), "Hello world")
})

test("converts null, undefined, and unsupported content to empty strings", () => {
  for (const content of [null, undefined, 42, false, { text: "ignored" }]) {
    assert.equal(contentToString(content), "")
  }
})

test("preserves string content", () => {
  assert.equal(contentToString("Hello"), "Hello")
})

test("preserves assistant tool calls and other message fields", () => {
  const message = {
    role: "assistant",
    content: null,
    name: "assistant",
    tool_calls: [{ id: "call-1", type: "function", function: { name: "read", arguments: "{}" } }],
  }
  assert.deepEqual(normalizeWireMessages([message]), [{ ...message, content: "" }])
  assert.equal(message.content, null)
})

test("preserves tool result call IDs and message ordering", () => {
  const messages = [
    { role: "tool", content: [{ type: "text", text: "First" }], tool_call_id: "call-1" },
    { role: "tool", content: [{ text: "Second" }], tool_call_id: "call-2" },
  ]
  assert.deepEqual(normalizeWireMessages(messages), [
    { ...messages[0], content: "First" },
    { ...messages[1], content: "Second" },
  ])
})

test("preserves user image arrays", () => {
  for (const type of ["image_url", "image"]) {
    const content = [{ type: "text", text: "Describe" }, { type, image_url: { url: "https://example.com/image.png" } }]
    assert.equal(contentHasImage(content), true)
    assert.equal(normalizeWireMessages([{ role: "user", content }])[0].content, content)
  }
  assert.equal(contentHasImage("text"), false)
  assert.equal(contentHasImage([{ type: "text", text: "text" }]), false)
})

test("flattens non-user image arrays", () => {
  const content = [{ type: "image" }, { type: "text", text: "Text" }]
  for (const role of ["system", "assistant", "tool"]) {
    assert.equal(normalizeWireMessages([{ role, content }])[0].content, "Text")
  }
})

test("ignores unknown blocks and non-string text", () => {
  assert.equal(contentToString([
    { type: "unknown", text: "ignored" },
    { type: "image_url", text: "ignored" },
    { type: "text", text: 42 },
    null,
    { type: "text", text: "kept" },
  ]), "kept")
})
