import { credentialFingerprint, writeCache } from "./cache.js"
import { discoverAll } from "./discovery.js"
import { formatDoctor, formatHelp, formatList, formatPrivacy } from "./format.js"
import { applyPolicy } from "./policy.js"

function parseArgs(text) {
  const parts = String(text || "").trim().split(/\s+/).filter(Boolean)
  if (parts[0] === "/free-models" || parts[0] === "free-models") parts.shift()
  return parts
}

async function runCommand(ctx, state, config, args) {
  const command = args[0] || "list"

  if (command === "list") {
    return formatList(state.inventory, config)
  }

  if (command === "refresh") {
    const inventory = applyPolicy(await discoverAll(config), config.policy)
    state.inventory = inventory
    await writeCache(ctx, inventory, credentialFingerprint(config.credentials))

    try {
      await ctx.provider.reload()
      await ctx.model.reload()
    } catch {
      return `${formatList(inventory, config)}\n\nCatalog refreshed; restart OpenCode to apply the new provider list.`
    }

    return `Catalog refreshed.\n\n${formatList(inventory, config)}`
  }

  if (command === "doctor") {
    return formatDoctor(state.inventory, config)
  }

  if (command === "privacy") {
    return formatPrivacy(state.inventory)
  }

  if (command === "help") {
    return formatHelp()
  }

  return `Unknown subcommand: ${command}\n\n${formatHelp()}`
}

export async function registerCommands(ctx, state, config) {
  await ctx.command.transform((editor) => {
    editor.add({
      name: "free-models",
      description: "List, refresh, or diagnose free model providers",
      execute: async (input) => {
        const output = await runCommand(ctx, state, config, parseArgs(input.prompt?.text))
        await ctx.session.synthetic({
          sessionID: input.sessionID,
          text: output,
        })
      },
    })
  })
}
