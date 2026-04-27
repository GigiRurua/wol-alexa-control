export default async function handler(req, res) {
  const { redirect_uri, state } = req.query;
  if (!redirect_uri) return res.status(400).send('Missing redirect_uri');

  const url = `${redirect_uri}${redirect_uri.includes('?') ? '&' : '?'}code=fake_code&state=${state}`;
  return res.redirect(url);
}
