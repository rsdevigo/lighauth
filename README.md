# SAUTH - Simple Authentication protocol based on levels

## Protocolo

O protocolo SAUTH, é um protocolo onde sua autenticação acontece por níveis que contém prioridade de execução.

Ele utiliza duas entidades básicas:
- Credential
> Possui:
	- key: String, único.
	- token: String.
	- level: String.


- Level
> Possui:
	- name: String.
	- priority: Integer, maior ou igual a 1.

Utilizando essas duas entidades o protocolo segue o seguinte fluxo:

- Cenário: Um serviço que possue 1 nível de acesso e contém uma credencial, feito isso temos duas entidades instanciadas em nosso cenário:
	- Level
		- name: Application
		- priority: 1
	- Credential
		- key: my-secret-key
		- token: my-secret-token
		- level: Application
1. O cliente monta uma mesagem **m** composta por:
	- my-secret-token concatenado com o timestamp atual **t**
1. O cliente realiza uma requisição com 3 cabeçalhos:
	- x-sauth-application-signature : hmac('sha1', my-secret-key, m).digest('hex')
	- x-sauth-application-key : my-secret-key
	- x-sauth-time : t
1. O servidor recebe essa requisição e busca a credencial **C** pelo cabeçalho x-sauth-application-key.
1. O servidor monta uma mensagem **M** composta por:
	- C.token concatenado com x-sauth-time.
1. O servidor com a credencial C em mãos cria uma assinatura composta por:
	- check_signature : hmac('sha1', x-sauth-application-key, M).digest('hex')
1. O servidor compara se check_signature é igual a x-sauth-application-signature.
	- Se for igual o servidor responde com código HTTP 200 e com o seguinte objeto json:
	```
	{ message: true }
	```
	- Se não for igual o servidor responde com código HTTP 401 e com o seguinte objeto json:
	```
	{ message: 'Signature with key x-sauth-application-key is invalid.' }
	```

Para cenários com mais de um nível, o processo é análogo, só que para cada nível é necessário a criação de dois cabeçalhos utilizando as credenciais de cada nível:

- Mensagem **m** : my-secret-token concatenado com o timestamp atual **t**
- x-sauth-level.name-signature: hmac('sha1', my-secret-key, m).digest('hex')
- x-sauth-level.name-key: hmac('sha1', my-secret-key, m).digest('hex')

E então o processo continua o mesmo, lembrando que não importando a quantidade de níveis a requisição sempre deve ter apenas um cabeçalho com o nome de x-sauth-time.

Vale lembrar como a autenticação é baseada em níveis, só é possível autenticar uma credencial do nível *n* se o mesmo possuir credenciais do níveis *n-1*.
Por exemplo se desejo autenticar uma credencial de nível 2, minha requisição deve ir com 5 cabeçalhos:

- Duas pertencente a credencial do nível 1.
- Duas pertencente a credencial do nível 2.
- E o cabeçalho x-sauth-time.

## O que este repositório possui:

