const express = require("express");
const app = express();
const fs = require("fs");

const PORT = process.env.PORT || 3001;

app.use(express.static(__dirname + "/"));

app.get("/", function (request, response) {
    var contenido = fs.readFileSync(__dirname + "/clnt/index.html");
    response.setHeader("Content-type", "text/html");
    response.send(contenido);
});

app.listen(PORT, () => {
    console.log(`App está escuchando en el puerto ${PORT}`);
    console.log("Ctrl+C para salir");
});