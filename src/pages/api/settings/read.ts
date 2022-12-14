// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import { settingsFilePath } from './save';

export interface AppSettings {
  backupPath: string;
  modeEnv: string;
  volumesToMount: string[];
  crontabEnv: string;
  sshSettings: {
    useSSH: boolean;
    sshHost?: string;
    sshUser?: string;
    sshPassword?: string;
  };
}

type Data = {
  message?: string;
  data?: AppSettings;
};

export function getSettingsData(): { data: AppSettings; status: string } {
  var data = {
    backupPath: '',
    modeEnv: 'backup',
    crontabEnv: '',
    sshSettings: { useSSH: false },
    volumesToMount: [],
  };
  var status: 'ok' | 'error' = 'error';
  try {
    data = JSON.parse(
      fs.readFileSync(settingsFilePath, {
        encoding: 'utf8',
        flag: 'r',
      }),
    );
    status = 'ok';
  } catch {
    status = 'error';
  }
  return { data: data, status: status };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if (req.method === 'GET') {
    const data = getSettingsData();

    res.status(200).json(data);
  } else {
    res
      .status(400)
      .json({ message: `We don't support ${req.method} for this endpoint.` });
  }
  return;
}
