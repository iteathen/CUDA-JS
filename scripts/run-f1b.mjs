#!/usr/bin/env node

import { runF1bCommand } from '../tools/cuda-schema/src/pipeline.mjs';

const command = process.argv[2] ?? 'check';
await runF1bCommand(command);
