// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import Docker from "dockerode";
const docker = new Docker();

type Data = {
  message?: string;
  volumes?: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === "GET") {
    const { Volumes } = await docker.listVolumes();
    res.status(200).json({ volumes: Volumes });
  } else {
    res
      .status(400)
      .json({ message: `We don't support ${req.method} for this endpoint.` });
  }
  return;
}
