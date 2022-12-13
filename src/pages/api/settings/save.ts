// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

type Data = {
  message?: string;
  volumes?: any;
  status: 'ok' | 'error';
};

const settingsFolderPath = path.join(process.cwd(), 'data', 'user');
export const settingsFilePath = path.join(settingsFolderPath, 'settings.json');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if (req.method === 'POST') {
    const folderExists = fs.existsSync(settingsFolderPath);
    // const fileExists = fs.existsSync(filePath);

    if (!folderExists) {
      fs.mkdirSync(settingsFolderPath, { recursive: true });
    }

    // CREATE FILE
    const data = JSON.stringify(req.body);
    fs.writeFileSync(settingsFilePath, data);

    res.status(200).json({ message: 'Data successfully saved.', status: 'ok' });
  } else {
    res.status(400).json({
      message: `We don't support ${req.method} for this endpoint.`,
      status: 'error',
    });
  }
  return;
}
