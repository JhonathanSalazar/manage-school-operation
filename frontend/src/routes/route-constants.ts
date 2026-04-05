export const ROUTES = {
  LOGIN: '/login',
  FORBIDDEN: '/forbidden',

  DASHBOARD: '/dashboard',

  STUDENTS: '/students',
  STUDENT_CREATE: '/students/new',
  STUDENT_DETAIL: '/students/:id',
  STUDENT_EDIT: '/students/:id/edit',

  STAFF: '/staff',
  STAFF_CREATE: '/staff/new',
  STAFF_DETAIL: '/staff/:id',

  CLASSES: '/classes',
  CLASS_DETAIL: '/classes/:id',

  NOTICES: '/notices',
  NOTICE_CREATE: '/notices/new',
  NOTICE_DETAIL: '/notices/:id',

  LEAVE: '/leave',
  LEAVE_POLICIES: '/leave/policies',
  LEAVE_REQUEST_CREATE: '/leave/request/new',

  USERS: '/users',
  USER_CREATE: '/users/new',
  USER_DETAIL: '/users/:id',
} as const;
