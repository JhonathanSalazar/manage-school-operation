import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import ClassIcon from '@mui/icons-material/Class';
import NotificationsIcon from '@mui/icons-material/Notifications';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import GroupIcon from '@mui/icons-material/Group';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { ROUTES } from '@routes/route-constants';
import type { RootState } from '@store/index';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  requiredPermission?: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: ROUTES.DASHBOARD },
  { label: 'Students', icon: <SchoolIcon />, path: ROUTES.STUDENTS, requiredPermission: 'students:read' },
  { label: 'Staff', icon: <PeopleIcon />, path: ROUTES.STAFF, requiredPermission: 'staff:read' },
  { label: 'Classes', icon: <ClassIcon />, path: ROUTES.CLASSES, requiredPermission: 'classes:read' },
  { label: 'Notices', icon: <NotificationsIcon />, path: ROUTES.NOTICES, requiredPermission: 'notices:read' },
  { label: 'Leave', icon: <BeachAccessIcon />, path: ROUTES.LEAVE, requiredPermission: 'leave:read' },
  { label: 'Users', icon: <GroupIcon />, path: ROUTES.USERS, adminOnly: true },
];

interface SidebarNavProps {
  onClose: () => void;
}

export default function SidebarNav({ onClose }: SidebarNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const authState = useSelector((state: RootState) => {
    return (state as Record<string, unknown>).auth as {
      user: { role: string; permissions?: string[] } | null;
    };
  });

  const userRole = authState.user?.role ?? '';
  const userPermissions = authState.user?.permissions ?? [];

  const isVisible = (item: NavItem) => {
    if (item.adminOnly) return userRole === 'admin';
    if (item.requiredPermission) return userPermissions.includes(item.requiredPermission);
    return true;
  };

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  const visibleItems = navItems.filter(isVisible);
  const regularItems = visibleItems.filter((i) => !i.adminOnly);
  const adminItems = visibleItems.filter((i) => i.adminOnly);

  return (
    <List sx={{ pt: 1 }}>
      {regularItems.map((item) => (
        <ListItem key={item.path} disablePadding>
          <ListItemButton
            selected={location.pathname.startsWith(item.path)}
            onClick={() => handleNav(item.path)}
            sx={{
              '&.Mui-selected': {
                bgcolor: 'primary.light',
                color: 'white',
                '& .MuiListItemIcon-root': { color: 'white' },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        </ListItem>
      ))}

      {adminItems.length > 0 && (
        <>
          <Divider sx={{ my: 1 }} />
          {adminItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                selected={location.pathname.startsWith(item.path)}
                onClick={() => handleNav(item.path)}
              >
                <ListItemIcon sx={{ minWidth: 40 }}><AdminPanelSettingsIcon /></ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </>
      )}
    </List>
  );
}
