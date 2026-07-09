import { useState } from "react";
import {
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
} from "@mui/material";
import { ProviderPageShell } from "../../components";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  type: "request" | "message" | "system";
  read: boolean;
};

const initialNotifications: NotificationItem[] = [
  {
    id: "n1",
    title: "New care request",
    body: "Maria Lopez requested elderly companionship support.",
    type: "request",
    read: false,
  },
  {
    id: "n2",
    title: "New message",
    body: "James Carter sent you a message about schedule changes.",
    type: "message",
    read: false,
  },
  {
    id: "n3",
    title: "Verification update",
    body: "Your ID document is being reviewed by the CareSeeker team.",
    type: "system",
    read: true,
  },
];

const ProviderNotifications = () => {
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(initialNotifications);

  const markAsRead = (id: string) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, read: true }))
    );
  };

  return (
    <ProviderPageShell
      title="Notifications"
      description="Stay up to date on requests, messages, and system updates."
    >
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="flex-end">
          <Chip
            label="Mark all as read"
            onClick={markAllAsRead}
            clickable
            variant="outlined"
          />
        </Stack>

        <Paper
          elevation={0}
          sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider" }}
        >
          <List disablePadding>
            {notifications.map((notification) => (
              <ListItem key={notification.id} disablePadding divider>
                <ListItemButton onClick={() => markAsRead(notification.id)}>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <span>{notification.title}</span>
                        {!notification.read ? (
                          <Chip size="small" color="primary" label="New" />
                        ) : null}
                      </Stack>
                    }
                    secondary={notification.body}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      </Stack>
    </ProviderPageShell>
  );
};

export default ProviderNotifications;
