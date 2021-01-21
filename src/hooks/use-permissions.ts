import { useState } from 'react';
import { Platform } from 'react-native';
import {
  checkMultiple,
  requestMultiple,
  IOSPermission,
  AndroidPermission,
  WindowsPermission,
  PermissionStatus,
  RESULTS,
  openSettings,
} from 'react-native-permissions';
import { useShow, useHide } from 'react-native-lifecycle';

type Permission = IOSPermission | AndroidPermission | WindowsPermission;
type Permissions = Permission[];
type Request = Promise<void | { openSettings: Promise<void> }>;
type State = boolean | null;
type PermissionsParams = {
  state: State;
  request: () => Request;
};

export default (
  permissions: Permissions,
  permissionStatus: PermissionStatus = RESULTS.GRANTED,
): PermissionsParams => {
  const [state, setState] = useState<State>(null);
  if (typeof permissions === 'string') {
    permissions = [permissions];
  }
  permissions = permissions.filter(
    item => item && item.startsWith(Platform.OS),
  ) as Permissions;

  useShow(() => {
    checkMultiple(permissions).then(statuses => {
      setState(
        permissions.every(
          permission => statuses[permission] === permissionStatus,
        ),
      );
    });
  });

  useHide(() => {
    setState(null);
  });

  const request = (): Request => {
    return new Promise((resolve, reject) => {
      requestMultiple(permissions).then(statuses => {
        if (
          permissions.every(
            permission => statuses[permission] === permissionStatus,
          )
        ) {
          resolve();
        } else {
          reject({
            openSettings,
          });
        }
      });
    });
  };

  return {
    state,
    request,
  };
};
