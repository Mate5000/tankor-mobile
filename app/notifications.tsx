import React from 'react';
import { Redirect } from 'expo-router';

// Notifications now live inside the Inbox tab. Keep this path as a redirect
// so deep links and code that pushes /notifications still land somewhere sane.
export default function NotificationsRedirect() {
  return <Redirect href="/(tabs)/inbox" />;
}
