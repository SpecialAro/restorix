import { AlertColor, Typography, IconButton } from '@mui/material';
import { useEffect, useState } from 'react';
import { API_BASEURL } from '../config';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import { SnackbarComponent } from './SnackbarComponent';

const STATUS_UPDATE_TIME = 5000;

export function Navbar() {
  const [containerStatus, setContainerStatus] = useState<string | undefined>(
    undefined,
  );

  const [startingContainer, setStartingContainer] = useState<boolean>(false);
  const [stopingContainer, setStopingContainer] = useState<boolean>(false);

  const [showMessage, setShowMessage] = useState<
    { message: string; severity: AlertColor } | undefined
  >(undefined);

  const [snackbarOpen, setSnackbarOpen] = useState(false);

  function startContainer() {
    setStartingContainer(true);
    fetch(`${API_BASEURL}/container/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      //   body: JSON.stringify(bodyToSend),
    })
      .then(async resp => await resp.json())
      .then(data => {
        setShowMessage({
          message: data.message,
          severity: data.message === 'Restorix Started' ? 'success' : 'error',
        });
        setSnackbarOpen(true);
        setInterval(() => setStartingContainer(false), STATUS_UPDATE_TIME);
      });
  }

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
    const interval = setInterval(() => getVolumes(), STATUS_UPDATE_TIME);

    return () => clearInterval(interval);
  });

  function stopContainer() {
    setStopingContainer(true);
    fetch(`${API_BASEURL}/container/stop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(async resp => await resp.json())
      .then(data => {
        setShowMessage({
          message: data.message,
          severity: data.status === 'stopped' ? 'info' : 'error',
        }),
          setSnackbarOpen(true);
        setStopingContainer(false);
      });
  }

  return (
    <div
      style={{
        width: '100%',
        height: '70px',
        backgroundColor: '#00233d',
        display: 'flex',
        alignItems: 'center',
        borderBottom: `${
          containerStatus === 'running'
            ? '5px solid #00563B'
            : containerStatus === 'inexistent'
            ? '5px solid #800000'
            : 'none'
        }`,
      }}
    >
      <div style={{ width: '5rem' }} />
      <Typography variant="h4" color={'white'} sx={{ fontWeight: 600 }}>
        RESTORIX
      </Typography>
      <div style={{ flexGrow: 1 }} />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <Typography variant="body2" color="white">
          Status:
        </Typography>
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
          {/* {startingContainer && <>Starting...</>}
          {stopingContainer && <>Stopping...</>} */}
        </Typography>
      </div>

      <div style={{ flexGrow: 1 }} />

      <div
        style={{
          backgroundColor: 'white',
          padding: '0.3rem',
          borderRadius: '100px',
        }}
      >
        <IconButton
          disabled={containerStatus === 'running' || startingContainer}
          color="success"
          onClick={() => {
            startContainer();
          }}
        >
          <PlayCircleIcon />
        </IconButton>

        <IconButton
          disabled={containerStatus !== 'running' || stopingContainer}
          onClick={() => {
            stopContainer();
          }}
          color="error"
        >
          <StopCircleIcon />
        </IconButton>
      </div>
      <div style={{ width: '5rem' }} />
      <SnackbarComponent
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        showMessage={showMessage}
      />
    </div>
  );
}
