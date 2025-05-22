import session from 'express-session';
// import MongoStore from 'connect-mongo';
import { parse } from 'cookie';
import Session from '../models/sessionModel';

// // Extract the session manually using the session ID (SID)
export function getSessionFromSid(sid: string, sessionStore: session.Store): Promise<any> {
  return new Promise((resolve, reject) => {
    sessionStore.get(sid, (err, session) => {
      if (err) {
        reject(err);
      } else {
        resolve(session);
      }
    });
  });
}

// Verify user session on joining colyseus room
export async function verifySession(req: any) {
  try {
    const cookies = parse(req.headers.cookie || '');
    const sid = cookies['connect.sid']?.replace(/^s:/, '').split('.')[0]; // Remove "s:" prefix and signature

    if (!sid) {
      console.log('No session ID found in cookies.');
      return null;
    }

    const session = await Session.findById(sid);
    // TODO: we need an authentication function if the user is reconnecting
    /**
     * retrieve id of the room the user is accessing somehow (rooms collection since we are not disposing of them?)
     * if there are < 2 users in the room list, proceed
     * if there are 2 users in the room list, check if the user is one of them
     */

    if (session) {
      console.log('Session found:', session._id);
      return true;
    } else {
      console.log('No session associated with this SID.');
      return false;
    }
    return null;
  } catch (error) {
    console.error('Error verifying session:', error);
    return false;
  }
}
