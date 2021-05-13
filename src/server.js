const path = require('path');
const express = require('express');
const Authenticator = require('./authenticator.js') 
const FFDC = require('./ffdc.js');

const app = express();
const B2B = new Authenticator();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(
    path.resolve(__dirname, '../dist'),
    { maxAge: '1y', etag: false})
);

app.get('/api/login', async (req, res) => {
    try {
        var token = await B2B.getToken();
        res.setHeader('Content-Type', 'application/json');
        res.json(token);
    } catch(err) {
        res.status(500).send(err);
    };   
})

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
})

app.post('/api/payment', async (req, res) => {
    console.log("in payment");
    var data = 
    {
        "sourceId": "Fake Web Payment",
        "initiatingParty": "LOCALOFFICEUS1",
        "paymentInformationId": req.body.paymentInformationId,
        "requestedExecutionDate": "2018-12-06",
        "instructedAmount": 
        {
            
            "amount": req.body.amount,
            "currency": req.body.currency
            
        },
        "paymentIdentification": 
        {
            
            "endToEndId": "1545922187435"
            
        },
        "debtor": 
        {
            
            "name": req.body.debtor
            
        },
        "debtorAgent": 
        {
            
            "identification": "020010001"
            
        },
        "debtorAccountId": 
        {
            
            "identification": "745521145"
            
        },
        "creditor": 
        {
            
            "name": req.body.creditor
            
        },
        "creditorAgent": 
        {
            
            "identification": "131000000"
            
        },
        "creditorAccountId": 
        
        {
            "identification": "1111111111"
        },
        "remittanceInformationUnstructured": "RmtInf1234"
        
    }
    const url = "https://api.fusionfabric.cloud/payment/payment-initiation/realtime-payments/v2/us-real-time-payment/tch-rtps/initiate"

    try {
        if (!req.body.token) {
            res.status(500).send("Missing token!");
        }
        
        const ffdc = new FFDC(req.body.token);
        const result = await ffdc.callAPI(url, data);

        res.status(200).send(result);
    } catch (err) {
        res.status(500).send(err);
    }
    
})

app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is listening on port ${process.env.PORT}`);
});
