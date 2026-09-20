import cors from "@fastify/cors";
import fastify from "fastify";
import "dotenv/config";

const server = fastify({ logger: true });

const port = Number(process.env.PORT) || 3333;
const origin = process.env.ORIGIN ?? "*";

type IdParams = {
  id: string;
};

type Team = {
  id: number;
  name: string;
};

type Driver = {
  id: number;
  nome: string;
  equipeId: number;
};

type CreateDriverBody = {
  nome: string;
  equipeId: number;
};

type CreateTeamBody = {
  nome: string;
};

let drivers: Driver[] = [
  {
    id: 1,
    nome: "Verstappen",
    equipeId: 2,
  },
  {
    id: 2,
    nome: "Joao",
    equipeId: 1,
  },
  {
    id: 3,
    nome: "Max",
    equipeId: 2,
  },
];

let teams: Team[] = [
  {
    id: 1,
    name: "Ferrari",
  },
  {
    id: 2,
    name: "Red Bull",
  },
];

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function getNextId(items: { id: number }[]) {
  return Math.max(0, ...items.map((item) => item.id)) + 1;
}

function findDriverById(id: number) {
  return drivers.find((driver) => driver.id === id);
}

function findTeamById(id: number) {
  return teams.find((team) => team.id === id);
}

server.register(cors, {
  origin,
});

server.get("/teams", async () => {
  return teams;
});

server.get<{ Params: IdParams }>(
  "/teams/:id",
  async (request, reply) => {
    const id = Number(request.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return reply.code(400).send({
        message: "O id da equipe é inválido",
      });
    }

    const team = findTeamById(id);

    if (!team) {
      return reply.code(404).send({
        message: "Equipe não encontrada",
      });
    }

    const teamDrivers = drivers.filter(
      (driver) => driver.equipeId === team.id,
    );

    return {
      ...team,
      pilotos: teamDrivers,
    };
  },
);

server.post<{ Body: CreateTeamBody }>(
  "/teams/add",
  async (request, reply) => {
    const name = request.body.nome?.trim();

    if (!name) {
      return reply.code(400).send({
        message: "O nome da equipe é obrigatório",
      });
    }

    const teamAlreadyExists = teams.some(
      (team) => normalizeText(team.name) === normalizeText(name),
    );

    if (teamAlreadyExists) {
      return reply.code(409).send({
        message: "Essa equipe já existe",
      });
    }

    const newTeam: Team = {
      id: getNextId(teams),
      name,
    };

    teams.push(newTeam);

    return reply.code(201).send({
      message: "Equipe adicionada com sucesso",
      equipe: newTeam,
    });
  },
);

server.get("/drivers", async () => {
  return drivers;
});

server.get<{ Params: IdParams }>(
  "/drivers/:id",
  async (request, reply) => {
    const id = Number(request.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return reply.code(400).send({
        message: "O id do piloto é inválido",
      });
    }

    const driver = findDriverById(id);

    if (!driver) {
      return reply.code(404).send({
        message: "Piloto não encontrado",
      });
    }

    return driver;
  },
);

server.post<{ Body: CreateDriverBody }>(
  "/drivers/add",
  async (request, reply) => {
    const nome = request.body.nome?.trim();
    const equipeId = Number(request.body.equipeId);

    if (!nome) {
      return reply.code(400).send({
        message: "O nome do piloto é obrigatório",
      });
    }

    if (!Number.isInteger(equipeId) || equipeId <= 0) {
      return reply.code(400).send({
        message: "O id da equipe é inválido",
      });
    }

    if (!findTeamById(equipeId)) {
      return reply.code(404).send({
        message: "Equipe não encontrada",
      });
    }

    const driverAlreadyExists = drivers.some(
      (driver) => normalizeText(driver.nome) === normalizeText(nome),
    );

    if (driverAlreadyExists) {
      return reply.code(409).send({
        message: "Esse piloto já existe",
      });
    }

    const newDriver: Driver = {
      id: getNextId(drivers),
      nome,
      equipeId,
    };

    drivers.push(newDriver);

    return reply.code(201).send({
      message: "Piloto adicionado com sucesso",
      piloto: newDriver,
    });
  },
);

server.delete<{ Params: IdParams }>(
  "/drivers/delete/:id",
  async (request, reply) => {
    const id = Number(request.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return reply.code(400).send({
        message: "O id do piloto é inválido",
      });
    }

    const driverIndex = drivers.findIndex(
      (driver) => driver.id === id,
    );

    if (driverIndex === -1) {
      return reply.code(404).send({
        message: "Piloto não encontrado",
      });
    }

    const removedDriver = drivers.splice(driverIndex, 1)[0];

    return reply.send({
      message: "Piloto removido com sucesso",
      piloto: removedDriver,
    });
  },
);

async function startServer() {
  try {
    await server.listen({ port });
    console.log(`Server running on port ${port}`);
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
}

startServer();
