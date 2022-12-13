// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import { settingsFilePath } from './save';

type Data = {
  message?: string;
  data?: any;
};

export function getSettingsData(): { data: any; status: string } {
  var data;
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
