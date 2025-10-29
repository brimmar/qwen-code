# New Features in Qwen Code: Event Hooks Configuration

## Overview

Qwen Code now includes a powerful new feature called **Event Hooks Configuration** that allows you to execute custom commands when specific events occur during a Qwen Code session. This feature enables automation and integration with external tools at key points in the Qwen Code workflow.

## Event Hooks Configuration

The `events` section in your settings allows you to define custom commands that will be executed when specific events occur during a Qwen Code session. Each event hook configuration includes:

- `on`: Specifies when the hook should be triggered. This can be a single event or an array of events.
- `spawn`: The command to execute, which can be a single string or an array of command and arguments.
- `description`: (Optional) A description of what the event hook does.

## Available Event Triggers

The following events can trigger your custom commands:

- `idle`: When Qwen Code is not actively responding
- `confirm`: When waiting for user confirmation
- `responding`: When Qwen Code is actively generating a response
- `afterAgent`: After the agent has completed its response
- `beforeTool`: Before a tool is executed
- `afterTool`: After a tool has been executed
- `sessionStart`: When a new session begins
- `sessionEnd`: When a session ends

## Configuration Examples

Here are some examples of how to configure event hooks in your `settings.json` file:

### Basic Example

```json
{
  "events": [
    {
      "on": ["confirm", "idle"],
      "spawn": ["echo", "-e", "User input is needed! \\a"],
      "description": "Provides audible alert when user input is needed"
    }
  ]
}
```

### Advanced Example

```json
{
  "events": [
    {
      "on": "responding",
      "spawn": "echo 'Qwen Code is thinking...'",
      "description": "Notifies when Qwen Code starts processing"
    },
    {
      "on": "sessionStart",
      "spawn": "echo 'Session started at $(date)' > /tmp/qwen-session.log",
      "description": "Logs session start time to a file"
    },
    {
      "on": "beforeTool",
      "spawn": "echo 'A tool is about to be executed' >> /tmp/qwen-session.log",
      "description": "Logs when a tool is about to be executed"
    },
    {
      "on": "afterTool",
      "spawn": "echo 'A tool has been executed' >> /tmp/qwen-session.log",
      "description": "Logs when a tool execution completes"
    }
  ]
}
```

## Common Use Cases

### System Notifications

Get audible or visual alerts when Qwen Code needs attention:

```json
{
  "on": ["confirm", "idle"],
  "spawn": ["echo", "-e", "User input is needed! \\a"]
}
```

### Automation

Trigger external scripts or tools based on Qwen Code's state:

```json
{
  "on": "sessionStart",
  "spawn": "/path/to/my/script.sh"
}
```

### Integration

Connect Qwen Code with other tools in your workflow:

```json
{
  "on": "afterTool",
  "spawn": ["git", "status"]
}
```

### Monitoring

Log or track when certain events occur during Qwen Code sessions:

```json
{
  "on": "beforeTool",
  "spawn": "echo 'Tool execution started at $(date)' >> /tmp/qwen.log"
}
```

### Custom Workflows

Execute custom scripts that enhance your interaction with Qwen Code:

```json
{
  "on": "responding",
  "spawn": "notify-send 'Qwen Code' 'Processing your request...'"
}
```

## Important Notes

- Event hooks are configured in the `events` array in your settings.json file
- Each event hook can trigger on one or multiple events
- The `spawn` command can be either a string or an array of command and arguments
- Process management is handled automatically - processes are cleaned up when appropriate
- Event hooks execute in the project's working directory
- Events are triggered at the appropriate points in the Qwen Code lifecycle

## Security Considerations

Be cautious when configuring event hooks, as they execute commands on your system. Only use trusted commands and be mindful of potential security implications when executing external scripts or tools.
