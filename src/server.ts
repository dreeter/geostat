import express from "express";
const app = express();
const port = 8080;

app.use(express.static('public'));

app.get("/", (_req, _res)=>{
    
});

app.listen(port, ()=>{
    //console.log(`Server started at http://localhost: ${port}`);
});