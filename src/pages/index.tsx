import {
  Alert,
  AlertColor,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  Snackbar,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { API_BASEURL } from '../config';

export default function Home() {
  const [useSSH, setUseSSH] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(true);
  const [startingContainer, setStartingContainer] = useState(false);
  const [showMessage, setShowMessage] = useState<
    { message: string; severity: AlertColor } | undefined
  >(undefined);
  const [modeEnv, setModeEnv] = useState<string>('backup');
  const [volumeList, setVolumeList] = useState([]);
  const [containerStatus, setContainerStatus] = useState<string | undefined>(
    undefined,
  );

  const boxBackgroundColor = '#7DA2A9';

  const handleSnackbarClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === 'clickaway') {
      return;
    }

    setSnackbarOpen(false);
  };

  function stopContainer() {
    fetch(`${API_BASEURL}/container/stop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(async resp => await resp.json())
      .then(data => {
        setShowMessage({
          message:
            data.status === 'removing' ? 'Stopping Container' : data.status,
          severity: data.status === 'removing' ? 'success' : 'error',
        }),
          setSnackbarOpen(true);
      });
  }

  async function fetchApi(event: any) {
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
    setStartingContainer(true);
    fetch(`${API_BASEURL}/container/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyToSend),
    })
      .then(async resp => await resp.json())
      .then(data => {
        setShowMessage({
          message: data.message,
          severity: data.message === 'Restorix Started' ? 'success' : 'error',
        });
        setSnackbarOpen(true);
        setStartingContainer(false);
      });
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
    <div className="app">
      <form onSubmit={fetchApi} style={{ width: '100%', height: '100%' }}>
        <div className="app-container">
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '90%',
              maxWidth: '50rem',
              alignItems: 'center',
              marginTop: '2rem',
            }}
          >
            <Typography
              variant="h2"
              color={boxBackgroundColor}
              sx={{ fontWeight: 600 }}
            >
              RESTORIX
            </Typography>
            <br />
            <br />
            <Box
              sx={{
                backgroundColor: boxBackgroundColor,
                // color: 'white',
                width: '-webkit-fill-available',
                height: 'fit-content',
                borderRadius: '10px',
                padding: '25px',
                marginTop: '10px',
                display: 'flex',
                flexDirection: 'row',
                position: 'relative',
                alignItems: 'flex-start',
                justifyContent: 'space-around',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  margin: '0 1rem 0 1rem',
                }}
              >
                <Typography variant="h6">Settings</Typography>
                <br />

                <TextField
                  type="text"
                  id="backup_path"
                  name="backup_path"
                  required
                  label={`Backup location (absolute path) ${
                    useSSH ? '(Using SSH!)' : null
                  }`}
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
                    <br />
                  </>
                ) : null}
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  margin: '0 1rem 0 1rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    width: '-webkit-fill-available',
                    justifyContent: 'space-between',
                  }}
                >
                  <RadioGroup
                    row
                    aria-labelledby="demo-row-radio-buttons-group-label"
                    name="row-radio-buttons-group"
                    onChange={(data: any) => {
                      setModeEnv(data.target.value);
                    }}
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
                </div>
                <br />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={containerStatus === 'running' || startingContainer}
                >
                  START RESTORIX
                </Button>
                {containerStatus === 'running' && (
                  <>
                    <br />
                    <Button
                      onClick={() => {
                        stopContainer();
                      }}
                      variant="contained"
                      color="error"
                    >
                      STOP RESTORIX
                    </Button>
                  </>
                )}
                <br />
                <div style={{ height: '2rem' }} />
                <Box
                  sx={{
                    backgroundColor: '#F7F7F7',
                    // color: 'white',
                    width: '-webkit-fill-available',
                    height: 'fit-content',
                    borderRadius: '10px',
                    padding: '1rem',
                    marginTop: '2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="h6">Status:</Typography>

                  <Typography
                    style={{
                      fontWeight: 600,
                      color:
                        containerStatus === 'running'
                          ? 'green'
                          : containerStatus === 'inexistent'
                          ? 'red'
                          : 'black',
                    }}
                    variant="body1"
                  >
                    {containerStatus === 'inexistent' ? (
                      <>NOT RUNNING</>
                    ) : (
                      <>{containerStatus?.toUpperCase()}</>
                    )}
                  </Typography>
                </Box>
              </div>
            </Box>
            <Box
              sx={{
                backgroundColor: boxBackgroundColor,
                // color: 'white',
                width: '-webkit-fill-available',
                height: 'fit-content',
                borderRadius: '10px',
                padding: '2rem',
                marginTop: '2rem',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                alignItems: 'flex-start',
                justifyContent: 'space-around',
              }}
            >
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
            </Box>
          </div>
        </div>
      </form>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={showMessage?.severity ? showMessage?.severity : 'info'}
          sx={{ width: '100%' }}
        >
          {showMessage?.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
