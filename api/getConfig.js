//env vars
module.exports = (req, res) => {
    res.json({
        clientId: process.env.GC_OAUTH_CLIENT_ID
    });
};
