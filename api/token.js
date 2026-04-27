export default async function handler(req, res) {

  return res.status(200).json({
    access_token: "fake_access_token",
    token_type: "Bearer",
    expires_in: 3600,
    refresh_token: "fake_refresh_token"
  });
}
