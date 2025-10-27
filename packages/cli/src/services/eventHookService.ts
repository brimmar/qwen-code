/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ChildProcess } from 'child_process';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export type EventTrigger =
  | 'idle'
  | 'confirm'
  | 'responding'
  | 'afterAgent'
  | 'beforeTool'
  | 'afterTool'
  | 'sessionStart'
  | 'sessionEnd';

export interface EventHookConfig {
  on: EventTrigger | EventTrigger[];
  spawn: string | string[];
  description?: string;
}

export interface EventHook {
  config: EventHookConfig;
  processes: Set<ChildProcess>;
}

export class EventHookService {
  private hooks: EventHook[] = [];
  private workingDirectory: string;

  constructor(workingDirectory: string = process.cwd()) {
    this.workingDirectory = workingDirectory;
  }

  /**
   * Register event hooks from configuration
   */
  registerHooks(configs: EventHookConfig[]): void {
    // Clear existing hooks
    this.cleanupAll();

    this.hooks = configs.map((config) => ({
      config,
      processes: new Set<ChildProcess>(),
    }));
  }

  /**
   * Trigger all hooks that match the given event
   */
  triggerEvent(event: EventTrigger): void {
    // Stop any previous processes for this event type
    this.stopPreviousProcesses(event);

    const matchingHooks = this.hooks.filter((hook) => {
      const on = hook.config.on;
      return Array.isArray(on) ? on.includes(event) : on === event;
    });

    for (const hook of matchingHooks) {
      this.spawnProcess(hook);
    }
  }

  /**
   * Spawn a process for the given hook
   */
  private spawnProcess(hook: EventHook): void {
    try {
      const { spawn: spawnConfig } = hook.config;
      let command: string;
      let args: string[] = [];

      if (typeof spawnConfig === 'string') {
        // Split the command into command and args (simple approach)
        const parts = spawnConfig.split(' ');
        command = parts[0];
        args = parts.slice(1);
      } else if (Array.isArray(spawnConfig)) {
        command = spawnConfig[0];
        args = spawnConfig.slice(1);
      } else {
        console.warn('Invalid spawn configuration:', spawnConfig);
        return;
      }

      const process = spawn(command, args, {
        cwd: this.workingDirectory,
        stdio: 'inherit', // This allows the command output to be visible
        env: { ...process.env }, // Inherit current environment
      });

      // Add to process set for cleanup
      hook.processes.add(process);

      // Remove from set when process exits
      process.on('exit', () => {
        hook.processes.delete(process);
      });

      process.on('error', (error) => {
        console.error(`Event hook process error:`, error);
        hook.processes.delete(process);
      });
    } catch (error) {
      console.error('Failed to spawn event hook process:', error);
    }
  }

  /**
   * Stop previous processes for the given event
   */
  private stopPreviousProcesses(event: EventTrigger): void {
    const matchingHooks = this.hooks.filter((hook) => {
      const on = hook.config.on;
      return Array.isArray(on) ? on.includes(event) : on === event;
    });

    for (const hook of matchingHooks) {
      for (const process of hook.processes) {
        if (process.pid && !process.killed) {
          try {
            // Kill the entire process group to prevent orphaned processes
            process.kill('SIGTERM');
          } catch (error) {
            // Process might have already exited
            console.warn(`Failed to kill process ${process.pid}:`, error);
          }
        }
      }
      hook.processes.clear();
    }
  }

  /**
   * Cleanup all running processes
   */
  cleanupAll(): void {
    for (const hook of this.hooks) {
      for (const process of hook.processes) {
        if (process.pid && !process.killed) {
          try {
            // Kill the entire process group to prevent orphaned processes
            process.kill('SIGTERM');
          } catch (error) {
            // Process might have already exited
            console.warn(`Failed to kill process ${process.pid}:`, error);
          }
        }
      }
      hook.processes.clear();
    }
  }
}
