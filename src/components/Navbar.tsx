import {
  Alert,
  AlertColor,
  Snackbar,
  Typography,
  IconButton,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { API_BASEURL } from '../config';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import StopCircleIcon from '@mui/icons-material/StopCircle';

const STATUS_UPDATE_TIME = 5000;

export function Navbar() {
  const [containerStatus, setContainerStatus] = useState<string | undefined>(
    undefined,
  );

  const [startingContainer, setStartingContainer] = useState<boolean>(false);

  const [showMessage, setShowMessage] = useState<
    { message: string; severity: AlertColor } | undefined
  >(undefined);

  const [snackbarOpen, setSnackbarOpen] = useState(false);

  function handleSnackbarClose(
    event?: React.SyntheticEvent | Event,
    reason?: string,
  ) {
    if (reason === 'clickaway') {
      return;
    }

    setSnackbarOpen(false);
  }

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

  return (
    <div
      style={{
        width: '100%',
        height: '70px',
        backgroundColor: 'red',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div style={{ width: '5rem' }} />
      <Typography variant="h4" color={'white'} sx={{ fontWeight: 600 }}>
        RESTORIX
      </Typography>
      <div style={{ flexGrow: 1 }} />

      <Typography variant="h6" color="white">
        Status:
      </Typography>
      <br />
      <Typography
        style={{
          fontWeight: 600,
          color:
            containerStatus === 'running'
              ? 'green'
              : containerStatus === 'inexistent'
              ? //   ? 'red'
                //   : 'black',
                'white'
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
      <div style={{ flexGrow: 1 }} />

      <IconButton
        disabled={containerStatus === 'running' || startingContainer}
        color="success"
        onClick={() => {
          startContainer();
        }}
      >
        <PlayCircleIcon />
      </IconButton>

      <IconButton // disabled={containerStatus === 'running' || startingContainer}
        disabled={containerStatus !== 'running'}
        onClick={() => {
          stopContainer();
        }}
        color="error"
      >
        <StopCircleIcon />
      </IconButton>

      <div style={{ width: '5rem' }} />
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