Uma aplicação escrita em javascript utilizando o [MEAN.JS](http://meanjs.org/) que implementa esse protocolo de uma forma genérica, onde é capaz, utilizando um GUI ou uma [Admin API](#admin-api), cadastrar níveis de autenticação e credenciais para cada nível além de oferecer também um endpoint da API capaz de autenticar uma requisição que utiliza o protocolo.

Essa aplicação possui um sistema de login e criação de conta para acesso ao GUI, por email ou por alguma rede social, para sua configuração adicione nos arquivos sua credenciais de aplicativos das redes sociais:
- ./config/env/development.js
- ./config/env/production.js
- ./config/env/secure.js

A API da aplicação é pública, por isso, cuide de restringir o acesso a porta da aplicação.

As seções seguintes lhe ensina como instanciar a aplicaçã tal como as rotas das [Admin API](#admin-api).

## Before You Begin
Before you begin we recommend you read about the basic building blocks that assemble a MEAN.JS application: 

* MongoDB - Go through [MongoDB Official Website](http://mongodb.org/) and proceed to their [Official Manual](http://docs.mongodb.org/manual/), which should help you understand NoSQL and MongoDB better.
* Express - The best way to understand express is through its [Official Website](http://expressjs.com/), which has a [Getting Started](http://expressjs.com/starter/installing.html) guide, as well as an [ExpressJS Guide](http://expressjs.com/guide/error-handling.html) guide for general express topics. You can also go through this [StackOverflow Thread](http://stackoverflow.com/questions/8144214/learning-express-for-node-js) for more resources.
* AngularJS - Angular's [Official Website](http://angularjs.org/) is a great starting point. You can also use [Thinkster Popular Guide](http://www.thinkster.io/), and the [Egghead Videos](https://egghead.io/).
* Node.js - Start by going through [Node.js Official Website](http://nodejs.org/) and this [StackOverflow Thread](http://stackoverflow.com/questions/2353818/how-do-i-get-started-with-node-js), which should get you going with the Node.js platform in no time.


## Prerequisites
Make sure you have installed all these prerequisites on your development machine.
* Node.js - [Download & Install Node.js](http://www.nodejs.org/download/) and the npm package manager, if you encounter any problems, you can also use this [GitHub Gist](https://gist.github.com/isaacs/579814) to install Node.js.
* MongoDB - [Download & Install MongoDB](http://www.mongodb.org/downloads), and make sure it's running on the default port (27017).
* Bower - You're going to use the [Bower Package Manager](http://bower.io/) to manage your front-end packages, in order to install it make sure you've installed Node.js and npm, then install bower globally using npm:

```
$ npm install -g bower
```

* Grunt - You're going to use the [Grunt Task Runner](http://gruntjs.com/) to automate your development process, in order to install it make sure you've installed Node.js and npm, then install grunt globally using npm:

```
$ sudo npm install -g grunt-cli
```

## Quick Install
Once you've downloaded the boilerplate and installed all the prerequisites, you're just a few steps away from starting to use the SAUTH application.

The first thing you should do is install the Node.js dependencies. The boilerplate comes pre-bundled with a package.json file that contains the list of modules you need to start your application, to learn more about the modules installed visit the NPM & Package.json section.

To install Node.js dependencies you're going to use npm again, in the application folder run this in the command-line:

```
$ npm install
```

This command does a few things:
* First it will install the dependencies needed for the application to run.
* If you're running in a development environment, it will then also install development dependencies needed for testing and running your application.
* Finally, when the install process is over, npm will initiate a bower install command to install all the front-end modules needed for the application

## Running Your Application
After the install process is over, you'll be able to run your application using Grunt, just run grunt default task:

```
$ grunt
```

Your application should run on the 3000 port so in your browser just go to [http://localhost:3000](http://localhost:3000)
                            
That's it! your application should be running by now, to proceed with your development check the other sections in this documentation. 
If you encounter any problem try the Troubleshooting section.

## Development and deployment With Docker

* Install [Docker](http://www.docker.com/)
* Install [Fig](https://github.com/orchardup/fig)

* Local development and testing with fig: 
```bash
$ fig up
```

* Local development and testing with just Docker:
```bash
$ docker build -t mean .
$ docker run -p 27017:27017 -d --name db mongo
$ docker run -p 3000:3000 --link db:db_1 mean
$
```

* To enable live reload forward 35729 port and mount /app and /public as volumes:
```bash
$ docker run -p 3000:3000 -p 35729:35729 -v /Users/mdl/workspace/mean-stack/mean/public:/home/mean/public -v /Users/mdl/workspace/mean-stack/mean/app:/home/mean/app --link db:db_1 mean
```

## Running in a secure environment
To run your application in a secure manner you'll need to use OpenSSL and generate a set of self-signed certificates. Unix-based users can use the following commnad: 
```
$ sh generate-ssl-certs.sh
```
Windows users can follow instructions found [here](http://www.websense.com/support/article/kbarticle/How-to-use-OpenSSL-and-Microsoft-Certification-Authority)
To generate the key and certificate and place them in the *config/sslcert* folder.

## Admin API

## Credential
### Read data of a Credential
```
GET /credentials/:id
```

#### Parameters

| Name | Type	| Description		|
| ---- | ------ | ------------------|
| id   | String| The Credential ID  |

#### Examples

CURL example:
```
 curl -i -X GET http://localhost:3000/credentials/4711
```

#### Success Response
Success-Response (example):
```
 HTTP/1.1 200 OK
 {
    "_id": 4711,
    "description": "Credential of a application X",
    "token": "4125613241792683124asdqweUOQKWOEK",
    "level": {
    	"_id": 4332,
    	"name":"Application",
    	"order": 1
	},
	"ref": 3456
 }
```

#### Error Response
Error-Response (example):
```
 HTTP/1.1 400 Bad Request
 {
    "message": "The error description"
 }
```

### Create a Credential
```
POST /credentials
```

#### Parameters

| Name 			| Type	 	| Description		  |
| ------------- | ------ 	| ------------------ |
| description   | String 	| The Credential description  |
| level         | ObjectId 	| The Credential level ID  |
| ref   		| String 	| The Credential custom code to ref a third-party system  |

#### Examples

CURL example:
```
 curl -i -X POST http://localhost:3000/credentials
 		-H 'Content-Type: application/json' \
        -d '{ 
        		"description": "Credential of a application Y",
        		"level" : "4332",
        		"ref" : "3457"
       		}'
```

#### Success Response
Success-Response (example):
```
 HTTP/1.1 200 OK
 {
    "_id": 4712,
    "description": "Credential of a application Y",
    "token": "4125613241792683124asdqwe",
    "level": "4332",
	"ref": 3457
 }
```

#### Error Response
Error-Response (example):
```
 HTTP/1.1 400 Bad Request
 {
    "message": "The error description"
 }
```

### Remove a Credential
```
DELETE /credentials/:id
```

#### Parameters

| Name | Type	| Description		|
| ---- | ------ | ------------------|
| id   | String| The Credential ID  |

#### Examples

CURL example:
```
 curl -i -X DELETE http://localhost:3000/credentials/4711
```

#### Success Response
Success-Response (example):
```
 HTTP/1.1 200 OK
 {
    "_id": 4711,
    "description": "Credential of a application X",
    "token": "4125613241792683124asdqweUOQKWOEK",
    "level": {
    	"_id": 4332,
    	"name":"Application",
    	"order": 1
	},
	"ref": 3456
 }
```

#### Error Response
Error-Response (example):
```
 HTTP/1.1 400 Bad Request
 {
    "message": "The error description"
 }
```

### Update a Credential
```
PUT /credentials/:id
```

#### Parameters

| Name | Type	| Description		|
| ---- | ------ | ------------------|
| id   | String| The Credential ID  |
| description   | String 	| The Credential description  |
| level         | ObjectId 	| The Credential level ID  |
| ref   		| String 	| The Credential custom code to ref a third-party system  |

#### Examples

CURL example:
```
  curl -i -X PUT http://localhost:3000/credentials/4172
 		-H 'Content-Type: application/json' \
        -d '{ 
        		"description": "Credential of a application Y2",
       		}'
```

#### Success Response
Success-Response (example):
```
 HTTP/1.1 200 OK
 {
    "_id": 4712,
    "description": "Credential of a application Y2",
    "token": "4125613241792683124asdqweUOQKWOEK",
    "level": {
    	"_id": 4332,
    	"name":"Application",
    	"order": 1
	},
	"ref": 3456
 }
```

#### Error Response
Error-Response (example):
```
 HTTP/1.1 400 Bad Request
 {
    "message": "The error description"
 }
```

### Authenticate a Credential
```
PUT /credentials/authenticate
```

#### Parameters

As described in section [Protocolo](#protocolo).

#### Examples

CURL example:
```
  curl -i -X GET http://localhost:3000/credentials/authenticate
 		-H 'x-sauth-application-key: 4712' \
 		-H 'x-sauth-application-signature: c996517ce02c23eec0ee8ada2ef2d6af29d7295d' \
 		-H 'x-sauth-time: 123'
```

#### Success Response
Success-Response (example):
```
 HTTP/1.1 200 OK
 {
    "message": true
 }
```

#### Error Response
Error-Response (example) if the number of keys is different of the nubmer of signatures:
```
 HTTP/1.1 400 Bad Request
 {
    "message": "number of signatures headers and keys headers do not match"
 }
```

Error-Response (example) if has the credential is the level *n* and is missing the some *n-1* levels header:
```
 HTTP/1.1 400 Bad Request
 {
    "message": "x-sauth-application-signature header missing, level: application"
 }
```

Error-Response (example) if occurrs some error when tries to get the credentials in mongodb:
```
 HTTP/1.1 500 Internal Server Error
 {
    "message": "Ops ! Something is Wrong! When we tries get the credentials"
 }
```

Error-Response (example) if the x-sauth-time is missing:
```
 HTTP/1.1 400 Bad Request
 {
    "message": "x-sauth-time is missing"
 }
```

Error-Response (example) if the signature does not match the given set by the server:
```
 HTTP/1.1 401 Unauthorized
 {
    "message": "Signature with key 4712 is invalid."
 }
```

## Level
### Read data of a Level
```
GET /levels/:id
```

#### Parameters

| Name | Type	| Description		|
| ---- | ------ | ------------------|
| id   | String| The Level ID  |

#### Examples

CURL example:
```
 curl -i -X GET http://localhost:3000/levels/4332
```

#### Success Response
Success-Response (example):
```
 HTTP/1.1 200 OK
 {
    "_id": 4332,
    "name": "Application",
    "order": 1
 }
```

#### Error Response
Error-Response (example):
```
 HTTP/1.1 400 Bad Request
 {
    "message": "The error description"
 }
```

### Create a Level
```
POST /levels
```

#### Parameters

| Name 			| Type	 	| Description		  |
| ------------- | ------ 	| ------------------ |
| name   | String 	| The Level name  |
| order         | Number 	| The Level priority  |

#### Examples

CURL example:
```
 curl -i -X POST http://localhost:3000/levels
 		-H 'Content-Type: application/json' \
        -d '{ 
        		"name": "User",
        		"order" : "2"
       		}'
```

#### Success Response
Success-Response (example):
```
 HTTP/1.1 200 OK
 {
    "_id": 4333,
    "name": "User",
    "order": 2
 }
```

#### Error Response
Error-Response (example):
```
 HTTP/1.1 400 Bad Request
 {
    "message": "The error description"
 }
```

### Remove a Credential
```
DELETE /levels/:id
```

#### Parameters

| Name | Type	| Description		|
| ---- | ------ | ------------------|
| id   | String| The Level ID  |

#### Examples

CURL example:
```
 curl -i -X DELETE http://localhost:3000/levels/4332
```

#### Success Response
Success-Response (example):
```
 HTTP/1.1 200 OK
 {
    "_id": 4332,
    "name": "Application",
    "order": 1
 }
```

#### Error Response
Error-Response (example):
```
 HTTP/1.1 400 Bad Request
 {
    "message": "The error description"
 }
```

### Update a Level
```
PUT /levels/:id
```

#### Parameters

| Name | Type	| Description		|
| ---- | ------ | ------------------|
| id   | String| The Level ID  |
| name   | String 	| The Level name  |
| order         | Number 	| The Level priority  |

#### Examples

CURL example:
```
  curl -i -X PUT http://localhost:3000/levels/4333
 		-H 'Content-Type: application/json' \
        -d '{ 
        		"description": "Browser",
       		}'
```

#### Success Response
Success-Response (example):
```
 HTTP/1.1 200 OK
 {
    "_id": 4333,
    "name": "Browser",
    "order": 2
 }
```

#### Error Response
Error-Response (example):
```
 HTTP/1.1 400 Bad Request
 {
    "message": "The error description"
 }
```
