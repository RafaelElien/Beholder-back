// Configuração inicial - imports
require('dotenv').config()
const express = require ('express')
const mongoose = require ('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')



const app = express()




//Middlewares para ler json
app.use(
    express.urlencoded({
        extended: true,
    }),
)

app.use(express.json())

//Rotas da API

const usuarioRoutes = require('./routes/usuarioRoutes')

app.use('/usuario', usuarioRoutes)



//Rota de Home
app.get('/home', (req, res) => {

    console.log('Recebida solicitação GET em /home');
    res.json({ message: 'Bem Vindo ao Beholder RPG!' }) 
        
    })




//Conectar ao Banco e uma porta com as Credenciais  
const DB_USER = process.env.DB_USER
const DB_PASSWORD = encodeURIComponent(process.env.DB_PASSWORD)

mongoose
    .connect(
       
        `mongodb+srv://${DB_USER}:${DB_PASSWORD}@beholder.cs9cz9b.mongodb.net/?retryWrites=true&w=majority`,
        )
        .then(() => {

            console.log('Conectamos ao MongoDB_Beholder!')
            app.listen(3000)
        })
        .catch((error) => 
            console.log(error)
            )


            


