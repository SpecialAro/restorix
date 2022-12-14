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
import {
  ShowMessageProps,
  SnackbarComponent,
} from '../components/SnackbarComponent';
import { AppSettings, getSettingsData } from './api/settings/read';
import 'react-js-cron/dist/styles.css';
import dynamic from 'next/dynamic';
const Cron = dynamic(() => import('react-js-cron'), {
  ssr: false,
});

interface IProps {
  appSettings: AppSettings;
}

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

export default function Home(props: IProps) {
  const { appSettings } = props;

  const [useSSH, setUseSSH] = useState(appSettings.sshSettings.useSSH);
  const [modeEnv, setModeEnv] = useState<string>(appSettings.modeEnv);
  const [volumeList, setVolumeList] = useState([]);

  const [showMessage, setShowMessage] = useState<ShowMessageProps | undefined>(
    undefined,
  );

  const defaultCronValue = '* * * * *';

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [useCrontab, setUseCrontab] = useState(appSettings.crontabEnv !== '');
  const [crontabValue, setCrontabValue] = useState(
    useCrontab ? appSettings.crontabEnv : defaultCronValue,
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

  function saveData(event: any) {
    event.preventDefault();

    const backupPath = event.target.backup_path.value;

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

      if (selectedVolumes.length === 0) {
        setShowMessage({
          message: 'Please select at least one volume.',
          severity: 'warning',
        });
        setSnackbarOpen(true);
        return;
      }
    }

    const bodyToSend: AppSettings = {
      backupPath: backupPath,
      modeEnv: modeEnv,
      volumesToMount: selectedVolumes,
      crontabEnv: modeEnv === 'backup' ? crontabValue : '',
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
          setShowMessage({ message: data.message, severity: 'error' });
          setSnackbarOpen(true);
          return;
        }
        setShowMessage({ message: data.message, severity: 'success' });
        setSnackbarOpen(true);
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
              defaultValue={appSettings.backupPath}
            />
            <br />
            {modeEnv !== 'restore' && (
              <>
                <FormControlLabel
                  control={
                    <Checkbox
                      id="use_crontab"
                      name="use_crontab"
                      value="use_crontab"
                      onChange={() => {
                        setUseCrontab(prev => {
                          if (prev) {
                            setCrontabValue('');
                          } else {
                            setCrontabValue(defaultCronValue);
                          }
                          return !prev;
                        });
                      }}
                      defaultChecked={useCrontab}
                    />
                  }
                  label="Scheduler (crontab)"
                />
                <br />
                <div style={{ display: useCrontab ? undefined : 'none' }}>
                  <Cron setValue={setCrontabValue} value={crontabValue} />
                </div>
              </>
            )}
          </SectionGroup>

          <SectionGroup>
            <FormControlLabel
              control={
                <Checkbox
                  id="use_ssh"
                  name="use_ssh"
                  value="use_ssh"
                  onChange={() => setUseSSH(!useSSH)}
                  defaultChecked={useSSH}
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
                  defaultValue={appSettings.sshSettings.sshHost}
                />
                <br />
                <TextField
                  type="text"
                  id="ssh_username"
                  name="ssh_settings"
                  label="Username"
                  variant="standard"
                  defaultValue={appSettings.sshSettings.sshUser}
                />
                <br />
                <TextField
                  type="password"
                  id="ssh_password"
                  name="ssh_settings"
                  label="Password"
                  variant="standard"
                  defaultValue={appSettings.sshSettings.sshPassword}
                />
              </>
            ) : null}
          </SectionGroup>
          {modeEnv !== 'restore' && (
            <SectionGroup>
              <Typography variant="h6">Volume List:</Typography>
              {volumeList.map((volume: any) => {
                var isDefaultActive = false;
                appSettings.volumesToMount.map(element => {
                  if (volume.Name === element) {
                    isDefaultActive = true;
                  }
                });
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
                          defaultChecked={isDefaultActive}
                        />
                      }
                      label={volume.Name}
                    />
                    <br />
                  </div>
                );
              })}
            </SectionGroup>
          )}
        </div>
      </div>
      <SnackbarComponent
        open={snackbarOpen}
        onClose={() => {
          setSnackbarOpen(false);
        }}
        showMessage={showMessage}
      />
    </form>
  );
}

export async function getServerSideProps({ req }: any) {
  const appSettings = getSettingsData().data;
  return { props: { appSettings } };
}
