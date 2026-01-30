import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Button, CircularProgress, Alert } from '@mui/material';

/**
 * UserProfileCard Component
 *
 * Displays user profile information fetched from an API.
 * Shows loading spinner, error messages, or user data based on state.
 */
export default function UserProfileCard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);

  const fetchUserData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user/profile');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setUserData(data);
    } catch (err) {
      setError(err.message);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleRefresh = () => {
    fetchUserData();
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <CircularProgress data-testid="loading-spinner" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error" data-testid="error-message">
            {error}
          </Alert>
          <Button onClick={handleRefresh} data-testid="refresh-button">
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" data-testid="user-name">
          {userData.name}
        </Typography>
        <Typography variant="body2" data-testid="user-email">
          {userData.email}
        </Typography>
        <Button onClick={handleRefresh} data-testid="refresh-button">
          Refresh
        </Button>
      </CardContent>
    </Card>
  );
}
