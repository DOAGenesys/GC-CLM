module.exports = (req, res) => {

    console.log('Value of redirectUri:', process.env.REDIRECT_URI);
    
    res.json({
        clientId: process.env.GC_OAUTH_CLIENT_ID,
        redirectUri: process.env.REDIRECT_URI
    });
};
