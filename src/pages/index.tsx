import { useEffect, useState } from 'react';
import { API_BASEURL } from '../config';
import styles from '../styles/Home.module.css';

function stopContainer() {
  fetch(`${API_BASEURL}/container/stop`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(async resp => console.log(await resp.json()));
}

export default function Home() {
  const [useSSH, setUseSSH] = useState(false);
  const [volumeList, setVolumeList] = useState([]);
  const [containerStatus, setContainerStatus] = useState<string | undefined>(
    undefined,
  );

  async function fetchApi(event: any) {
    event.preventDefault();
    const backupPath = event.target.backup_path.value;
    const modeEnv = event.target.mode_env.value;
    const crontabEnv = event.target.crontab_env.value;

    const sshHost = useSSH ? event.target.ssh_host.value : undefined;
    const sshUser = useSSH ? event.target.ssh_username.value : undefined;
    const sshPassword = useSSH ? event.target.ssh_password.value : undefined;

    var selectedVolumes = [];

    if (modeEnv === 'backup') {
      const arraySelectedVolumes = Array.from(event.target.selected_volumes);

      const newArray = arraySelectedVolumes.map((selectedVolumes: any) => {
        if (selectedVolumes.checked !== false) {
          return selectedVolumes.defaultValue;
        }
      });
      selectedVolumes = newArray.filter((element: string | undefined) => {
        return element !== undefined;
      });

      if (selectedVolumes.length === 0) return;
    }

    const bodyToSend = {
      backupPath: backupPath,
      modeEnv: modeEnv,
      volumesToMount: selectedVolumes,
      crontabEnv: crontabEnv,
      sshSettings: {
        useSSH: useSSH,
        sshHost: sshHost,
        sshUser: sshUser,
        sshPassword: sshPassword,
      },
    };

    fetch(`${API_BASEURL}/container/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyToSend),
    }).then(async resp => console.log(await resp.json()));
  }

  useEffect(() => {
    function getVolumes() {
      fetch(`${API_BASEURL}/docker/volumes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(async resp => {
          return await resp.json();
        })
        .then(data => {
          setVolumeList(data.volumes);
        });
    }
    getVolumes();
  }, []);

  useEffect(() => {
    function getVolumes() {
      fetch(`${API_BASEURL}/container/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(async resp => {
          return await resp.json();
        })
        .then(data => {
          setContainerStatus(data!.status);
        });
    }

    getVolumes();
    const interval = setInterval(() => getVolumes(), 5000);

    return () => clearInterval(interval);
  });

  return (
    <div className={styles.container}>
      <form onSubmit={fetchApi}>
        <label>
          Backup location (absolute path) {useSSH ? '(Using SSH!)' : null}
          <br />
          <input type="text" id="backup_path" name="backup_path" required />
        </label>
        <br />
        <br />
        <label>
          Crontab
          <br />
          <input type="text" id="crontab_env" name="crontab_env" />
        </label>
        <br />
        <br />
        {volumeList.map((volume: any) => {
          return (
            <div key={volume.Name}>
              <label>
                <input
                  type="checkbox"
                  id={volume.Name}
                  name="selected_volumes"
                  value={volume.Name}
                />
                {volume.Name}
              </label>
            </div>
          );
        })}
        <br />
        <label>
          Use SSH
          <input
            type="checkbox"
            id="use_ssh"
            name="use_ssh"
            value="use_ssh"
            onChange={() => setUseSSH(!useSSH)}
          />
        </label>

        {useSSH ? (
          <>
            <br />
            <br />
            <label>
              Host
              <br />
              <input type="text" id="ssh_host" name="ssh_settings" />
            </label>
            <br />
            <label>
              Username
              <br />
              <input type="text" id="ssh_username" name="ssh_settings" />
            </label>
            <br />
            <label>
              Password
              <br />
              <input type="password" id="ssh_password" name="ssh_settings" />
            </label>
          </>
        ) : null}
        <br />
        <br />
        <label>
          <input
            type="radio"
            id="backup"
            name="mode_env"
            value="backup"
            checked
          />
          Backup
        </label>
        <br />
        <label>
          <input type="radio" id="restore" name="mode_env" value="restore" />
          Restore
        </label>
        <br />
        <br />
        <button type="submit">START RESTORIX</button>
      </form>
      <br />
      {containerStatus === 'running' && (
        <button
          onClick={() => {
            stopContainer();
          }}
        >
          STOP RESTORIX
        </button>
      )}
      <br />
      <br />
      Service Status:{' '}
      <span
        style={{
          color:
            containerStatus === 'running'
              ? 'green'
              : containerStatus === 'inexistent'
              ? 'red'
              : 'black',
        }}
      >
        {containerStatus}
      </span>
    </div>
  );
}
