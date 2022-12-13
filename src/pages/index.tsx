import {
  Checkbox,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { API_BASEURL } from '../config';
import SaveIcon from '@mui/icons-material/Save';

function SectionGroup({ children }: any) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        margin: '0 2rem 0 0rem',
        width: '-webkit-fill-available',
      }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const [useSSH, setUseSSH] = useState(false);
  const [modeEnv, setModeEnv] = useState<string>('backup');
  const [volumeList, setVolumeList] = useState([]);

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

  function saveData(event: any) {
    event.preventDefault();

    const backupPath = event.target.backup_path.value;
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
    fetch(`${API_BASEURL}/settings/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyToSend),
    })
      .then(async resp => await resp.json())
      .then(data => {
        if (data.status !== 'ok') {
          console.log('API ERROR: ', data.message);
        }
      });
  }

  return (
    <form onSubmit={saveData} style={{ width: '100%', height: '100%' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            width: '50%',
            justifyContent: 'center',
            margin: '1rem',
          }}
        >
          <div style={{ flexGrow: 1 }} />
          <Typography variant="h4">Settings</Typography>
          <div style={{ flexGrow: 1 }} />
          <IconButton color="success" type="submit">
            <SaveIcon />
          </IconButton>
        </div>
        <RadioGroup
          row
          aria-labelledby="demo-row-radio-buttons-group-label"
          name="row-radio-buttons-group"
          onChange={(data: any) => {
            setModeEnv(data.target.value);
          }}
          style={{ margin: '1rem 0 0.5rem 0' }}
        >
          <FormControlLabel
            control={<Radio />}
            label="Backup"
            id="backup"
            value="backup"
            checked={modeEnv === 'backup'}
          />
          <FormControlLabel
            value="restore"
            control={<Radio />}
            label="Restore"
            id="restore"
            checked={modeEnv === 'restore'}
          />
        </RadioGroup>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: '-webkit-fill-available',
            alignItems: 'flex-start',
            marginTop: '2rem',
            justifyContent: 'space-between',
            maxWidth: '50rem',
          }}
        >
          <SectionGroup>
            <TextField
              type="text"
              id="backup_path"
              name="backup_path"
              required
              label={`Backup location (absolute path)`}
              variant="standard"
            />
            <br />
            <TextField
              type="text"
              id="crontab_env"
              name="crontab_env"
              label="Crontab"
              variant="standard"
            />
            <br />
          </SectionGroup>

          <SectionGroup>
            <FormControlLabel
              control={
                <Checkbox
                  id="use_ssh"
                  name="use_ssh"
                  value="use_ssh"
                  onChange={() => setUseSSH(!useSSH)}
                />
              }
              label="Use SSH"
            />

            {useSSH ? (
              <>
                <br />
                <TextField
                  type="text"
                  id="ssh_host"
                  name="ssh_settings"
                  label="Host"
                  variant="standard"
                />
                <br />
                <TextField
                  type="text"
                  id="ssh_username"
                  name="ssh_settings"
                  label="Username"
                  variant="standard"
                />
                <br />
                <TextField
                  type="password"
                  id="ssh_password"
                  name="ssh_settings"
                  label="Password"
                  variant="standard"
                />
              </>
            ) : null}
          </SectionGroup>
          <SectionGroup>
            <Typography variant="h6">Volume List:</Typography>
            {volumeList.map((volume: any) => {
              return (
                <div key={volume.Name}>
                  <br />
                  <FormControlLabel
                    control={
                      <Switch
                        id={volume.Name}
                        name="selected_volumes"
                        value={volume.Name}
                        size="small"
                      />
                    }
                    label={volume.Name}
                  />
                  <br />
                </div>
              );
            })}
          </SectionGroup>
        </div>
      </div>
    </form>
  );
}
