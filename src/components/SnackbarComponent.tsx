import { Snackbar, Alert, SnackbarProps, AlertColor } from '@mui/material';

export interface ShowMessageProps {
  message: string;
  severity?: AlertColor;
}

interface ISnackbarProps extends SnackbarProps {
  showMessage?: ShowMessageProps;
}

export function SnackbarComponent({
  open,
  onClose,
  showMessage,
  autoHideDuration = 6000,
}: ISnackbarProps) {
  //   function handleSnackbarClose(
  //     event?: React.SyntheticEvent | Event,
  //     reason?: string,
  //   ) {
  //     if (reason === 'clickaway') {
  //       return;
  //     }

  //     setSnackbarOpen(false);
  //   }
  return (
    <Snackbar open={open} autoHideDuration={autoHideDuration} onClose={onClose}>
      <Alert
        onClose={() => onClose}
        severity={showMessage?.severity ? showMessage?.severity : 'info'}
        sx={{ width: '100%' }}
        variant="filled"
      >
        {showMessage?.message}
      </Alert>
    </Snackbar>
  );
}
