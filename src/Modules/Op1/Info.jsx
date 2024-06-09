import * as React from 'react';
import List from '@mui/material/List';
import Grid from '@mui/material/Grid';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import useStore from '../../Hooks/useStore';
import Skeleton from '@mui/material/Skeleton';
import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { Box } from '@mui/material';
import caja from '../../assets/CAJA1.jpg';
import OutlinedInput from '@mui/material/OutlinedInput';
import { Steps } from 'intro.js-react';



let socket;

// eslint-disable-next-line react/prop-types
const Info= ({ Introsteps }) => {
  // eslint-disable-next-line no-unused-vars
  const { weight, width, height, length, setLength, setWidth, setHeight, setWeight, setSize } = useStore();
  const [introEnabled, setIntroEnabled] = useState(true);

  const [image, setImage] = useState(caja);
  const isCameraRunning = useRef(false);
  const [loading, setLoading] = useState(false);

  const onExit = () => {
    setIntroEnabled(true);
  };

  const startCamera = () => {
    if (!isCameraRunning.current) {
      socket = io('https://helloworld-g5wptzyyuq-ue.a.run.app/');

      socket.on('frame', (data) => {
        setImage(`data:image/jpeg;base64,${data.image}`);
        setLoading(false);
      });
      setLoading(true);
      socket.emit('start_camera');
      isCameraRunning.current = true;
    }
  };

  const stopCamera = () => {
    if (isCameraRunning.current && socket) {
      socket.emit('stop_camera');
      socket.off('frame');
      socket.disconnect();
      isCameraRunning.current = false;
    }
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      stopCamera();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      stopCamera();
    };
  }, []);
// eslint-disable-next-line no-unused-vars
  const setDimensiones = () => {
    if (socket) {
      socket.on('object_dimensions', (data) => {
        setWidth(Math.floor(data.width));
        setHeight(Math.floor(data.height));
        setLength(Math.floor(data.length));
      });
    }
  };

  const postImage = async () => {
    const formData = new FormData();
    formData.append('image', image);
    
    try {
      const response = await fetch('https://shippingiav2-app.azurewebsites.net/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setSize(data.tagname);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  return (
    <React.Fragment>
      <Steps
        enabled={introEnabled}
        steps={Introsteps}
        initialStep={0}
        onExit={onExit}
      />
      <Grid container spacing={3} direction="column">
        <Grid item xs={12}>

          <Card style={{ backgroundColor: 'rgb(9, 14, 16)' }} id='step-1'>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button id='step-2' variant="contained" color="primary" onClick={startCamera} sx={{ marginBottom: 1 }}>
                  Start
                </Button>

                <Button id='step-3' variant="contained" color="secondary" onClick={stopCamera} sx={{ marginBottom: 1 }}>
                  Stop
                </Button>

              </Box>
              {loading ? (
                <Skeleton variant="rounded" width="400px" height='250px' animation="wave" sx={{marginBottom: 1}} />
              ) : (
                <CardMedia
                  id='step-py'
                  component="img"
                  image={image}
                  alt="Camera Feed"
                  sx={{ width: '400px', height: '250px', marginBottom: 1, borderRadius: '10px'}}
                />
              )}
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button id='step-4' variant="outlined" color="primary" onClick={postImage}>
                  Calculate Dimensions
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Box id='step-5' sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <Box>
              <Typography variant="h4">
                Package Details
              </Typography>
            </Box>
            <List disablePadding sx={{ width: '100%' }}>
              <ListItem key='Length (cm)' sx={{ py: 1, px: 0 }}>
                <ListItemText
                  sx={{ mr: 2 }}
                  primary='Length (cm)'
                />
                <Typography variant="body1" fontWeight="medium">
                  {length}
                </Typography>
              </ListItem>
            </List>
            <List disablePadding sx={{ width: '100%' }}>
              <ListItem key='Width (cm)' sx={{ py: 1, px: 0 }}>
                <ListItemText
                  sx={{ mr: 2 }}
                  primary='Width (cm)'
                />
                <Typography variant="body1" fontWeight="medium">
                  {width}
                </Typography>
              </ListItem>
            </List>
            <List disablePadding sx={{ width: '100%' }}>
              <ListItem key='Height (cm)' sx={{ py: 1, px: 0 }}>
                <ListItemText
                  sx={{ mr: 2 }}
                  primary='Height (cm)'
                />
                <Typography variant="body1" fontWeight="medium">
                  {height}
                </Typography>
              </ListItem>
            </List>
            <List disablePadding sx={{ width: '100%' }}>
              <ListItem key='Weight (kg)' sx={{ py: 1, px: 0 }}>
                <ListItemText
                  sx={{ mr: 2 }}
                  primary='Weight (kg)'
                />
                <OutlinedInput
                  sx={{ width: '70px', height: '30px'}}
                  id="step-6"
                  required
                  onChange={(event) => {
                    setWeight(event.target.value);
                  }}
                />
              </ListItem>
            </List>
          </Box>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}

export default Info;
