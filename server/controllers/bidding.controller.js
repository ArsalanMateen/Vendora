import { Server } from 'socket.io';
export default httpServer => { const io = new Server(httpServer,{cors:{origin:'*',methods:['GET','POST']}}); io.on('connection',socket=>{socket.on('join auction room',data=>socket.join(data.room));socket.on('leave auction room',data=>socket.leave(data.room));}); return io; };
