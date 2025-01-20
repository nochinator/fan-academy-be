export default interface ISession {
  _id: string,
  expires: Date,
  lastModified: Date,
  session: string
}