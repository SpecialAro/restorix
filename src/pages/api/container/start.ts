// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import Docker from "dockerode";
const docker = new Docker();

type Data = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const fullPathBackup = req.body.backupPath;
  const modeEnv = req.body.modeEnv;
  const volumesToMount = req.body.volumesToMount;
  const imageName = "specialaro/restorix:latest";
  await docker.pull(imageName);

  const bindVolumes = [
    "/var/run/docker.sock:/var/run/docker.sock",
    `${fullPathBackup}:/backup`,
  ];
  volumesToMount.map((element: string) => {
    bindVolumes.push(`${element}:/tobackup/${element}`);
  });

  console.log(bindVolumes);

  var auxContainer: Docker.Container;
  // Check if container is running

  const containerList = await docker.listContainers({
    all: true,
    filters: { name: ["restorix"] },
  });

  if (containerList.length !== 0) {
    const containerStatus = containerList[0].State;
    if (containerStatus !== "exited") {
      res
        .status(200)
        .json({ message: "Restorix is still running in the background." });
      return;
    }
    const container = docker.getContainer(containerList[0].Id);
    await container.remove();
  }

  docker
    .createContainer({
      Image: imageName.split(":")[0],
      name: "restorix",
      Env: [`MODE_ENV=${modeEnv}`],
      HostConfig: {
        Binds: bindVolumes,
      },
    })
    .then(function (container) {
      auxContainer = container;
      return auxContainer.start();
    });

  res.status(200).json({ message: "Restorix Started" });
}
