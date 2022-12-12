import { useEffect, useState } from 'react';
import { API_BASEURL } from '../config';
import styles from '../styles/Home.module.css';

async function fetchApi(event: any) {
  event.preventDefault();
  const backupPath = event.target.backup_path.value;
  const modeEnv = event.target.mode_env.value;
  const crontabEnv = event.target.crontab_env.value;
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

  fetch(`${API_BASEURL}/container/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      backupPath: backupPath,
      modeEnv: modeEnv,
      volumesToMount: selectedVolumes,
      crontabEnv: crontabEnv,
    }),
  }).then(async resp => console.log(await resp.json()));
}

function stopContainer() {
  fetch(`${API_BASEURL}/container/stop`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(async resp => console.log(await resp.json()));
}

export default function Home() {
  const [volumeList, setVolumeList] = useState([]);
  const [containerStatus, setContainerStatus] = useState<string | undefined>(
    undefined,
  );
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
          Backup location (absolute path)
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
