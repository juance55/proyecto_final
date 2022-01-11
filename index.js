const activo = require('./app')

async function main(){
await activo.listen(activo.get("port"));
console.log("Server on port", activo.get("port"));
}

main();