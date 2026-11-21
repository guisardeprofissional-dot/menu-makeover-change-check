<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

- Keep extension regression tests beside the versioned extension logic; package revisions from the previous ZIP with only intentional replacements so unrelated assets stay unchanged.
- Keep the website demo in an in-memory shared React provider with a deterministic, separately tested conversation engine; it must never import extension credentials or access live WhatsApp orders.
- Use the extracted public menu data as the website's initial catalog; never import the extension bot module into the website because it contains private integration configuration.
- Keep incomplete pizza choices in conversation state until the missing flavor or size arrives, and validate against the current catalog before adding an item; separate messages must not discard an earlier choice.
- Store half-pizza component prices on each order line at selection time; receipts must show the original calculation even if the catalog changes later.
- Pass demo payment settings to the conversation engine and share its total calculation with the admin panel; payment details and amounts must stay consistent across views.
- Recover explicit extension order answers through the same validation and confirmation path when AI fails; keep the failure visible in the panel rather than promising an unscheduled reply.
