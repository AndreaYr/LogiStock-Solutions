import { spawn, spawnSync } from 'child_process';
import path from 'path';

// Configuración del túnel basada en tu DBeaver
const KEY_PATH = path.join(process.cwd(), 'src', 'config', 'logistock-key.pem');
const LOCAL_PORT = 5433;
const RDS_ENDPOINT = 'logistock-db.c7c88kyqevhw.us-east-2.rds.amazonaws.com';
const JUMP_HOST = 'ec2-user@3.137.149.26';

console.log('=========================================');
console.log('🚀 Iniciando túnel SSH a base de datos AWS');
console.log('=========================================');

const sshArgs = [
  '-i', KEY_PATH,
  '-o', 'StrictHostKeyChecking=accept-new',
  '-o', 'ExitOnForwardFailure=yes', // Si el puerto ya está en uso, SSH fallará
  '-N',
  '-L', `127.0.0.1:${LOCAL_PORT}:${RDS_ENDPOINT}:5432`,
  JUMP_HOST
];

// Iniciar proceso SSH en segundo plano
const ssh = spawn('ssh', sshArgs);

ssh.stderr.on('data', (data) => {
    const msg = data.toString();
    console.log(`[SSH] ${msg.trim()}`);
    if(msg.includes('Address already in use')) {
        console.log('⚠️  El puerto 5433 ya está en uso. Probablemente DBeaver u otro proceso ya lo tenga.');
    }
});

ssh.stdout.on('data', (data) => {
    console.log(`[SSH] ${data.toString().trim()}`);
});

ssh.on('error', (err) => {
  console.error('❌ Error al iniciar comando SSH:', err.message);
});

// Damos 3 segundos para que el túnel se conecte al servidor remoto
setTimeout(() => {
  console.log('✅ Túnel SSH listo. Iniciando servidor (tsx watch)...');
  
  // Ejecuta la misma tarea que hacía npm run dev originalmente
  const devProcess = spawn('npx', ['tsx', 'watch', 'src/app.ts'], { 
    stdio: 'inherit', // Permite que veamos los console.log del servidor normal
    shell: true
  });

  devProcess.on('exit', (code) => {
    console.log(`\n🛑 Servidor TypeScript detenido (Código ${code}). Cerrando túnel SSH...`);
    ssh.kill();
    process.exit(code || 0);
  });

}, 3000);

// Escuchar evento de cierre de consola (Ej: Ctrl+C)
const handleExit = () => {
    console.log('\n🛑 Cerrando entorno de desarrollo...');
    ssh.kill();
    process.exit(0);
};

process.on('SIGINT', handleExit);
process.on('SIGTERM', handleExit);
process.on('exit', () => {
    ssh.kill();
});
