// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import Docker from 'dockerode';
import { getSettingsData } from '../settings/read';
const docker = new Docker();

type Data = {
  message: string;
  status: 'error' | 'ok';
};

// fix from: https://github.com/apocas/dockerode/issues/703
function dockerPull({ imageName }: { imageName: string }) {
  return new Promise((resolve, reject): any =>
    docker.pull(imageName, (err: any, stream: any) => {
      // https://github.com/apocas/dockerode/issues/357
      docker.modem.followProgress(stream, onFinished);
      function onFinished(err: any, output: any) {
        if (!err) {
          resolve(true);
          return;
        }
        reject(err);
      }
    }),
  );
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  const settingsData = getSettingsData();

  if (settingsData.status !== 'ok') {
    res.status(200).json({
      message: 'Something went with the settings file',
      status: 'error',
    });
    return;
  }

  const { backupPath, modeEnv, volumesToMount, crontabEnv, sshSettings } =
    settingsData.data;

  const { useSSH, sshHost, sshUser, sshPassword } = sshSettings;

  const imageName = 'specialaro/restorix-core:latest';

  const envArray = [`MODE_ENV=${modeEnv}`, `CRONTAB_ENV=${crontabEnv}`];

  const bindVolumes = ['/var/run/docker.sock:/var/run/docker.sock'];

  if (useSSH) {
    envArray.push(`SSH_HOST_ENV=${sshHost}`);
    envArray.push(`SSH_USERNAME_ENV=${sshUser}`);
    envArray.push(`SSH_PASSWORD_ENV=${sshPassword}`);
    envArray.push(`SSH_PATH_ENV=${backupPath}`);
  } else {
    bindVolumes.push(`${backupPath}:/backup`);
  }

  volumesToMount.map((element: string) => {
    bindVolumes.push(`${element}:/tobackup/${element}`);
  });

  var auxContainer: Docker.Container;
  // Check if container is running

  const containerList = await docker.listContainers({
    all: true,
    filters: { name: ['restorix-core'] },
  });

  if (containerList.length !== 0) {
    const containerStatus = containerList[0].State;
    if (containerStatus !== 'exited') {
      res.status(200).json({
        message: 'Restorix is still running in the background.',
        status: 'ok',
      });
      return;
    }
    const container = docker.getContainer(containerList[0].Id);
    await container.remove();
  }

  console.log('Pulling images... ⏳');
  await dockerPull({ imageName });
  console.log(`└─ Done`);

  console.log('Creating container... ⏳');
  await docker
    .createContainer({
      Image: imageName,
      name: 'restorix-core',
      Env: envArray,
      HostConfig: {
        Binds: bindVolumes,
        AutoRemove: true,
      },
    })
    .then(function (container) {
      console.log(`└─ Done`);
      auxContainer = container;
      console.log('Starting container... ⏳');
      return auxContainer.start();
    });
  console.log(`└─ Done`);

  res.status(200).json({ message: 'Restorix Started', status: 'ok' });
}
