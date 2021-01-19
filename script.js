const {google} = require('googleapis');
const keys = require('./keys.json');
const http = require("http");
const https = require("https");
const { type } = require('os');
const { lutimesSync } = require('fs');

const client = new google.auth.JWT(
	keys.client_email,null,keys.private_key,['https://www.googleapis.com/auth/spreadsheets']
);

client.authorize(function(err,tokens){
	if(err){
		console.log(err);
		return;
	}

	else{
		console.log('connected');

		let pokearr=[];
		getPokemon()
			.then(response=>{
				let data = response.results;
				//console.log(data);
				for(let i=0;i<data.length;i++){
					let flag=false;
					let typehold='';
					
					getPokemon2(data[i].url)
					.then(pokes2=>{
						let Poke = {
							id:'',
							name:'',
							type:'',
							height:'',
							weight:'',
							ability:'',
						};

						Poke.id=pokes2.id;
						Poke.name=pokes2.name;
						Poke.type=pokes2.types[0].type.name;
						Poke.height=(pokes2.height);
						Poke.weight=(pokes2.weight);
						Poke.ability=(pokes2.abilities[0].ability.name);

						pokearr.push(Poke);

						//console.log(pokearr);


						gsrun(client,pokearr);
					})
				
			
			
				}

			})
			.catch(error=>{
    		console.log(error);
			})
	}
});


function getPokemon(){
    return new Promise((resolve,reject)=>{
	https.get('https://pokeapi.co/api/v2/pokemon?limit=30', (resp) => {
			let data = '';
			resp.on('data',(chunk)=>{
				data+= chunk;
			});

			resp.on('end',()=>{
                let convdata = JSON.parse(data);
                resolve(convdata);
			});
		}).on('error',(error)=>{
			reject(`Got error: ${e.message}`);
        });
    })
}

function getPokemon2(url){
    return new Promise((resolve,reject)=>{
	https.get(url, (resp) => {
			let data = '';
			resp.on('data',(chunk)=>{
				data+= chunk;
			});

			resp.on('end',()=>{
				let convdata = JSON.parse(data);
                resolve(convdata);
			});
		}).on('error',(error)=>{
			reject(`Got error: ${e.message}`);
        });
    })
}


async function gsrun(cl,pokes){
	const gsapi = google.sheets({version:'v4',auth:cl});

	const opt = {
		spreadsheetId: '1QqabbhuttIIpsfNVI5_IjLri02bZlcX6FCgJocnp8gY',
		range:'Data!A1:B6'
	};

	let lines=[['Id','Name','Type','Height (dm)','Weight (hg)','Ability']];
	let line=[];

	for(let i=0;i<pokes.length;i++)
	{
		line=[];
		line.push(pokes[i].id);
		line.push(pokes[i].name);
		line.push(pokes[i].type);
		line.push(pokes[i].height);
		line.push(pokes[i].weight);
		line.push(pokes[i].ability);
		lines.push(line);
	}

	let dataArray = lines;
	let newDataArray = dataArray.map(function(r){ 
		return r;
	});

	const updateOptions = {
		spreadsheetId: '1QqabbhuttIIpsfNVI5_IjLri02bZlcX6FCgJocnp8gY',
		range:'Data!A1',
		valueInputOption:'USER_ENTERED',
		resource: {values:newDataArray}
	};

	let res = await gsapi.spreadsheets.values.update(updateOptions);
}



