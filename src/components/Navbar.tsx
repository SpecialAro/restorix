import { AlertColor, Typography, IconButton } from '@mui/material';
import { useEffect, useState } from 'react';
import { API_BASEURL } from '../config';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import { SnackbarComponent } from './SnackbarComponent';
import Image from 'next/image';
import Logo from '../../public/logo.svg';
import Head from 'next/head';

const STATUS_UPDATE_TIME = 5000;

function capitalizeEachWord(str: string) {
  const arr = str.split(' ');
  for (var i = 0; i < arr.length; i++) {
    arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
  }
  return arr.join(' ');
}

export function Navbar() {
  const [containerStatus, setContainerStatus] = useState<string | undefined>(
    undefined,
  );

  const [startingContainer, setStartingContainer] = useState<boolean>(false);
  const [stoppingContainer, setStoppingContainer] = useState<boolean>(false);

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
      });
  }

  useEffect(() => {
    function getStatus() {
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
          if (data.status === 'running') {
            setStartingContainer(false);
          } else if (data.status === 'inexistent') {
            setStoppingContainer(false);
          } else {
            setStartingContainer(false);
            setStoppingContainer(false);
          }
        });
    }

    getStatus();
    const interval = setInterval(() => getStatus(), STATUS_UPDATE_TIME);

    return () => clearInterval(interval);
  });

  function stopContainer() {
    setStoppingContainer(true);
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
      });
  }

  const containerFinalStatus =
    containerStatus === 'inexistent' && !startingContainer
      ? 'not running'
      : containerStatus === 'inexistent' && startingContainer
      ? 'starting'
      : containerStatus === 'running' && stoppingContainer
      ? 'stopping'
      : containerStatus === 'running' && !stoppingContainer
      ? 'running'
      : containerStatus;

  const titleParse =
    containerFinalStatus !== undefined
      ? `RESTORIX | ${capitalizeEachWord(containerFinalStatus)}`
      : `RESTORIX`;
  return (
    <>
      <Head>
        <title>{titleParse}</title>
      </Head>
      <div
        style={{
          width: '100%',
          height: '70px',
          backgroundColor: '#00233d',
          display: 'flex',
          alignItems: 'center',
          borderBottom: `${
            containerFinalStatus === 'running'
              ? '5px solid #00563B'
              : containerFinalStatus === 'not running'
              ? '5px solid #800000'
              : '5px solid yellow'
          }`,
        }}
      >
        <div style={{ width: '5rem' }} />

        <Image src={Logo} alt="" width={200} height={29} />

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
                containerFinalStatus === 'running'
                  ? 'green'
                  : containerFinalStatus === 'not running'
                  ? 'red'
                  : 'yellow',
            }}
            variant="body1"
          >
            {containerFinalStatus?.toUpperCase()}
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
            disabled={containerStatus !== 'running' || stoppingContainer}
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
    </>
  );
}
