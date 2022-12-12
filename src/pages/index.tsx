import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";

const API_URL = "http://localhost:3000/api";

async function fetchApi(event: any) {
  event.preventDefault();
  const backupPath = event.target.backup_path.value;
  const modeEnv = event.target.mode_env.value;
  var selectedVolumes = [];
  if (modeEnv === "backup") {
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

  fetch(`${API_URL}/container/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      backupPath: backupPath,
      modeEnv: modeEnv,
      volumesToMount: selectedVolumes,
    }),
  }).then(async (resp) => console.log(await resp.json()));
}

export default function Home() {
  const [volumeList, setVolumeList] = useState([]);
  useEffect(() => {
    function getVolumes() {
      fetch(`${API_URL}/docker/volumes`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then(async (resp) => {
          return await resp.json();
        })
        .then((data) => {
          setVolumeList(data.volumes);
        });
    }
    getVolumes();
  }, []);
  return (
    <div className={styles.container}>
      <form onSubmit={fetchApi}>
        <input type="text" id="backup_path" name="backup_path" required />
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
        <label>
          <input type="radio" id="restore" name="mode_env" value="restore" />
          Restore
        </label>
        <button type="submit">START RESTORIX</button>
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
      </form>
    </div>
  );
}
