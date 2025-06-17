export const ErrorCodes = {
  // Auth
  1: 'Incorrect username or password',
  10: 'User is not authenticated',
  11: 'Wrong login credentials',
  12: 'An account for this username or email already exists',
  13: 'Unable to log out',

  // Game
  23: 'Could not create game',
  24: 'Game not found',
  25: 'User is not the active player',
  26: 'User is not authorized',
  27: 'Can only delete games before they start',
  28: 'Cannot join a full game',
  29: 'Error starting the game',

  // Generic
  30: 'Database query error',
  31: 'Missing query parameters',

  // User
  40: 'User not found',
  41: 'Could not update the profile, please try again'
};

export const ErrorStatuses = {
  1: 401,
  10: 401,
  11: 401,
  12: 409,
  13: 400,
  23: 500,
  24: 404,
  25: 403,
  26: 403,
  27: 400,
  28: 400,
  29: 500,
  30: 500,
  31: 500,
  40: 404,
  41: 400
};

export type ErrorCode = keyof typeof ErrorCodes;
