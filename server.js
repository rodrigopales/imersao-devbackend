import express from "express";

//Config server
const app = express();
app.listen (3000, () => {
    console.log("Servidor escutando..");
});

//Route
app.get("/api", (req, res) =>{
    res.status(200).send("Boas vindas à imersão!");

});

