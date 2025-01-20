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
    console.log('FIRST CHECK');
    const cookies = parse(req.headers.cookie || '');
    const sid = cookies['connect.sid']?.replace(/^s:/, '').split('.')[0]; // Remove "s:" prefix and signature
    console.log('SID ->', sid);

    if (!sid) {
      console.log('No session ID found in cookies.');
      return null;
    }

    const session = await Session.findById(sid);

    if (session) {
      console.log('Session found:', session);
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
