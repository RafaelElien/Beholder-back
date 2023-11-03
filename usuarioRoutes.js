
    const router = require('express').Router()
    const bcrypt = require('bcrypt')
    const jwt = require('jsonwebtoken')


    const Usuario = require('../models/Usuario')





    // Rota para cadastrar usuário 
    router.post('/', async (req, res) => {

        const {nome, nasc, email, senha} = req.body
    

        if(!nome){
            res.status(422).json({error: 'O Nome é obrigatório!'}) 
            return
        }

        if(!nasc){
            res.status(422).json({error: 'A Data de Nascimento é obrigatório!'})
            return
        }

        if(!email){
            res.status(422).json({error: 'O E-mail é obrigatório!'})
            return
        }

        if(!senha){
            res.status(422).json({error: 'A Senha é obrigatório!'})
            return
        }

        // Verificar se o Usuário já existe pelo Email!
        const usuarioExiste = await Usuario.findOne({ email: email})

        if(usuarioExiste){
            return res.status(422).json({error: 'Por favor, ultilizar outro Email!'})
        }

        //Criando a segurança da senha
        const salt = await bcrypt.genSalt(12)
        const senhaHash = await bcrypt.hash(senha, salt)

    const router = require('express').Router()
        
        const usuario = new Usuario ({
            nome,
            nasc,
            email,
            senha: senhaHash,
        })

        try {
            await Usuario.create(usuario)
        
            res.status(201).json({ message: 'Usuário cadastrado no sistema com Sucesso!'})

        } catch (error) {
        
            console.log(error)
            res.status(500).json({msg: 'Aconteceu um erro no servidor, tente novamente mais tarde!'})
        }

    })

    // Rota para buscar todos os usuário
    router.get('/', async (req, res) =>{
        try {
            const usuarios = await Usuario.find()
            
            res.status(200).json(usuarios)

        } catch (error) {
            res.status(500).json({error: error})
            
        }
    })


    // Rota Busca usuário por ID
    router.get('/:id', async (req, res) => {

        const id = req.params.id

        try {
            const usuario = await Usuario.findOne({ _id: id })

            if(!usuario){
                res.status(422).json({message: 'Usuário não Encontrado!'})
                return
            }

            res.status(200).json(usuario)

        } catch (error) {
            res.status(500).json({error: error})
            
        }
    })

    // Rota para editar usuário

    router.patch('/:id', async (req, res) =>{
        
        const id = req.params.id

        const {nome, nasc, email, senha} = req.body
    
    const usuario = {
        nome,
        nasc,
        email,
        senha,
    }

        try {
            const updatedUsuario = await Usuario.updateOne({ _id: id }, usuario)

            if(updatedUsuario.matchedCount === 0){
                res.status(422).json({message: 'Usuário não Encontrado!'})
                return
            }

            res.status(200).json(usuario)
            
        } catch (error) {
            res.status(500).json({ error: error })
        }
    })

    //Deletar usuário
    router.delete('/:id', async (req, res) =>{

        const id = req.params.id

        const usuario = await Usuario.findOne({ _id: id })

        if(!usuario){
            res.status(422).json({message: 'Usuário não Encontrado!'})
            return
        }

        try {

            await Usuario.deleteOne({ _id: id})

            res.status(200).json({message: 'Usuário removido com Sucesso!'})
            
        } catch (error) {
            res.status(500).json({ error: error })
        }



    })

    router.post('/login', async (req, res) =>{
        const {email, senha} = req.body

        //Validações
        if(!email){
            res.status(422).json({error: 'O E-mail é obrigatório!'})
            return
        }

        if(!senha){
            res.status(422).json({error: 'A Senha é obrigatório!'})
            return
        }

        //Verificar se o usuário existe

        const usuario = await Usuario.findOne({ email: email}) 

        if(!usuario){
            return res.status(404).json({error: 'Usuário não encontrado!'})
        }
    
        //Verificar a senha e comparar

    const checarSenha = await bcrypt.compare(senha, usuario.senha)

    if(!checarSenha){
            return res.status(422).json({message: 'Senha inválida!'})
        }

        try {
            const secret = process.env.SECRET

            const token = jwt.sign(
                {
                    id: usuario._id,
            },
                secret,
            )
            res.status(200).json({message:'Autenticação realizado com sucesso!', token})
            
        } catch (error) {
                console.log(error)
                res.status(500).json({msg: 'Aconteceu um erro no servidor, tente novamente mais tarde!'})
        
        }

    })

    //Rota Privada só para usuário que tem registro

    router.get('/usuario/:id', checarToken, async (req, res) => {
        const id = req.params.id

        //Verificar se o usuário existe
        const usuario = await Usuario.findById(id)

        if(!usuario){
            return res.status(404).json({message: 'Usuário não encontrado!'})
        }
        res.status(200).json({usuario})   
    })

    function checarToken(req, res, next) {

        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]

        if(!token){
            return res.status(401).json({message:'Acesso negado!'})
        }
        try {
            const secret = process.env.SECRET
            jwt.verify(token, secret)
            next()
            
        } catch (error) {
            res.status(400).json({message:'Token inválido!'})
            
        }
    }




    module.exports = router
