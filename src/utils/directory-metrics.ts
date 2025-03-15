import { exec as execCallback } from 'child_process';
import { promisify } from 'util';
import type { FileMetric } from '../types';
import { metricsParser } from './metrics-parser';

function removeAnsiCodes(text: string): string {
  // eslint-disable-next-line no-control-regex
  return text.replace(/\x1b\[[0-9;]*m/g, '');
}

export async function getDirectoryMetrics(directory: string): Promise<readonly FileMetric[]> {
  const command = `qlty metrics --functions --quiet ${directory}`;
  const { stdout } = await promisify(execCallback)(command);

  return metricsParser(removeAnsiCodes(stdout));
}
