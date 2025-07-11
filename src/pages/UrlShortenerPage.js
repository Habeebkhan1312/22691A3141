import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import { TextField, Button, Box, Typography, Paper, Grid } from '@mui/material';
import * as Yup from 'yup';
import logging from '../utils/logging';
import { addUrl } from '../services/urlService';

const validationSchema = Yup.object().shape({
  longUrl: Yup.string().url('Invalid URL format').required('URL is required'),
  validity: Yup.number().integer('Must be an integer').min(1, 'Must be at least 1'),
  shortCode: Yup.string().matches(/^[a-zA-Z0-9]+$/, 'Alphanumeric only').min(4, 'Must be at least 4 characters'),
});

const UrlShortenerPage = () => {
  const [result, setResult] = useState(null);

  const initialValues = {
    longUrl: '',
    validity: 30,
    shortCode: '',
  };

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    logging('Attempting to shorten URL');
    setResult(null);

    try {
      const newResult = await addUrl(values);
      setResult({ ...newResult, originalUrl: values.longUrl });
      logging(`Successfully shortened ${values.longUrl}`);
    } catch (error) {
      logging(`Error shortening ${values.longUrl}: ${error.message}`, 'error');
      setErrors({ longUrl: error.message });
    }

    setSubmitting(false);
  };

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        URL Shortener
      </Typography>
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ values, errors, touched, isSubmitting, handleChange }) => (
          <Form>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="longUrl"
                  label="Original Long URL"
                  value={values.longUrl}
                  onChange={handleChange}
                  error={touched.longUrl && Boolean(errors.longUrl)}
                  helperText={touched.longUrl && errors.longUrl}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  name="validity"
                  label="Validity (mins)"
                  type="number"
                  value={values.validity}
                  onChange={handleChange}
                  error={touched.validity && Boolean(errors.validity)}
                  helperText={touched.validity && errors.validity}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  name="shortCode"
                  label="Custom Shortcode"
                  value={values.shortCode}
                  onChange={handleChange}
                  error={touched.shortCode && Boolean(errors.shortCode)}
                  helperText={touched.shortCode && errors.shortCode}
                />
              </Grid>
            </Grid>
            <Button type="submit" variant="contained" color="primary" disabled={isSubmitting} sx={{ mt: 2 }}>
              Shorten URL
            </Button>
          </Form>
        )}
      </Formik>
      {result && (
        <Box mt={4}>
          <Typography variant="h5">Result</Typography>
          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography>
              <strong>Original URL:</strong> {result.originalUrl}
            </Typography>
            <Typography>
              <strong>Short URL:</strong>{' '}
              <a href={result.shortUrl} target="_blank" rel="noopener noreferrer">
                {result.shortUrl}
              </a>
            </Typography>
            <Typography>
              <strong>Expires:</strong> {new Date(result.expiryDate).toLocaleString()}
            </Typography>
          </Paper>
        </Box>
      )}
    </Paper>
  );
};

export default UrlShortenerPage;
