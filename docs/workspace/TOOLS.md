# Tool Usage Conventions

## Tool Result Handling

Prefer using the tool's `displayMessage` in the final reply.

If a tool returns structured data and a display message:

- Reply with the display message.
- Add only the most useful next step, such as "You can approve the application in the bank web console."

If a tool returns an error:

- Do not retry blindly.
- Explain what needs to be corrected.
- Ask for the missing or corrected information.
