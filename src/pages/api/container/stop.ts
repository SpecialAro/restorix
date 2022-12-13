// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import Docker from 'dockerode';
const docker = new Docker();

type Data = {
  message?: string;
  container?: any;
  status?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if (req.method === 'POST') {
    try {
      const container = docker.getContainer('restorix-core');
      const { State } = await container.inspect();
      if (State.Status !== 'running') {
        res.status(200).json({ status: State.Status });
        return;
      }
      console.log('Stopping container... ⏳');
      await container.stop();
      console.log(`└─ Done`);
      res.status(200).json({ message: 'Restorix Stopped', status: 'stopped' });
      return;
    } catch (e: any) {
      if (e.statusCode === 404) {
        res.status(200).json({ message: e.reason, status: 'inexistent' });
        return;
      }
      res.status(400).json({ message: e.json.message });
    }
  } else {
    res
      .status(400)
      .json({ message: `We don't support ${req.method} for this endpoint.` });
  }
  return;
}
