import fastify from "fastify";
import cors from "@fastify/cors"
import "dotenv/config";

const server = fastify({});
const port1 = Number(process.env.PORT)
const originCors = process.env.ORIGIN
const erroMsg = {
    message : "erro"
}
type Equipe = {
    id: number,
    name : string,
}

type Pilotos = {
    id: number,
    name : string,
    equipeId: number
}

let Pilotos = [
    {
        id: 1,
        nome: "verstapenm",
        equipeId : 1 
    },{
        id: 2,
        nome: "Joao",
        equipeId : 1
    },
    {   id: 3,
        nome: "max",
        equipeId : 2
    }

]

let Equipe = [
    {
    id: 1,
    name: "Ferrari"
    },
    {
        id: 2,
        name: "redbull" 
    }
]

server.listen({port:port1},()=>{
    console.log("server running on port " + port1 + " cors origin = " + originCors)
})
/////

/////

server.register(cors,{
    origin: originCors ?? "*" ,
})

server.get("/teams", async (request, response) => {
    response.type("application/json");
    return Equipe
});
type CreateDrive = {
    id : Number
    nome: string,
    equipeId : Number
}
type CreateEquipe = {
    id : Number
    nome: string,
}
server.post<{Body: CreateDrive, Params : params }>("/drivers/add", async (request, response) => {
    response.type("application/json");
    const id = Pilotos.length + 1 
    const nome = request.body.nome 
    const equipeId = request.body.equipeId
    if (Pilotos.find((p:any)=>{return String(p.nome) === String(nome)})){
        return "Nome Já existente"
    }
    if(!nome){
        return 'AA'
    }
    if(!equipeId){
        return "BBB"
    }
    const novoPiloto = {
        id: Number(id),
        nome: String(nome),
        equipeId :Number(equipeId)
    }
    Pilotos.push(novoPiloto)
    return ({
        message : "Piloto adicionado com sucesso"
    })
})
server.post<{Body: CreateEquipe, Params : params }>("/teams/add", async (request, response) => {
    response.type("application/json");
    const id = Equipe.length + 1 
    const nome = request.body.nome 
    if (Equipe.find((p:any)=>{return String(p.name) === String(nome)})){
        return "Nome Já existente"
    }
    if(!nome){
        return 'AA'
    }
    const novoEquipe = {
        id: Number(id),
        name: String(nome)
    }
    Equipe.push(novoEquipe)
    return ({
        message : "Equipe adicionado com sucesso"
    })
})

server.get<{Params: params}>("/teams/:id", async(request, response)=>{
    response.type("application/json");
    const id = Number(request.params.id) 
    if (!id){
        return ({ 
            message : "Pfv insira um id"
        })
    }
    const timeEscolhido = Equipe.find((e)=>{return e.id === id})
    if (!timeEscolhido){
        return ({
            message: "equipe Não encontrada"
        })
    } 
    return timeEscolhido
})
server.get("/drivers", async (request, response) =>{
    response.type("application/json");
    return Pilotos
})
type params = {
    id: string
}
server.get<{Params: params}>("/drivers/:id", async (request , response)=>{
    response.type("application/json")
    const id = Number(request.params.id)
    if (!id){
        return ({
            message : "Por favor escolha um piloto" 
        })
    }
    const pilotoEscolhido = Pilotos.find((Piloto) =>{ return Piloto.id === id})
    
    if(!pilotoEscolhido){
        return ({
            message: "Piloto não encontrado"
        })
    }
    return pilotoEscolhido
})
